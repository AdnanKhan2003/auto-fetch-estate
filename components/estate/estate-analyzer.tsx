"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const saved = localStorage.getItem("scrape_history");
    if (saved) {
      try {
        setResults(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // const handleScrape = async () => {
  //   setIsLoading(true);
  //   const urlArray = urls.filter((u) => u.trim() !== "");
  //   if (urlArray.length === 0) {
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     const response = await fetch("/api/scrape", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ urls: urlArray }),
  //     });
  //     const data = await response.json();
  //     setResults(data.results || []);
  //   } catch (error) {
  //     console.error("Scrape failed:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleScrape = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urls.filter((u) => u.trim()) }),
      });
      const data = await response.json();

      if (data.results) {
        // 1. Combine new results with existing ones
        // 2. Filter out duplicates based on URL
        const newResults = [...data.results, ...results];
        const uniqueResults = Array.from(
          new Map(newResults.map((item) => [item.url, item])).values(),
        );

        setResults(uniqueResults);
        localStorage.setItem("scrape_history", JSON.stringify(uniqueResults));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    setResults([]);
    localStorage.removeItem("scrape_history");
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
        <EstateHeader onClear={clearHistory} />
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
