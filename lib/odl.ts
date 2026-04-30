import path from "path";
import fs from "fs";
import { chromium } from "playwright";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export const propertySchema = z.object({
  // Basic Information
  propertyTitle: z
    .string()
    .nullable()
    .describe("The title of the property listing."),
  propertyType: z
    .string()
    .nullable()
    .describe("e.g., Flat, Villa, Apartment, Office."),
  bhkType: z.string().nullable().describe("e.g., 1BHK, 2BHK, 3BHK."),
  projectType: z.string().nullable().describe("e.g., Residential, Commercial."),

  // Location Details
  location: z
    .string()
    .nullable()
    .describe("The neighborhood, locality, or city."),
  address: z.string().nullable().describe("The full address of the property."),
  city: z
    .string()
    .nullable()
    .describe("The city where the property is located."),
  nearbyLandmarks: z
    .array(z.string())
    .describe(
      "List of nearby landmarks like schools, hospitals, metro stations.",
    ),

  // Pricing and Financials
  price: z
    .string()
    .nullable()
    .describe("The total price of the property, e.g., $450,000 or ₹ 1.5 Cr."),
  pricePerSqft: z
    .string()
    .nullable()
    .describe("The price per square foot, e.g., ₹84,307 per sqft."),
  priceRange: z
    .string()
    .nullable()
    .describe(
      "Price range for different configurations, e.g., ₹1.50 Cr - ₹2.23 Cr.",
    ),
  estimatedEMI: z
    .string()
    .nullable()
    .describe("Estimated monthly EMI, e.g., ₹71K EMI."),
  negotiable: z
    .boolean()
    .nullable()
    .describe("Indicates if the price is negotiable."),
  bookingAmount: z
    .string()
    .nullable()
    .describe("The booking amount for the property."),
  maintenanceCharges: z
    .string()
    .nullable()
    .describe("Monthly maintenance charges."),

  // Property Specifications
  area: z
    .string()
    .nullable()
    .describe(
      "The size/area of the property, e.g., 1200 sqft. Can be Carpet Area, Built-up Area, or Super Area.",
    ),
  floorNo: z
    .string()
    .nullable()
    .describe("The floor number, e.g., 5th floor or 50 out of 65."),
  totalFloors: z
    .number()
    .nullable()
    .describe("Total number of floors in the building."),
  furnishingStatus: z
    .string()
    .nullable()
    .describe("e.g., Unfurnished, Semi-furnished, Fully furnished."),
  numberOfBathrooms: z.number().nullable().describe("Number of bathrooms."),
  numberOfBalconies: z.number().nullable().describe("Number of balconies."),
  facing: z
    .string()
    .nullable()
    .describe("Direction the property faces, e.g., East, North-East."),
  overlooking: z
    .string()
    .nullable()
    .describe(
      "What the property overlooks, e.g., Garden/Park, Pool, Main Road.",
    ),
  carParking: z
    .string()
    .nullable()
    .describe("Car parking availability and type, e.g., 1 Covered, 1 Open."),
  flooringType: z
    .string()
    .nullable()
    .describe("Type of flooring, e.g., Vitrified, Cement."),

  // Status and Timeline
  constructionStatus: z
    .string()
    .nullable()
    .describe("e.g., Ready to Move, Under Construction."),
  possessionDate: z
    .string()
    .nullable()
    .describe("Expected possession date, e.g., Dec '27."),
  postedDate: z
    .string()
    .nullable()
    .describe("Date the property was posted, e.g., Posted Yesterday."),
  ageOfBuilding: z
    .string()
    .nullable()
    .describe("Age of the building, e.g., 3-5 years."),
  launchDate: z.string().nullable().describe("Project launch date."),

  // Project Details
  projectName: z
    .string()
    .nullable()
    .describe("Name of the project or society."),
  developerName: z
    .string()
    .nullable()
    .describe("Name of the developer or builder."),
  totalUnits: z
    .number()
    .nullable()
    .describe("Total number of units in the project."),
  projectSize: z
    .string()
    .nullable()
    .describe("Size of the project, e.g., 1 Acre."),
  popularityRank: z
    .string()
    .nullable()
    .describe(
      "Popularity rank in the locality, e.g., 2/27 in Popularity in Jogeshwari East.",
    ),

  // Verification and Legal
  reraApproved: z
    .boolean()
    .nullable()
    .describe("Indicates if the property is RERA approved."),
  reraNumber: z.string().nullable().describe("RERA registration number."),
  verifiedTag: z
    .boolean()
    .nullable()
    .describe("Indicates if the listing is verified by the platform."),
  loanVerified: z
    .boolean()
    .nullable()
    .describe("Indicates if the property loan is verified."),
  ownershipType: z
    .string()
    .nullable()
    .describe("e.g., Freehold, Leasehold, Self Owned."),
  legalCertificatesAvailable: z
    .boolean()
    .nullable()
    .describe("Indicates if legal certificates are available."),
  brochureDownload: z
    .boolean()
    .nullable()
    .describe("Indicates if a brochure is available for download."),

  // Amenities
  amenities: z
    .array(z.string())
    .describe(
      "List of amenities like Pool, Gym, Parking, Clubhouse, Meditation Area, etc.",
    ),

  // Seller Information
  sellerType: z
    .string()
    .nullable()
    .describe("Type of seller, e.g., Owner, Agent, Builder."),
  agentName: z.string().nullable().describe("Name of the agent."),
  contactDetails: z
    .string()
    .nullable()
    .describe("Contact information for the seller/agent."),
  responseRate: z.string().nullable().describe("Seller response rate."),
  buyersServed: z
    .string()
    .nullable()
    .describe("Number of buyers served by the agent/builder."),

  // Engagement and Scores
  uniqueViews: z
    .number()
    .nullable()
    .describe("Number of unique views on the listing."),
  shortlists: z
    .number()
    .nullable()
    .describe("Number of times the property was shortlisted."),
  contactsMade: z
    .number()
    .nullable()
    .describe("Number of contacts made for the property."),
  livabilityScore: z
    .number()
    .nullable()
    .describe("Livability score of the locality."),
  transitScore: z
    .number()
    .nullable()
    .describe("Transit score of the locality."),
  safetyScore: z.number().nullable().describe("Safety score of the locality."),

  // Visuals
  numberOfPhotos: z
    .number()
    .nullable()
    .describe("Number of photos available for the property."),
  videoTourAvailable: z
    .boolean()
    .nullable()
    .describe("Indicates if a video tour is available."),
});

