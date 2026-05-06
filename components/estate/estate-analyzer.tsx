"use client";

import { useState, useEffect } from "react";
import EstateHeader from "./estate-header";
import ScrapeInputCard from "./scrape-input-card";
import ResultsTable from "./results-table";
import PropertyDetailsModal from "./property-details-modal";
import DiscountCard from "./discount-card";

interface ScrapeResult {
  url: string;
  screenshotUrl?: string;
  data?: any;
  status: "success" | "error";
}

function parsePricePerSqft(priceText?: string | null): number | null {
  if (!priceText) return null;
  // Handles: "₹24,286/sqft", "₹84,307 per sqft", "24286"
  const cleaned = priceText.replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);  
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : Math.round(value);
}

export default function EstateAnalyzer() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [selectedProperty, setSelectedProperty] = useState<ScrapeResult | null>(
    null,
  );
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);

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
    const activeUrls = urls.filter((u) => u.trim());
    setPendingUrls(activeUrls); // show skeleton rows immediately
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: activeUrls }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Scrape request failed");
      }

      // ── Stream reader — each line = one completed scrape result ──
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Network may deliver partial lines; accumulate in buffer
        buffer += decoder.decode(value, { stream: true });

        // Every complete newline-terminated line is one result
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? ""; // keep incomplete tail for next chunk

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const result = JSON.parse(line);
            // Remove from pending as soon as this URL resolves
            setPendingUrls((prev) => prev.filter((u) => u !== result.url));
            // Append to table immediately
            setResults((prev) => {
              const merged = [result, ...prev];
              const unique = Array.from(
                new Map(merged.map((item) => [item.url, item])).values()
              );
              localStorage.setItem("scrape_history", JSON.stringify(unique));
              return unique;
            });
          } catch (e) {
            console.error("Failed to parse streamed line:", line, e);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setPendingUrls([]); // clear any stragglers
    }
  };

  const clearHistory = () => {
    setResults([]);
    localStorage.removeItem("scrape_history");
  };

  const validPrices = results
    .map((r) => parsePricePerSqft(r.data?.pricePerSqft))
    .filter((p): p is number => p !== null && p > 0);

  const averagePrice =
    validPrices.length > 0
      ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      : 0;
  const discountAmount = Math.round((averagePrice * discountPercentage) / 100);
  const discountedAverage = Math.max(averagePrice - discountAmount, 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <EstateHeader onClear={clearHistory} />
        <ScrapeInputCard
          urls={urls}
          setUrls={setUrls}
          isLoading={isLoading}
          onScrape={handleScrape}
        />
        <DiscountCard discountPercentage={discountPercentage} setDiscountPercentage={setDiscountPercentage} />
        <ResultsTable
          results={results}
          pendingUrls={pendingUrls}
          onRowClick={setSelectedProperty}
          averagePrice={averagePrice}
          discountPercentage={discountPercentage}
          discountedAverage={discountedAverage}
        />
      </div>
      <PropertyDetailsModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
