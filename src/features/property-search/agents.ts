import { createAgent, todoListMiddleware } from "langchain";
import { createSubAgentMiddleware } from "deepagents";
import {
  searchRealEstateTool,
  discoverLinksTool,
  scrapePropertyTool,
} from "./agent-tools";

const propertyScraperSubagent = {
  name: "property_scraper",
  description: "Handles searching the web and extracting property links.",
  systemPrompt: `You are an expert real estate data assistant.
    Follow these steps in order:
    1. Use 'search_real_estate' to find search result pages.
    2. Use 'discover_property_links' on the URLs returned by the search tool.
    3. Use 'scrape_property_details' passing the array of individual property links discovered.
    4. Provide a final summary saying "Ready to scrape properties."`,
  tools: [searchRealEstateTool, discoverLinksTool, scrapePropertyTool],
  model: "google-genai:gemini-2.5-flash",
  middleware: [],
};

export const orchestratorAgent = createAgent({
  model: "google-genai:gemini-2.5-flash",
  tools: [],
  middleware: [
    // todoListMiddleware(),
    createSubAgentMiddleware({
      defaultModel: "google-genai:gemini-2.5-flash",
      defaultTools: [],
      subagents: [propertyScraperSubagent],
    }),
  ],
});
