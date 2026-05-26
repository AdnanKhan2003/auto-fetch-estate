"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { ArrowUpDown, ExternalLink, Trash2 } from "lucide-react";

import { COMMA_REGEX, NUMERIC_REGEX } from "@/lib/regex";
import { parseIndianNumber, calculateRatePerSqft } from "@/lib/format-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Smart helper to sort Indian currency and numeric strings
const smartNumericSort = (rowA: any, rowB: any, columnId: string) => {
  const a = parseIndianNumber(rowA.getValue(columnId));
  const b = parseIndianNumber(rowB.getValue(columnId));

  return a < b ? -1 : a > b ? 1 : 0;
};

export const columns: ColumnDef<PropertyExtractionResult>[] = [
  {
    id: "index",
    header: () => <div className="text-center"></div>,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const originalUrls = meta?.originalUrls || [];

      const originalIndex = originalUrls.indexOf(row.original.url);
      const displayIndex =
        originalIndex !== -1 ? originalIndex + 1 : row.index + 1;

      return (
        <div className="flex items-center justify-center">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30 border border-border/50 text-xs font-mono text-muted-foreground">
            {displayIndex}
          </div>
        </div>
      );
    },
  },
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center h-full">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px] cursor-pointer"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div
        className="flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="cursor-pointer"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "screenshotUrl",
    header: "Image",
    enableSorting: false,
    cell: ({ row }) => {
      const screenshot = row.original.screenshotUrl;
      return (
        <div className="h-10 w-14 relative overflow-hidden rounded border border-border bg-muted">
          <Image
            src={
              screenshot ? `/api/images/${screenshot}` : "/fallback-image.png"
            }
            alt="Property"
            fill
            unoptimized={true}
            className="object-cover"
            onError={(e) => {
              ((e.currentTarget.src = "/fallback-image.png"),
                (e.currentTarget.srcset = ""));
            }}
          />
        </div>
      );
    },
  },
  {
    accessorKey: "data.propertyTitle",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Property
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    cell: ({ row }) => {
      const url = row.original.url;
      const title = row.original.data?.propertyTitle || "Unknown Property";

      let domain = "Unknown Website";
      try {
        domain = new URL(url).hostname.replace("www.", "");
      } catch (e) {
        console.log(e);
      }

      return (
        <div className="flex flex-col max-w-[250px] gap-0.5">
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center gap-1.5"
            title={title}
          >
            <span className="truncate font-semibold text-blue-600 dark:text-blue-400 group-hover:underline text-sm">
              {title}
            </span>
            <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors" />
          </Link>
          <span className="text-xs text-muted-foreground/80 font-medium">
            {domain}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "data.location",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Location
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    cell: ({ row }) => <span>{row.original.data?.location || "N/A"}</span>,
  },
  {
    accessorKey: "data.price",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Price
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row }) => <span>{row.original.data?.price || "N/A"}</span>,
  },
  {
    id: "area",
    accessorFn: (row) =>
      row.data?.carpetArea ||
      row.data?.builtupArea ||
      row.data?.superBuiltupArea,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Area
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const data = row.original.data;
      const carpetArea = data?.carpetArea;
      const builtupArea = data?.builtupArea;
      const superBuiltupArea = data?.superBuiltupArea;
      const url = row.original.url;

      let factor = meta?.rowFactors?.[url];
      let defaultFactor = meta?.globalConversionFactor ?? 0.72;
      let areaToDisplay = null;
      let areaLabel = "";

      if (builtupArea) {
        areaToDisplay = builtupArea;
        defaultFactor = 0.85;
        areaLabel = "*Built-up area";
      } else if (superBuiltupArea) {
        areaToDisplay = superBuiltupArea;
        defaultFactor = 0.72;
        areaLabel = "*Super built-up area";
      }

      factor = factor ?? defaultFactor;

      if (carpetArea) {
        return (
          <div className="flex flex-col">
            <span className="font-medium">{carpetArea}</span>
          </div>
        );
      }

      if (areaToDisplay) {
        return (
          <div className="flex flex-col gap-1">
            <span>{areaToDisplay}</span>
            <span className="text-[10px] text-amber-500/80 leading-tight">
              {areaLabel}
            </span>
            {/* Per-row conversion factor — click/change stops propagation so modal doesn't open */}
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-[10px] text-muted-foreground/60 shrink-0">
                Factor:
              </span>
              <input
                type="number"
                min={0.5}
                max={1}
                step={0.01}
                value={factor}
                aria-label="Conversion factor for this row"
                onChange={(e) => {
                  e.stopPropagation();
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) {
                    meta?.setRowFactors?.((prev: Record<string, number>) => ({
                      ...prev,
                      [url]: Math.min(1, Math.max(0.5, val)),
                    }));
                  }
                }}
                className="w-14 h-5 text-[11px] text-right border border-border/60 rounded px-1 bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        );
      }

      return <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    id: "calculatedCarpetArea",
    header: "Calc. Carpet Area",
    enableSorting: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const data = row.original.data;
      const carpetArea = data?.carpetArea;
      const builtupArea = data?.builtupArea;
      const superBuiltupArea = data?.superBuiltupArea;
      const url = row.original.url;

      // Row already has real carpet area — no estimation needed
      if (carpetArea) {
        return <span className="text-muted-foreground/40">—</span>;
      }

      let areaToCalc = null;
      let factor = meta?.rowFactors?.[url];
      let defaultFactor = meta?.globalConversionFactor ?? 0.72;

      if (builtupArea) {
        areaToCalc = builtupArea;
        defaultFactor = 0.85;
      } else if (superBuiltupArea) {
        areaToCalc = superBuiltupArea;
        defaultFactor = 0.72;
      }

      factor = factor ?? defaultFactor;

      if (areaToCalc) {
        const rawArea = parseIndianNumber(areaToCalc);
        const calculated = Math.round(rawArea * factor);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">
              {calculated.toLocaleString("en-IN")} sqft
            </span>
            <span className="text-[10px] text-amber-500/70">
              est. via ×{factor}
            </span>
          </div>
        );
      }

      return <span className="text-muted-foreground">N/A</span>;
    },
  },
  {
    accessorKey: "data.pricePerSqft",
    header: ({ column }) => (
      <div className="flex items-center justify-end gap-1">
        Rate/Sqft
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const data = row.original.data;
      const url = row.original.url;
      let effectiveArea: number | null = null;
      let factor = meta?.rowFactors?.[url];

      if (data?.carpetArea) {
        effectiveArea = parseIndianNumber(data.carpetArea);
      } else if (data?.builtupArea) {
        effectiveArea = parseIndianNumber(data.builtupArea) * (factor ?? 0.85);
      } else if (data?.superBuiltupArea) {
        effectiveArea =
          parseIndianNumber(data.superBuiltupArea) * (factor ?? 0.72);
      }

      // Calculate dynamic rate using per-row factor, fallback to AI-provided
      const calculatedRate = calculateRatePerSqft(data?.price, effectiveArea);
      const rateToDisplay = calculatedRate || data?.pricePerSqft;

      return (
        <div className="text-right font-black text-foreground">
          {rateToDisplay || "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    enableSorting: false,
    cell: ({ row, table }) => {
      const meta = table.options.meta as any;
      const propertyId = (row.original as any).id;

      return (
        <div
          className="flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {propertyId && meta?.onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => meta.onDelete(propertyId)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
              title="Delete Property"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    },
  },
];
