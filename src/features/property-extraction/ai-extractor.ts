import { propertySchema, Property } from "./schema";
import { checkQuotaAndConsume } from "@/features/property-extraction/ai-rate-limiter";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "langchain";
import logger from "@/lib/logger";

const DEFAULT_GOOGLE_MODEL = "gemini-2.5-flash";

// AI fills in data what it can identify and return in format based on output guardrail.
async function extractStructuredData(
  page: any,
  cleanText: string,
  knownData: Partial<Property> = {},
  scrapeUrl?: string,
  signal?: { aborted: boolean },
): Promise<{ data: Partial<Property>; tokens: number }> {
  // Pull all JSON-LD script blocks from the page
  const jsonLdData = await page.evaluate(() => {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    );
    return scripts.map((s) => s.textContent).join("\n\n");
  });

  const urlLabel = scrapeUrl ?? "(unknown URL)";
  // logger.info("\n" + "=".repeat(60));
  // logger.info(`JSON-LD DATA — ${urlLabel}`);
  // logger.info("=".repeat(60));
  // logger.info(
  //   `script blocks joined length (chars): ${jsonLdData?.length ?? 0}`,
  // );
  // logger.info(
  //   jsonLdData?.trim()
  //     ? jsonLdData
  //     : "(empty — no application/ld+json or blank)",
  // );
  // logger.info("=".repeat(60) + "\n");

  // Nothing to work with — skip the API call
  if ((!jsonLdData || jsonLdData.length < 50) && !cleanText)
    return { data: {}, tokens: 0 };

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;

  if (!apiKey) {
    logger.error(
      "❌ [AI Error] GOOGLE_GENERATIVE_AI_API_KEY is missing from .env!",
    );
    return { data: {}, tokens: 0 };
  }

  // logger.info(`[AI] Using API Key: ${apiKey.slice(0, 5)}...`);
  // logger.info(`[AI] Using Model: ${modelName}`);

  try {
    const prompt = `
         You are a Real Estate Data Specialist. 
         I will provide you with raw JSON-LD blocks and the full text content from a property listing.
         
         TASK:
         1. Scrutinize EVERY JSON-LD block and the provided page text.
         2. Extract all available property details into the provided schema.
                  3. **PRIORITY FIELDS**: Ensure you extract the following if present:
            - Property Name (propertyTitle)
            - Price & Market Price (CRITICAL: You MUST extract this even if you have to infer it from unstructured text like '1.5 Crores'. Do not leave it empty if the value exists anywhere.)
            - Carpet Area / Internal Floor Area (IMPORTANT: DO NOT copy Built-up or Super Built-up area here. If Carpet Area is not explicitly stated, leave it blank/null. Include the unit if found.)
            - Built-up Area (IMPORTANT: Include the unit, e.g. "sqm", "sqyd", "sqft")
            - Super Built-up Area (IMPORTANT: Include the unit, e.g. "sqm", "sqyd", "sqft". **CRITICAL**: If the property specifies an area but does not explicitly state whether it is Carpet, Built-up or Super Built-up, you MUST default to putting it here in superBuiltupArea.)
            - Total Area (IMPORTANT: Include the unit, e.g. "sqm", "sqyd", "sqft")
            - Rate per Area (pricePerSqft) (IMPORTANT: Include the unit, e.g. "/sqm", "/sqyd", "/sqft")
            - Building Age (ageOfBuilding)
            - Locality (location) (CRITICAL: You MUST extract this. Do not leave it empty if the value exists anywhere in the text. Extract the neighborhood/locality and the city name, e.g., 'Sector 17 Vashi, Navi Mumbai'. Do not include flat numbers, building names, or detailed street info here.)
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

    if (signal?.aborted) return { data: {}, tokens: 0 };
    const response = await structedLlm.invoke(prompt);

    const rawMessage = response.raw as any;
    const usage =
      rawMessage.usage_metadata || rawMessage.response_metadata?.tokenUsage;
    const tokens = usage ? usage.total_tokens || usage.totalTokens : 0;

    const data = response.parsed || {};

    if (data && Object.keys(data).length > 0) {
      logger.info(
        `✨ [STEP 4] AI Structured Data Extracted! Tokens Used: ${tokens}`,
      );
    }

    return { data, tokens };
  } catch (err: any) {
    logger.error("\n❌ [AI Error] Extraction failed!");
    logger.error(`Reason: ${err.message}`);
    if (err.stack) logger.error(err.stack);
    return { data: {}, tokens: 0 };
  }
}

interface VisionParams {
  url: string;
  screenshotBuffer: Buffer;
  missingCritical: readonly string[];
  cleanDeterministic: Record<string, any>;
  cleanText: string;
  signal?: { aborted: boolean };
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
  signal,
}: VisionParams): Promise<VisionResult> {
  const visionApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const visionModelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;

  if (!visionApiKey) {
    logger.info("[AI] Vision skipped: GOOGLE_GENERATIVE_AI_API_KEY not set");
    return { aiData: {}, visionUsed: false, tokens: 0 };
  }

  try {
    // logger.info(`[AI] Attempting Vision extraction for: ${url}`);
    // logger.info(`[AI] Vision Model: ${visionModelName}`);

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

    if (signal?.aborted) return { aiData: {}, visionUsed: false, tokens: 0 };
    const response = await structedLlm.invoke([message]);

    const rawMessage = response.raw as any;
    const usage =
      rawMessage.usage_metadata || rawMessage.response_metadata?.tokenUsage;
    const tokens = usage ? usage.total_tokens || usage.totalTokens : 0;

    // logger.info("\n--- LOG 3.5: AI VISION RESULT (From Screenshot) ---");
    // logger.info(JSON.stringify(response.parsed, null, 2));
    // logger.info("--------------------------------------------------\n");
    // logger.info("✅ [AI] Vision extraction successful!");

    return {
      aiData: response.parsed,
      visionUsed: true,
      tokens,
    };
  } catch (aiError: any) {
    logger.error("❌ [AI Vision Error]:", aiError.message);
    return { aiData: {}, visionUsed: false, tokens: 0 };
  }
}

export { extractStructuredData, runVisionExtraction };
