import { propertySchema, Property } from "./schema";
import { checkQuotaAndConsume } from "@/features/property-extraction/ai-rate-limiter";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "langchain";

const DEFAULT_GOOGLE_MODEL = "gemini-2.5-flash";

// AI fills in data what it can identify and return in format based on output guardrail.
async function extractStructuredData(
  page: any,
  cleanText: string,
  knownData: Partial<Property> = {},
  scrapeUrl?: string,
): Promise<{ data: Partial<Property>; tokens: number }> {
  // Pull all JSON-LD script blocks from the page
  const jsonLdData = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.map((s) => s.textContent).join("\n\n");
  });

  const urlLabel = scrapeUrl ?? "(unknown URL)";
  console.log("\n" + "=".repeat(60));
  console.log(`JSON-LD DATA — ${urlLabel}`);
  console.log("=".repeat(60));
  console.log(
    `script blocks joined length (chars): ${jsonLdData?.length ?? 0}`,
  );
  console.log(
    jsonLdData?.trim()
      ? jsonLdData
      : "(empty — no application/ld+json or blank)",
  );
  console.log("=".repeat(60) + "\n");

  // Nothing to work with — skip the API call
  if ((!jsonLdData || jsonLdData.length < 50) && !cleanText)
    return { data: {}, tokens: 0 };

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;

  if (!apiKey) {
    console.error(
      "❌ [AI Error] GOOGLE_GENERATIVE_AI_API_KEY is missing from .env!",
    );
    return { data: {}, tokens: 0 };
  }

  console.log(`[AI] Using API Key: ${apiKey.slice(0, 5)}...`);
  console.log(`[AI] Using Model: ${modelName}`);

  try {
    const prompt = `
         You are a Real Estate Data Specialist. 
         I will provide you with raw JSON-LD blocks and the full text content from a property listing.
         
         TASK:
         1. Scrutinize EVERY JSON-LD block and the provided page text.
         2. Extract all available property details into the provided schema.
         3. **PRIORITY FIELDS**: Ensure you extract the following if present:
            - Property Name (propertyTitle)
            - Price & Market Price
            - Carpet Area / Internal Floor Area (IMPORTANT: DO NOT copy Built-up or Super Built-up area here. If Carpet Area is not explicitly stated, leave it blank/null. Include the unit if found.)
            - Built-up Area (IMPORTANT: Include the unit, e.g. "sqm", "sqyd", "sqft")
            - Super Built-up Area (IMPORTANT: Include the unit, e.g. "sqm", "sqyd", "sqft". **CRITICAL**: If the property specifies an area but does not explicitly state whether it is Carpet, Built-up or Super Built-up, you MUST default to putting it here in superBuiltupArea.)
            - Total Area (IMPORTANT: Include the unit, e.g. "sqm", "sqyd", "sqft")
            - Rate per Area (pricePerSqft) (IMPORTANT: Include the unit, e.g. "/sqm", "/sqyd", "/sqft")
            - Building Age (ageOfBuilding)
            - Locality (location)
            - Vertical Position (floorNo)
            - Cardinal Facing (facing)
            - Furnishing Status
            - Legal Status (reraApproved/reraNumber)
            - Owner Name (ownerName)
         4. **MATH CALCULATION**: If "Rate per Area" (pricePerSqft) is NOT explicitly written on the page, but you have the Total Price and Total Area, you MUST mathematically calculate it yourself (Price / Area) and include it with the unit.
         5. **CATCH-ALL EXTRACTION**: Look for ANY other property features, fees, or data points (e.g., Water Supply, Corner Plot, Brokerage, Pet Rules, Floor Type, Overlooking, Security, etc.). Put ALL of this extra data into the \`additionalFeatures\` dictionary. DO NOT DISCARD ANY DATA.
         6. Combine data from both sources to get the most accurate picture.

         DATA TO ANALYZE (JSON-LD):
         ${jsonLdData.slice(0, 10000)}

         DATA TO ANALYZE (PAGE TEXT):
         ${cleanText.slice(0, 20000)}

         DATA ALREADY FOUND (Selectors):
         ${JSON.stringify(knownData, null, 2)}
      `;

    // await checkQuotaAndConsume();

    const llm = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey,
      maxRetries: 1,
    });

    const structedLlm = llm.withStructuredOutput(propertySchema, {
      name: "extract_property_data",
      includeRaw: true,
    });

    const response = await structedLlm.invoke(prompt);

    const rawMessage = response.raw as any;
    const usage =
      rawMessage.usage_metadata || rawMessage.response_metadata?.tokenUsage;
    const tokens = usage ? usage.total_tokens || usage.totalTokens : 0;

    const data = response.parsed || {};

    if (data && Object.keys(data).length > 0) {
      console.log("✅ [AI] Extraction successful!");
    }

    return { data, tokens };
  } catch (err: any) {
    console.error("\n❌ [AI Error] Extraction failed!");
    console.error(`Reason: ${err.message}`);
    if (err.stack) console.error(err.stack);
    return { data: {}, tokens: 0 };
  }
}

interface VisionParams {
  url: string;
  screenshotBuffer: Buffer;
  missingCritical: readonly string[];
  cleanDeterministic: Record<string, any>;
  cleanText: string;
}

interface VisionResult {
  aiData: Partial<Property>;
  visionUsed: boolean;
  tokens: number;
}

// Uses Gemini Vision (screenshot image) to recover fields that text extraction missed.
async function runVisionExtraction({
  url,
  screenshotBuffer,
  missingCritical,
  cleanDeterministic,
  cleanText,
}: VisionParams): Promise<VisionResult> {
  const visionApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const visionModelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;

  if (!visionApiKey) {
    console.log("[AI] Vision skipped: GOOGLE_GENERATIVE_AI_API_KEY not set");
    return { aiData: {}, visionUsed: false, tokens: 0 };
  }

  try {
    console.log(`[AI] Attempting Vision extraction for: ${url}`);
    console.log(`[AI] Vision Model: ${visionModelName}`);

    const llm = new ChatGoogleGenerativeAI({
      model: visionModelName,
      apiKey: visionApiKey,
      maxRetries: 1,
    });

    const structedLlm = llm.withStructuredOutput(propertySchema, {
      name: "extract_property_data_vision",
      includeRaw: true,
    });

    // await checkQuotaAndConsume();

    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: `
                Extract real estate data from this screenshot and text. 
                Focus on: ${missingCritical.join(", ")}
                Already Found: ${JSON.stringify(cleanDeterministic)}
                Raw Text Preview: ${cleanText.slice(0, 5000)}
              `,
        },
        {
          type: "image_url",
          image_url: {
            url: `data:image/png;base64,${screenshotBuffer.toString("base64")}`,
          },
        } as any,
      ],
    });

    const response = await structedLlm.invoke([message]);

    const rawMessage = response.raw as any;
    const usage =
      rawMessage.usage_metadata || rawMessage.response_metadata?.tokenUsage;
    const tokens = usage ? usage.total_tokens || usage.totalTokens : 0;

    console.log("\n--- LOG 3.5: AI VISION RESULT (From Screenshot) ---");
    console.log(JSON.stringify(response.parsed, null, 2));
    console.log("--------------------------------------------------\n");
    console.log("✅ [AI] Vision extraction successful!");

    return {
      aiData: response.parsed,
      visionUsed: true,
      tokens,
    };
  } catch (aiError: any) {
    console.error("❌ [AI Vision Error]:", aiError.message);
    return { aiData: {}, visionUsed: false, tokens: 0 };
  }
}

export { extractStructuredData, runVisionExtraction };
