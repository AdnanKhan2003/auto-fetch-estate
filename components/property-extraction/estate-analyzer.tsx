"use client";

import { useState, useEffect } from "react";
import EstateHeader from "./estate-header";
import ScrapeInputCard from "./scrape-input-card";
import ResultsTable from "./results-table";
import PropertyDetailsModal from "./property-details-modal";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { COMMA_REGEX, NUMERIC_REGEX } from "@/lib/regex";
import { calculateRawRatePerSqft } from "@/lib/format-utils";

function parsePricePerSqft(priceText?: string | null): number | null {
  if (!priceText) return null;
  // Handles: "₹24,286/sqft", "₹84,307 per sqft", "24286"

  const cleaned = priceText.replace(COMMA_REGEX, "");
  const match = cleaned.match(NUMERIC_REGEX);

  if (!match) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : Math.round(value);
}

export default function EstateAnalyzer() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PropertyExtractionResult[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyExtractionResult | null>(null);

  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("scrape_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setResults(parsed);
        // Auto-check rows that have carpet area
        const initSelection: Record<string, boolean> = {};
        parsed.forEach((r: any) => {
          if (r.data?.carpetArea) initSelection[r.url] = true;
        });
        setRowSelection(initSelection);
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const handleScrape = async (submittedUrls: string[]) => {
    setIsLoading(true);
    // Deduplicate URLs to prevent key collisions and redundant scrapes
    const uniqueUrls = Array.from(new Set(submittedUrls));
    
    setPendingUrls(uniqueUrls); // show skeleton rows immediately
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: uniqueUrls }),
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
            // Always remove from pending — URL is done regardless of outcome
            setPendingUrls((prev) => prev.filter((u) => u !== result.url));
            // Silently drop discarded results (e.g. no carpet area) — never show in UI
            if (result.status === "discarded") {
              console.log(
                `[Stream] Discarded: ${result.url} — ${result.reason}`,
              );
              continue;
            }
            // Append to table immediately
            setResults((prev) => {
              const merged = [result, ...prev];
              const unique = Array.from(
                new Map(merged.map((item) => [item.url, item])).values(),
              );
              localStorage.setItem("scrape_history", JSON.stringify(unique));
              return unique;
            });
            // Auto-check this URL if it has carpet area
            if (result.data?.carpetArea) {
              setRowSelection((prev) => ({ ...prev, [result.url]: true }));
            }
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
    setRowSelection({});
    localStorage.removeItem("scrape_history");
  };

  // Only count rows the user has checked in the avg calculation.
  const validPrices = results
    .filter((r) => rowSelection[r.url])
    .map((r) => {
      // Prioritize dynamically calculated raw rate, fallback to AI extracted rate
      const calcRate = calculateRawRatePerSqft(r.data?.price, r.data?.carpetArea, r.data?.area);
      return calcRate !== null ? calcRate : parsePricePerSqft(r.data?.pricePerSqft);
    })
    .filter((p): p is number => p !== null && p > 0);

  const averagePrice =
    validPrices.length > 0
      ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      : 0;
  const discountAmount = Math.round((averagePrice * discountPercentage) / 100);
  const discountedAverage = Math.max(averagePrice - discountAmount, 0);

  return (
    <div className="space-y-6 sm:space-y-10 px-0 sm:px-6 pb-8 bg-background text-foreground">
      <EstateHeader onClear={clearHistory} />
      <main className="flex-1 min-w-0 overflow-hidden space-y-10 px-4 sm:px-6 py-6 sm:py-10">
        <ScrapeInputCard
          urls={urls}
          isLoading={isLoading}
          onScrape={handleScrape}
        />
        <ResultsTable
          results={results}
          pendingUrls={pendingUrls}
          onRowClick={setSelectedProperty}
          averagePrice={averagePrice}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          discountedAverage={discountedAverage}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
        />
      </main>
      <PropertyDetailsModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
