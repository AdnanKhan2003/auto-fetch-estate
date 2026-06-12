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
