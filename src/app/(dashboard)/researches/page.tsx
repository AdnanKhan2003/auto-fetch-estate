"use client";

import { useEffect, useState, useMemo } from "react";
import ResultsTable from "@/components/property-extraction/results-table";
import PropertyDetailsModal from "@/components/property-extraction/property-details-modal";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { Loader2 } from "lucide-react";
import {
  calculateRatePerSqft,
  parseIndianPrice,
} from "@/lib/format-utils";
import { COMMA_REGEX, NUMERIC_REGEX } from "@/lib/regex";

function parsePricePerSqft(priceText?: string | null): number | null {
  if (!priceText) return null;
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

export default function ResearchesPage() {
  const [results, setResults] = useState<
    (PropertyExtractionResult & { id: string })[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Table states required by your ResultsTable
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [adoptedRate, setAdoptedRate] = useState<number>(0);
  const [rowFactors, setRowFactors] = useState<Record<string, number>>({});
  const [showTotalArea, setShowTotalArea] = useState(false);

  // Modal state
  const [selectedProperty, setSelectedProperty] = useState<
    (PropertyExtractionResult & { id?: string }) | null
  >(null);

  // Reusable Handlers for Table and Modal
  const handleDelete = async (id: string) => {
    await fetch(`/api/property-extraction?id=${id}`, {
      method: "DELETE",
    });
    setResults((prev) => prev.filter((r) => r.id !== id));
    if (selectedProperty?.id === id) setSelectedProperty(null);
  };

  const handleUpdate = (id: string, updates: any) => {
    setResults((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, data: { ...r.data, ...updates } } : r,
      ),
    );
    if (selectedProperty?.id === id) {
      setSelectedProperty((prev) =>
        prev ? { ...prev, data: { ...prev.data, ...updates } } : null,
      );
    }
  };

  useEffect(() => {
    fetch("/api/property-extraction")
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((d: any) => ({
          id: d.id,
          url: d.url,
          screenshotUrl: d.screenshotUrl,
          data: d.extractedData,
          status: d.status,
          error: d.errorMessage,
          tokensUsed: d.tokensUsed,
        }));
        setResults(formatted);

        // Auto-select rows with valid carpet area just like the Home page does
        const initSelection: Record<string, boolean> = {};
        formatted.forEach((r: any) => {
          if (r.data?.carpetArea) initSelection[r.url] = true;
        });
        setRowSelection(initSelection);

        setIsLoading(false);
      });
  }, []);

  const { averagePrice, discountedAverage, totalCarpetArea, estimatedCount } =
    useMemo(() => {
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
                parseIndianPrice(r.data.builtupArea) * (factor ?? 0.85);
            } else if (r.data?.superBuiltupArea) {
              effectiveArea =
                parseIndianPrice(r.data.superBuiltupArea) * (factor ?? 0.72);
            }
          }

          const calcRate = calculateRatePerSqft(r.data?.price, effectiveArea);
          return calcRate !== null
            ? calcRate
            : parsePricePerSqft(r.data?.pricePerSqft);
        })
        .filter((p): p is number => p !== null && p > 0);

      const avgPrice =
        validPrices.length > 0
          ? Math.round(
              validPrices.reduce((a, b) => a + b, 0) / validPrices.length,
            )
          : 0;
      const discountAmount = Math.round((avgPrice * discountPercentage) / 100);
      const discAvg = Math.max(avgPrice - discountAmount, 0);

      const totals = rowsForAvg.reduce(
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

      return {
        averagePrice: avgPrice,
        discountedAverage: discAvg,
        totalCarpetArea: totals.totalCarpetArea,
        estimatedCount: totals.estimatedCount,
      };
    }, [results, rowSelection, discountPercentage, rowFactors]);

  // Synchronize adoptedRate when discountedAverage changes
  useEffect(() => {
    setAdoptedRate(discountedAverage);
  }, [discountedAverage]);

  return (
    <div className="space-y-6 sm:space-y-10 bg-background px-0 pb-8 text-foreground">
      <div className="flex items-center bg-card px-4 sm:px-6 py-4 border-border/50 border-b h-[64px]">
        <h1 className="font-bold text-xl sm:text-2xl tracking-tight">
          Saved Researches
        </h1>
      </div>
      <main className="flex-1 space-y-10 px-4 sm:px-6 py-6 sm:py-10 min-w-0 overflow-hidden">
        <ResultsTable
          isLoadingHistory={isLoading}
          results={results}
          pendingUrls={[]}
          focusedUrl={null}
          onRowClick={setSelectedProperty}
          averagePrice={averagePrice}
          discountedAverage={discountedAverage}
          globalConversionFactor={0.72}
          totalCarpetArea={totalCarpetArea}
          estimatedCount={estimatedCount}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          discountPercentage={discountPercentage}
          setDiscountPercentage={setDiscountPercentage}
          adoptedRate={adoptedRate}
          setAdoptedRate={setAdoptedRate}
          rowFactors={rowFactors}
          setRowFactors={setRowFactors}
          showTotalArea={showTotalArea}
          setShowTotalArea={setShowTotalArea}
        />
      </main>
      <PropertyDetailsModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onDelete={handleDelete}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
