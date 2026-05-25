import { z } from "zod";

const propertySchema = z.object({
  // Basic Information
  propertyTitle: z
    .string()
    .nullable()
    .optional()
    .describe("The title of the property listing."),
  propertyType: z
    .string()
    .nullable()
    .optional()
    .describe("e.g., Flat, Villa, Apartment, Office."),
  bhkType: z.string().nullable().optional().describe("e.g., 1BHK, 2BHK, 3BHK."),
  projectType: z.string().nullable().optional().describe("e.g., Residential, Commercial."),

  // Location Details
  location: z
    .string()
    .nullable()
    .optional()
    .describe("The neighborhood, locality, or city."),
  address: z.string().nullable().optional().describe("The full address of the property."),
  city: z
    .string()
    .nullable()
    .optional()
    .describe("The city where the property is located."),
  nearbyLandmarks: z
    .array(z.string())
    .optional()
    .describe(
      "List of nearby landmarks like schools, hospitals, metro stations.",
    ),

  // Pricing and Financials
  price: z
    .string()
    .nullable()
    .optional()
    .describe("The total price of the property, e.g., $450,000 or ₹ 1.5 Cr."),
  pricePerSqft: z
    .string()
    .nullable()
    .optional()
    .describe("The price per square foot, e.g., ₹84,307 per sqft."),
  priceRange: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Price range for different configurations, e.g., ₹1.50 Cr - ₹2.23 Cr.",
    ),
  estimatedEMI: z
    .string()
    .nullable()
    .optional()
    .describe("Estimated monthly EMI, e.g., ₹71K EMI."),
  negotiable: z
    .boolean()
    .nullable()
    .optional()
    .describe("Indicates if the price is negotiable."),
  bookingAmount: z
    .string()
    .nullable()
    .optional()
    .describe("The booking amount for the property."),
  maintenanceCharges: z
    .string()
    .nullable()
    .optional()
    .describe("Monthly maintenance charges."),

  // Property Specifications
  // area: z
  //   .string()
  //   .nullable()
  //   .describe(
  //     "The size/area of the property, e.g., 1200 sqft. Can be Carpet Area, Built-up Area, or Super Area.",
  //   ),
  floorNo: z
    .string()
    .nullable()
    .optional()
    .describe("The floor number, e.g., 5th floor or 50 out of 65."),
  totalFloors: z
    .number()
    .nullable()
    .optional()
    .describe("Total number of floors in the building."),
  furnishingStatus: z
    .string()
    .nullable()
    .optional()
    .describe("e.g., Unfurnished, Semi-furnished, Fully furnished."),
  numberOfBathrooms: z.number().nullable().optional().describe("Number of bathrooms."),
  numberOfBalconies: z.number().nullable().optional().describe("Number of balconies."),
  facing: z
    .string()
    .nullable()
    .optional()
    .describe("Direction the property faces, e.g., East, North-East."),
  overlooking: z
    .string()
    .nullable()
    .optional()
    .describe(
      "What the property overlooks, e.g., Garden/Park, Pool, Main Road.",
    ),
  carParking: z
    .string()
    .nullable()
    .optional()
    .describe("Car parking availability and type, e.g., 1 Covered, 1 Open."),
  flooringType: z
    .string()
    .nullable()
    .optional()
    .describe("Type of flooring, e.g., Vitrified, Cement."),

  // Status and Timeline
  constructionStatus: z
    .string()
    .nullable()
    .optional()
    .describe("e.g., Ready to Move, Under Construction."),
  possessionDate: z
    .string()
    .nullable()
    .optional()
    .describe("Expected possession date, e.g., Dec '27."),
  postedDate: z
    .string()
    .nullable()
    .optional()
    .describe("Date the property was posted, e.g., Posted Yesterday."),
  ageOfBuilding: z
    .string()
    .nullable()
    .optional()
    .describe("Age of the building, e.g., 3-5 years."),
  launchDate: z.string().nullable().optional().describe("Project launch date."),

  // Project Details
  projectName: z
    .string()
    .nullable()
    .optional()
    .describe("Name of the project or society."),
  developerName: z
    .string()
    .nullable()
    .optional()
    .describe("Name of the developer or builder."),
  totalUnits: z
    .number()
    .nullable()
    .optional()
    .describe("Total number of units in the project."),
  projectSize: z
    .string()
    .nullable()
    .optional()
    .describe("Size of the project, e.g., 1 Acre."),
  popularityRank: z
    .string()
    .nullable()
    .optional()
    .describe(
      "Popularity rank in the locality, e.g., 2/27 in Popularity in Jogeshwari East.",
    ),

  // Verification and Legal
  reraApproved: z
    .boolean()
    .nullable()
    .optional()
    .describe("Indicates if the property is RERA approved."),
  reraNumber: z.string().nullable().optional().describe("RERA registration number."),
  verifiedTag: z
    .boolean()
    .nullable()
    .optional()
    .describe("Indicates if the listing is verified by the platform."),
  loanVerified: z
    .boolean()
    .nullable()
    .optional()
    .describe("Indicates if the property loan is verified."),
  ownershipType: z
    .string()
    .nullable()
    .optional()
    .describe("e.g., Freehold, Leasehold, Self Owned."),
  legalCertificatesAvailable: z
    .boolean()
    .nullable()
    .optional()
    .describe("Indicates if legal certificates are available."),
  brochureDownload: z
    .boolean()
    .nullable()
    .optional()
    .describe("Indicates if a brochure is available for download."),

  // Amenities
  amenities: z
    .array(z.string())
    .optional()
    .describe(
      "List of amenities like Pool, Gym, Parking, Clubhouse, Meditation Area, etc.",
    ),

  // Seller Information
  sellerType: z
    .string()
    .nullable()
    .optional()
    .describe("Type of seller, e.g., Owner, Agent, Builder."),
  agentName: z.string().nullable().optional().describe("Name of the agent."),
  contactDetails: z
    .string()
    .nullable()
    .optional()
    .describe("Contact information for the seller/agent."),
  responseRate: z.string().nullable().optional().describe("Seller response rate."),
  buyersServed: z
    .string()
    .nullable()
    .optional()
    .describe("Number of buyers served by the agent/builder."),

  // Engagement and Scores
  uniqueViews: z
    .number()
    .nullable()
    .optional()
    .describe("Number of unique views on the listing."),
  shortlists: z
    .number()
    .nullable()
    .optional()
    .describe("Number of times the property was shortlisted."),
  carpetArea: z
    .string()
    .nullable()
    .optional()
    .describe("The specific carpet area of the property"),
  builtupArea: z
    .string()
    .nullable()
    .optional()
    .describe("The built-up area of the property"),
  superBuiltupArea: z
    .string()
    .nullable()
    .optional()
    .describe("The super built-up area of the property"),
  contactsMade: z
    .number()
    .nullable()
    .optional()
    .describe("Number of contacts made for the property."),
  livabilityScore: z
    .number()
    .nullable()
    .optional()
    .describe("Livability score of the locality."),
  transitScore: z
    .number()
    .nullable()
    .optional()
    .describe("Transit score of the locality."),
  safetyScore: z.number().nullable().optional().describe("Safety score of the locality."),

  // Visuals & Extras
  numberOfPhotos: z
    .number()
    .nullable()
    .optional()
    .describe("Number of photos available for the property."),
  videoTourAvailable: z.boolean().nullable().optional(),
  marketPrice: z.string().nullable().optional(),
  ownerName: z.string().nullable().optional(),
  internalFloorArea: z.string().nullable().optional(),
  verticalPositioning: z.string().nullable().optional(),
  cardinalFacing: z.string().nullable().optional(),
  legalStatus: z.string().nullable().optional(),
  additionalFeatures: z
    .record(z.string(), z.any())
    .optional()
    .describe(
      "A dictionary for any extra property details found on the page that do not fit into the standard fields above. Keys should be human-readable feature names. Values must be strings.",
    ),
});

type Property = z.infer<typeof propertySchema>;

export { propertySchema };
export type { Property };
