import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/auth/auth";

export async function POST(req: Request) {
  process.env.GOOGLE_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  try {
    const sessionData = await auth.api.getSession({ headers: await headers() });
    if (!sessionData) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = sessionData.user.id;

    const { query } = await req.json();

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 },
      );
    }

    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start background agent
    (async () => {
      try {


        const testMode = true; // Set this to false to restore the original AI agent flow

        if (testMode) {
          const writeMsg = async (msg: string) => {
            await writer.write(
              encoder.encode(
                JSON.stringify({ type: "message", content: msg }) + "\n",
              ),
            );
          };

          await writeMsg("Starting Playwright test (No AI)...");

          const testUrls = [
            "https://housing.com/in/buy/navi-mumbai/sector-17-vashi-gid/?utm_source=google&utm_medium=cpc&utm_campaign=DSA_City_Mumbai_MobDesk_LocalitySearchTerms&utm_term=&gad_source=1&gad_campaignid=16823650546&gbraid=0AAAAADqjP_SvVTouR3r88_Ku5t-U0QFye&gclid=Cj0KCQjw3K7RBhDJARIsAKRtP5S8DurT0Lp4qjuhsMoF2dhjw0gr980ckvNby5SHSuCfWtFtCYLpj4AaAqRHEALw_wcB",
            "https://www.99acres.com/flats-in-sector-17-vashi-navi-mumbai-ffid?isSecondaryExpansionRequired=true&nn_source=Performance&nn_account=Google_99acres-generic-new&nn_campaign=2057566963_75814568093_378999981074&nn_medium=2057566963_75814568093_378999981074&nn_adtype=g_&nn_keyword=&nn_placement=&gad_source=1&gad_campaignid=2057566963&gbraid=0AAAAADLswZUIGK6VRACuYb3i2Sloz737a&gclid=Cj0KCQjw3K7RBhDJARIsAKRtP5QhbxRdGNxJylAjal1UV3rQintRfUq47VraY-zXp0y8cHt-6oUoOGwaApfIEALw_wcB",
            "https://www.magicbricks.com/independent-house-for-sale-in-sector-17-vashi-navi-mumbai-pppfs",
            "https://www.nobroker.in/1bhk-flats-for-sale-in-sector_17_vashi_mumbai",
            "https://www.magicbricks.com/1-bhk-flats-in-sector-17-vashi-navi-mumbai-for-sale-pppfs",
            "https://www.squareyards.com/sale/apartments-for-sale-in-vashi-sector-17-navi-mumbai",
            "https://www.nobroker.in/1bhk-flats-for-sale-near-kuber_chs_mumbai"
          ];

          const { createIsolatedContext } =
            await import("@/features/property-extraction/scraper");

          await writeMsg("Launching Chromium context...");
          let context;
          let collectedUrls: string[] = [];

          try {
            context = await createIsolatedContext();
            
            for (const url of testUrls) {
              await writeMsg(`\n--- TESTING URL: ${url.substring(0, 50)}... ---`);
              const page = await context.newPage();

              await writeMsg("Navigating to URL...");
              await page.goto(url, {
                waitUntil: "domcontentloaded",
                timeout: 30000,
              });
              await page.waitForTimeout(2000);

              const title = await page.title();
              await writeMsg(`Page loaded! Title: "${title}"`);

              await writeMsg("Extracting page content to check for blocks...");
              const pageText = await page.evaluate(() => {
                return document.body
                  ? document.body.innerText.substring(0, 1000)
                  : "No body found";
              });
              await writeMsg(
                `\n--- PAGE CONTENT START ---\n${pageText}\n--- PAGE CONTENT END ---\n`,
              );

              await writeMsg("Extracting links...");
              const links = await page.evaluate(() => {
                const anchors = Array.from(document.querySelectorAll("a"));
                return anchors
                  .map((a) => a.href)
                  .filter((href) => href && href.startsWith("http"));
              });

              await writeMsg(`Found ${links.length} total links on page.`);
              if (collectedUrls.length === 0) {
                collectedUrls = links.slice(0, 10); // Return first 10 for testing
              }
              await page.close();
            }
            await writeMsg("Test completed successfully!");
          } catch (err: any) {
            await writeMsg(`PLAYWRIGHT ERROR: ${err.message}`);
            console.error(err);
          } finally {
            if (context) await context.close().catch(() => {});
          }

          // Send final URLs back to client
          await writer.write(
            encoder.encode(
              JSON.stringify({
                type: "done",
                urls: collectedUrls,
              }) + "\n",
            ),
          );
          return;
        }

        let collectedUrls: string[] = [];
        let accumulatedText = "";

        const config = {
          configurable: {
            thread_id: crypto.randomUUID(),
            userId,
            streamWriter: writer,
          },
        };
        const { orchestratorAgent } =
          await import("@/features/property-search/agents");
        const agentStream = await orchestratorAgent.stream(
          {
            messages: [
              {
                role: "user",
                content: `Please search for "${query}". Find a search listing page, extract the individual property links, and pass them to the scrape tool.`,
              },
            ],
          },
          { ...config, streamMode: "values" },
        );

        for await (const chunk of agentStream) {
          const latestMessage = chunk.messages.at(-1) as any;

          if (latestMessage?.content) {
            const contentStr =
              typeof latestMessage.content === "string"
                ? latestMessage.content
                : JSON.stringify(latestMessage.content);
            accumulatedText += "\n" + contentStr;
            await writer.write(
              encoder.encode(
                JSON.stringify({
                  type: "message",
                  content: latestMessage.content,
                }) + "\n",
              ),
            );
          } else if (latestMessage?.tool_calls?.length > 0) {
            const toolCallNames = latestMessage.tool_calls.map(
              (tc: any) => tc.name,
            );
            await writer.write(
              encoder.encode(
                JSON.stringify({
                  type: "action",
                  action: `Calling tools: ${toolCallNames.join(", ")}`,
                }) + "\n",
              ),
            );

            // Check if it's our final collection tool
            for (const tc of latestMessage.tool_calls) {
              if (
                tc.name === "scrape_property_details" &&
                tc.args?.detailUrls
              ) {
                collectedUrls = tc.args.detailUrls;
              }
            }
          }
        }

        // Send final URLs back to client
        if (collectedUrls.length === 0) {
          const urlRegex = /(https?:\/\/[^\s'"\]]+)/g;
          const matches = accumulatedText.match(urlRegex) || [];
          collectedUrls = Array.from(new Set(matches));
        }
        // Send final URLs back to client
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "done",
              urls: collectedUrls,
            }) + "\n",
          ),
        );
      } catch (error: any) {
        await writer.write(
          encoder.encode(
            JSON.stringify({
              type: "error",
              error: error.message,
            }) + "\n",
          ),
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
