import { tool } from "langchain";
import * as z from "zod";
import { getIndividualPropertyLinks } from "./link-extractor";

export const searchRealEstateTool = tool(
  async ({ query }) => {
    console.log(`\n[Tool] Calling Serper API for: "${query}"...`);
   
    if (!process.env.SERPER_API_KEY) {
      return "Error: SERPER_API_KEY environment variable is missing.";
    }

    try {
      const response = await fetch("https://google.serper.dev/search", {
        method: "POST",
        headers: {
          "X-API-KEY": process.env.SERPER_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ q: query }),
      });
     
      const data = await response.json();
      const topResults = data.organic?.slice(0, 2) || [];
      
      console.log(`\n[Log] Picked ${topResults.length} listing URLs from Serper API.`);

      const snippets = topResults.map((r: any) => `- ${r.title}: ${r.snippet}\n  Link: ${r.link}`);
      return snippets.length > 0 ? snippets.join("\n") : "No results found.";
    } catch (error: any) {
      return `Error calling Serper API: ${error.message}`;
    }
  },
  {
    name: "search_real_estate",
    description: "Search the web for real estate properties for sale. Returns search snippets and URLs.",
    schema: z.object({
      query: z.string().describe("The full search query, e.g., '2 BHK sale in Vashi'")
    }),
  }
);

export const discoverLinksTool = tool(
  async ({ listingUrl }) => {
    console.log(`\n[Log] Finding detailed pages for listing page: ${listingUrl}`);
    const links = await getIndividualPropertyLinks(listingUrl);
   
    if (links.length === 0) {
      return "No individual property links found on this page.";
    }
   
    return `Found ${links.length} property detail links:\n${links.map(l => `- ${l}`).join("\n")}`;
  },
  {
    name: "discover_property_links",
    description: "Extract individual property detail URLs from an aggregator search results listing page URL.",
    schema: z.object({
      listingUrl: z.string().url().describe("The URL of the search results page to scan.")
    }),
  }
);

// We don't actually scrape in the tool anymore, we just return the URLs to the orchestrator 
// so the UI can trigger the main extraction flow.
export const scrapePropertyTool = tool(
  async ({ detailUrls }) => {
    return `COLLECTED_URLS: ${detailUrls.join(",")}`;
  },
  {
    name: "scrape_property_details",
    description: "Call this tool ONCE you have collected the individual property detail URLs. Pass an array of the detail URLs you discovered.",
    schema: z.object({
      detailUrls: z.array(z.string().url()).describe("The specific property detail URLs you discovered.")
    })
  }
);
