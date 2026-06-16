"use client";

import { useState, useEffect, useRef } from "react";
import EstateHeader from "./estate-header";
import ScrapeInputCard from "./scrape-input-card";
import ResultsTable from "./results-table";
import PropertyDetailsModal from "./property-details-modal";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { COMMA_REGEX, NUMERIC_REGEX } from "@/lib/regex";
import { calculateRatePerSqft, parseIndianPrice } from "@/lib/format-utils";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

function parsePricePerSqft(priceText?: string | null): number | null {
  if (!priceText) return null;
  // Handles: "₹24,286/sqft", "₹84,307 per sqft", "24286"

  const cleaned = priceText.replace(COMMA_REGEX, "");
  const match = cleaned.match(NUMERIC_REGEX);

  if (!match) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : Math.round(value);
}

function hasValidArea(r: any): boolean {
  const areas = [
    r.data?.carpetArea,
    r.data?.builtupArea,
    r.data?.superBuiltupArea,
  ];
  return areas.some((a) => a && parseIndianPrice(a) > 50);
}

export default function EstateAnalyzer() {
  // Core Input Url state
  const [duplicateUrls, setDuplicateUrls] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUrls, setPendingUrls] = useState<string[]>([]);
  const [results, setResults] = useState<
    (PropertyExtractionResult & { id?: string })[]
  >([]);

  // Hydration issue fix
  const [isMounted, setIsMounted] = useState(false);

  // Calculate missing carpet area
  const [showTotalArea, setShowTotalArea] = useState(false);

  // Checkbox
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Factor to convert to carpet area
  const [rowFactors, setRowFactors] = useState<Record<string, number>>({});
  // Default fallback
  const [conversionFactor, setConversionFactor] = useState<number>(0.72);

  // locate in table
  const [focusedUrl, setFocusedUrl] = useState<string | null>(null);

  // discount
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Row detail (Modal)
  const [selectedProperty, setSelectedProperty] = useState<
    (PropertyExtractionResult & { id?: string }) | null
  >(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/property-extraction");
        if (!response.ok) throw new Error("Failed to fetch properties");

        const properties = await response.json();

        if (properties && properties.length > 0) {
          const formattedResults = properties.map((p: any) => ({
            id: p.id,
            url: p.url,
            status: p.status,
            data: p.extractedData,
            tokens: p.tokensUsed,
            screenshotUrl: p.screenshotUrl,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          }));

          setResults(formattedResults as any);
          setUrls(formattedResults.map((r: any) => r.url));

          const initSelection: Record<string, boolean> = {};
          formattedResults.forEach((r: any) => {
            if (r.data?.carpetArea) initSelection[r.url] = true;
          });
          setRowSelection(initSelection);
        }
      } catch (error) {
        console.error("Failed to load from DB", error);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updateSingleRecord = async (idToUpdate: string, updates: any) => {
    try {
      const response = await fetch("/api/property-extraction", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: idToUpdate, updates }),
      });

      if (!response.ok) throw new Error("Failed to update record");

      const resData = await response.json();

      setResults((prev) =>
        prev.map((r: any) =>
          r.id === idToUpdate
            ? { ...r, data: resData.updatedData, updatedAt: resData.updatedAt }
            : r,
        ),
      );

      if (selectedProperty?.id === idToUpdate) {
        setSelectedProperty((prev) =>
          prev
            ? {
                ...prev,
                data: resData.updatedData,
                updatedAt: resData.updatedAt,
              }
            : null,
        );
      }
    } catch (error) {
      console.error("Failed to update record", error);
    }
  };

  const deleteSingleRecord = async (idToDelete: string) => {
    try {
      const response = await fetch(
        `/api/property-extraction?id=${idToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) throw new Error("Failed to delete record");

      setResults((prev) => prev.filter((r: any) => r.id !== idToDelete));

      setRowSelection((prev) => {
        const next = { ...prev };
        const deletedUrl = results.find((r: any) => r.id === idToDelete)?.url;

        if (deletedUrl) delete next[deletedUrl];
        return next;
      });

      if (selectedProperty?.id === idToDelete) {
        setSelectedProperty(null);
      }
    } catch (e) {
      console.error("Failed to delete record", e);
    }
  };

  const handleScrape = async (submittedUrls: string[]) => {
    setUrls(submittedUrls);
    setIsLoading(true);

    const existingUrls = submittedUrls.filter((url) =>
      results.some((r) => r.url === url),
    );

    if (existingUrls.length > 0) {
      setDuplicateUrls(existingUrls);
      setIsLoading(false);
      return;
    }
    // Deduplicate URLs to prevent key collisions and redundant scrapes
    setUrls(submittedUrls);
    const uniqueUrls = Array.from(new Set(submittedUrls));

    setPendingUrls(uniqueUrls); // show skeleton rows immediately

    abortControllerRef.current = new AbortController();
    try {
      const response = await fetch("/api/property-extraction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: uniqueUrls }),
        signal: abortControllerRef.current.signal,
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
              const merged = [...prev, result];
              const unique = Array.from(
                new Map(merged.map((item) => [item.url, item])).values(),
              );
              return unique;
            });
            // Auto-check this URL if it has ANY valid area
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

  const clearHistory = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    try {
      const response = await fetch("/api/property-extraction", {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to clear DB");

      setResults([]);
      setRowSelection({});
      setUrls([""]);
    } catch (e) {
      console.error("Failed to clear DB", e);
    }
  };

  // When showTotalArea is ON: include every row that has price + any area
  // (factor converts built-up → carpet for rows missing carpet area).
  // When OFF: only manually checked rows are counted (existing behaviour).
  // (hasValidArea is now defined at the file level)

  const rowsForAvg = results.filter(
    (r) => rowSelection[r.url] && r.data?.price && hasValidArea(r),
  );

  const validPrices = rowsForAvg
    .map((r) => {
      let effectiveArea: number | null = null;
      if (r.data?.carpetArea) {
        effectiveArea = parseIndianPrice(r.data.carpetArea);
      } else {
        const factor = rowFactors[r.url];
        if (r.data?.builtupArea) {
          effectiveArea =
            parseIndianPrice(r.data.builtupArea) * (factor ?? 0.85); // default builtup to carpet
        } else if (r.data?.superBuiltupArea) {
          effectiveArea =
            parseIndianPrice(r.data.superBuiltupArea) * (factor ?? 0.72); // default super builtup to carpet
        }
      }

      const calcRate = calculateRatePerSqft(r.data?.price, effectiveArea);
      return calcRate !== null
        ? calcRate
        : parsePricePerSqft(r.data?.pricePerSqft);
    })
    .filter((p): p is number => p !== null && p > 0);

  const averagePrice =
    validPrices.length > 0
      ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      : 0;
  const discountAmount = Math.round((averagePrice * discountPercentage) / 100);
  const discountedAverage = Math.max(averagePrice - discountAmount, 0);

  // Sum of effective carpet areas — uses same row set as the avg calculation.
  const { totalCarpetArea, estimatedCount } = rowsForAvg.reduce(
    (acc, r) => {
      let factor = rowFactors[r.url];
      if (r.data?.carpetArea) {
        acc.totalCarpetArea += parseIndianPrice(r.data.carpetArea);
      } else if (r.data?.builtupArea) {
        acc.totalCarpetArea += Math.round(
          parseIndianPrice(r.data.builtupArea) * (factor ?? 0.85),
        );
        acc.estimatedCount++;
      } else if (r.data?.superBuiltupArea) {
        acc.totalCarpetArea += Math.round(
          parseIndianPrice(r.data.superBuiltupArea) * (factor ?? 0.72),
        );
        acc.estimatedCount++;
      }
      return acc;
    },
    { totalCarpetArea: 0, estimatedCount: 0 },
  );

  const orderedResults = results;

  if (!isMounted) return null;

  const handlePropertyScraped = (result: any) => {
    // Silently drop discarded results
    if (result.status === "discarded") return;

    setResults((prev) => {
      const merged = [...prev, result];
      const unique = Array.from(
        new Map(merged.map((item) => [item.url, item])).values(),
      );
      return unique;
    });

    if (result.data?.carpetArea) {
      setRowSelection((prev) => ({ ...prev, [result.url]: true }));
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10 bg-background px-0 pb-8 text-foreground">
      <EstateHeader onClear={clearHistory} />
      <main className="flex-1 space-y-10 px-4 sm:px-6 py-6 sm:py-10 min-w-0 overflow-hidden">
        <ScrapeInputCard
          urls={urls}
          isLoading={isLoading}
          onScrape={handleScrape}
          setFocusedUrl={setFocusedUrl}
          onPropertyScraped={handlePropertyScraped}
          onStopScrape={() => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
          }}
        />
        <ResultsTable
          results={orderedResults}
          pendingUrls={pendingUrls}
          onRowClick={setSelectedProperty}
          averagePrice={averagePrice}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          discountedAverage={discountedAverage}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          focusedUrl={focusedUrl}
          globalConversionFactor={conversionFactor}
          rowFactors={rowFactors}
          setRowFactors={setRowFactors}
          showTotalArea={showTotalArea}
          setShowTotalArea={setShowTotalArea}
          totalCarpetArea={totalCarpetArea}
          estimatedCount={estimatedCount}
          onDelete={deleteSingleRecord}
          onUpdate={updateSingleRecord}
        />
      </main>
      <PropertyDetailsModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onDelete={deleteSingleRecord}
        onUpdate={updateSingleRecord}
      />

      <AlertDialog
        open={duplicateUrls.length > 0}
        onOpenChange={(open) => {
          if (!open) setDuplicateUrls([]);
        }}
      >
        <AlertDialogContent className="bg-card shadow-2xl border-border rounded-2xl max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-black text-red-500 text-lg uppercase tracking-widest">
              This Property's Data Already Exists!
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-muted-foreground text-sm leading-relaxed">
              You have already scraped the following url or urls. To protect
              your strict Gemini API limits, we instantly canceled the scrape.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-black/5 dark:bg-black/40 shadow-inner p-4 border border-border/50 rounded-xl overflow-hidden">
            <ul className="space-y-2 max-h-[200px] overflow-y-auto font-mono text-[11px] text-muted-foreground break-all">
              {duplicateUrls.map((u) => (
                <li key={u} className="flex items-start gap-2">
                  <span className="mt-0.5 font-bold text-red-500">✕</span>
                  <span className="leading-snug">{u}</span>
                </li>
              ))}
            </ul>
          </div>

          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setDuplicateUrls([])}
              className="font-bold cursor-pointer"
            >
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
