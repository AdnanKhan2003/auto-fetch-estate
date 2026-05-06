import fs from "fs";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { propertySchema, Property } from "./schema";

const DEFAULT_GOOGLE_MODEL = "gemini-2.5-flash";

// ─────────────────────────────────────────────────────────────────────────────
// Text Extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Uses a Gemini text model to fill schema fields from JSON-LD blocks and
 * raw page text. Returns whatever the model can extract; returns {} on failure.
 */
export async function extractStructuredData(
  page: any,
  cleanText: string,
  knownData: Partial<Property> = {},
  scrapeUrl?: string,
): Promise<Partial<Property>> {
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
  console.log(`script blocks joined length (chars): ${jsonLdData?.length ?? 0}`);
  console.log(
    jsonLdData?.trim() ? jsonLdData : "(empty — no application/ld+json or blank)",
  );
  console.log("=".repeat(60) + "\n");

  // Nothing to work with — skip the API call
  if ((!jsonLdData || jsonLdData.length < 50) && !cleanText) return {};

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;

  if (!apiKey) {
    console.error("❌ [AI Error] GOOGLE_GENERATIVE_AI_API_KEY is missing from .env!");
    return {};
  }

  console.log(`[AI] Using API Key: ${apiKey.slice(0, 5)}...`);
  console.log(`[AI] Using Model: ${modelName}`);

  const googleProvider = createGoogleGenerativeAI({ apiKey });

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
            - Carpet Area / Internal Floor Area
            - Total Area
            - Rate per Sqft (pricePerSqft)
            - Building Age (ageOfBuilding)
            - Locality (location)
            - Vertical Position (floorNo)
            - Cardinal Facing (facing)
            - Furnishing Status
            - Legal Status (reraApproved/reraNumber)
            - Owner Name (ownerName)
         4. Look for patterns like "Lac", "Cr", "sqft", "BHK", "Ready to move", "X years old", etc.
         5. Combine data from both sources to get the most accurate picture.

         DATA TO ANALYZE (JSON-LD):
         ${jsonLdData.slice(0, 10000)}

         DATA TO ANALYZE (PAGE TEXT):
         ${cleanText.slice(0, 20000)}

         DATA ALREADY FOUND (Selectors):
         ${JSON.stringify(knownData, null, 2)}
      `;

    console.log("--- LOG 2: AI PROMPT & CONTEXT ---");
    console.log(prompt);
    console.log("----------------------------------");

    const { object } = await generateObject({
      model: googleProvider(modelName),
      schema: propertySchema,
      prompt,
    });

    if (object && Object.keys(object).length > 0) {
      console.log("✅ [AI] Extraction successful!");
    }

    console.log("--- LOG 3: AI RESULT ---");
    console.log(JSON.stringify(object, null, 2));
    console.log("------------------------");

    return object;
  } catch (err: any) {
    console.error("\n❌ [AI Error] Extraction failed!");
    console.error(`Reason: ${err.message}`);
    if (err.stack) console.error(err.stack);
    return {};
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vision Fallback
// ─────────────────────────────────────────────────────────────────────────────

interface VisionParams {
  url: string;
  screenshotPath: string;
  missingCritical: readonly string[];
  cleanDeterministic: Record<string, any>;
  cleanText: string;
}

interface VisionResult {
  aiData: Partial<Property>;
  visionUsed: boolean;
}

/**
 * Uses Gemini Vision (screenshot image) to recover fields that text extraction
 * missed. Only called when critical fields are still absent after text AI.
 */
export async function runVisionExtraction({
  url,
  screenshotPath,
  missingCritical,
  cleanDeterministic,
  cleanText,
}: VisionParams): Promise<VisionResult> {
  const visionApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const visionModelName = process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL;

  if (!visionApiKey) {
    console.log("[AI] Vision skipped: GOOGLE_GENERATIVE_AI_API_KEY not set");
    return { aiData: {}, visionUsed: false };
  }

  try {
    console.log(`[AI] Attempting Vision extraction for: ${url}`);
    console.log(`[AI] Vision Model: ${visionModelName}`);

    const screenshotBuffer = fs.readFileSync(screenshotPath);
    const visionGoogle = createGoogleGenerativeAI({ apiKey: visionApiKey });

    const { object } = await generateObject({
      model: visionGoogle(visionModelName),
      schema: propertySchema,
      messages: [
        {
          role: "user",
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
              type: "image",
              image: screenshotBuffer,
              mimeType: "image/png",
            } as any,
          ],
        },
      ],
    });

    console.log("\n--- LOG 3.5: AI VISION RESULT (From Screenshot) ---");
    console.log(JSON.stringify(object, null, 2));
    console.log("--------------------------------------------------\n");
    console.log("✅ [AI] Vision extraction successful!");

    return { aiData: object, visionUsed: true };
  } catch (aiError: any) {
    console.error("❌ [AI Vision Error]:", aiError.message);
    return { aiData: {}, visionUsed: false };
  }
}