export type Property = z.infer<typeof propertySchema>;

// export async function processUrl(url: string[]) {
export async function processUrl(url: string) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    const screenshotName = `screenshot-${Date.now()}.png`;
    const screenshotpath = path.join(
      process.cwd(),
      "public",
      "screenshots",
      screenshotName,
    );

    if (!fs.existsSync(path.dirname(screenshotpath))) {
      fs.mkdirSync(path.dirname(screenshotpath), { recursive: true });
    }
    await page.screenshot({ path: screenshotpath, fullPage: true });

    const rawText = await page.evaluate(() => document.body.innerText);

    const { object: propertyData } = await generateObject({
      model: google("gemini-1.5-flash"),
      schema: propertySchema,
      prompt: `
        # ROLE
        You are a specialized Real Estate Data Extraction API. Your goal is to extract structured information from the provided raw website text with high precision.

        # INSTRUCTIONS
        1. Analyze the text below and extract details according to the provided schema.
        2. If a specific field is not mentioned or cannot be inferred with 95% certainty, return null.
        3. Clean strings: Remove excessive whitespace or garbage characters from the extracted text.
        4. Normalize pricing: Ensure currency symbols are preserved (e.g., ₹ or $).

        # CONTEXTUAL CLUES
        - Look for labels like "Carpet Area", "Super Area", or "Built-up" for the 'area' field.
        - RERA status is often in the footer or a sidebar.
        - Amenities are usually listed in a bulleted section or near the "Project Features".

        # SOURCE TEXT
        ${rawText.slice(0, 40000)}
        `,
    });

    return {
      url,
      screenshotUrl: `/screenshots/${screenshotName}`,
      data: propertyData,
      status: "success",
    };
  } catch (error: any) {
    console.error(`Failed to process ${url}: `, error);
    return { url, status: "error", error: error.message };
  } finally {
    await browser.close();
  }
}
