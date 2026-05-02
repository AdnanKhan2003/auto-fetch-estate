"use client";

import { useState } from "react";
import EstateHeader from "./estate-header";
import ScrapeInputCard from "./scrape-input-card";
import ResultsTable from "./results-table";
import PropertyDetailsModal from "./property-details-modal";

interface ScrapeResult {
  url: string;
  screenshotUrl?: string;
  data?: any;
  status: "success" | "error";
}

export default function EstateAnalyzer() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<ScrapeResult | null>(
    null,
  );

  const handleScrape = async () => {
    setIsLoading(true);
    const urlArray = urls.filter((u) => u.trim() !== "");
    if (urlArray.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlArray }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Scrape failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validPrices = results
    .map((r) => {
      const priceStr = r.data?.price?.replace(/[^0-9]/g, "");
      return priceStr ? parseInt(priceStr, 10) : null;
    })
    .filter((p): p is number => p !== null && p > 0);

  const averagePrice =
    validPrices.length > 0
      ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      : 0;

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <EstateHeader />
        <ScrapeInputCard
          urls={urls}
          setUrls={setUrls}
          isLoading={isLoading}
          onScrape={handleScrape}
        />
        <ResultsTable
          results={results}
          onRowClick={setSelectedProperty}
          averagePrice={averagePrice}
        />
      </div>
      <PropertyDetailsModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
