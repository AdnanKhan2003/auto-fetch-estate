"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { ArrowUpDown, ExternalLink, Pencil, Trash2 } from "lucide-react";

import { COMMA_REGEX, NUMERIC_REGEX } from "@/lib/regex";
import { parseIndianPrice, formatRatePerSqft } from "@/lib/format-utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import TooltipWrapper from "@/components/tooltip/tooltip";

// Smart helper to sort Indian currency and numeric strings
const smartNumericSort = (rowA: any, rowB: any, columnId: string) => {
  const a = parseIndianPrice(rowA.getValue(columnId));
  const b = parseIndianPrice(rowB.getValue(columnId));

  return a < b ? -1 : a > b ? 1 : 0;
};

const AreaCell = ({ row, table }: { row: any; table: any }) => {
  const meta = table.options.meta as any;
  const data = row.original.data;
  const carpetArea = data?.carpetArea;
  const builtupArea = data?.builtupArea;
  const superBuiltupArea = data?.superBuiltupArea;
  const url = row.original.url;
  const propertyId = row.original.id;

  const currentAreaStr = carpetArea || builtupArea || superBuiltupArea || "";
  const numericArea = currentAreaStr ? parseIndianPrice(currentAreaStr) : "";

  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(numericArea ? numericArea.toString() : "");

  let areaLabel = "";
  let areaToDisplay = "";

  if (carpetArea) {
    areaToDisplay = carpetArea;
  } else if (builtupArea) {
    areaToDisplay = builtupArea;
    areaLabel = "Built-up area";
  } else if (superBuiltupArea) {
    areaToDisplay = superBuiltupArea;
    areaLabel = "Super built-up area";
  }

  const handleSave = () => {
    setIsEditing(false);
    const num = Number(val);
    if (!Number.isNaN(num) && num > 0 && meta?.onUpdate && propertyId) {
      meta.onUpdate(propertyId, { carpetArea: `${num} sqft` });
    }
  };

  useEffect(() => {
    setVal(numericArea ? numericArea.toString() : "");
  }, [currentAreaStr]);

  if (isEditing) {
    return (
      <div
        className="flex items-center gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          autoFocus
          className="w-20 h-8 rounded-md border border-input bg-background px-2 py-1 text-xs font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{areaToDisplay || "N/A"}</span>
        <span
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          title="Edit Area"
          className="cursor-pointer group/pencil"
        >
          <TooltipWrapper content="Edit Area">
            <Pencil className="h-3 w-3 text-muted-foreground/40 group-hover/pencil:text-foreground shrink-0 transition-colors" />
          </TooltipWrapper>
        </span>
      </div>
      {areaLabel && (
        <span className="text-[10px] text-amber-500/80 leading-tight">
          {areaLabel}
        </span>
      )}
      {!carpetArea && areaToDisplay && (
        <div
          className="flex items-center gap-1 mt-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[10px] text-muted-foreground/50 shrink-0">
            Factor:
          </span>
          <Input
            type="number"
            min={0.5}
            max={1}
            step={0.01}
            value={meta?.rowFactors?.[url] ?? (builtupArea ? 0.85 : 0.72)}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (!Number.isNaN(val)) {
                meta?.setRowFactors?.((prev: any) => ({
                  ...prev,
                  [url]: Math.min(1, Math.max(0.5, val)),
                }));
              }
            }}
            className="w-14 h-5 text-[11px] text-right border border-border/60 rounded px-1 bg-background text-foreground font-mono focus:outline-hidden focus:ring-1 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
};

const RateCell = ({ row, table }: { row: any; table: any }) => {
  const meta = table.options.meta as any;
  const data = row.original.data;
  const url = row.original.url;
  const propertyId = row.original.id;

  let effectiveArea: number | null = null;
  let factor = meta?.rowFactors?.[url];

  if (data?.carpetArea) {
    effectiveArea = parseIndianPrice(data.carpetArea);
  } else if (data?.builtupArea) {
    effectiveArea = parseIndianPrice(data.builtupArea) * (factor ?? 0.85);
  } else if (data?.superBuiltupArea) {
    effectiveArea = parseIndianPrice(data.superBuiltupArea) * (factor ?? 0.72);
  }

  const calculatedRate = formatRatePerSqft(data?.price, effectiveArea);
  const rateToDisplay = calculatedRate || data?.pricePerSqft;
  const numericRate = rateToDisplay ? parseIndianPrice(rateToDisplay) : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [val, setVal] = useState(numericRate ? numericRate.toString() : "");

  useEffect(() => {
    setVal(numericRate ? numericRate.toString() : "");
  }, [rateToDisplay]);

  const handleSave = () => {
    setIsEditing(false);
    const num = Number(val);
    if (!Number.isNaN(num) && num > 0 && meta?.onUpdate && propertyId) {
      meta.onUpdate(propertyId, {
        pricePerSqft: `₹${num.toLocaleString("en-IN")}/sqft`,
      });
    }
  };

  if (isEditing) {
    return (
      <div
        className="flex items-center justify-end gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          type="number"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") setIsEditing(false);
          }}
          autoFocus
          className="w-24 h-8 rounded-md border border-input bg-background px-2 py-1 text-right text-xs font-mono ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden foucs-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <span className="text-right font-black text-foreground text-sm">
        {rateToDisplay || "N/A"}
      </span>
      <span
        onClick={(e) => {
          e.stopPropagation();
          setIsEditing(true);
        }}
        title="Edit rate"
        className="cursor-pointer group/pencil"
      >
        <TooltipWrapper content="Edit Rate/Sqft">
          <Pencil className="h-3 w-3 text-muted-foreground/40 group-hover/pencil:text-foreground shrink-0 transition-colors" />
        </TooltipWrapper>
      </span>
    </div>
  );
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
        <TooltipWrapper content="Include in Calculation">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="cursor-pointer"
          />
        </TooltipWrapper>
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
        <TooltipWrapper content="Sort by Title">
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </TooltipWrapper>
      </div>
    ),
    cell: ({ row }) => {
      const url = row.original.url;
      const title = row.original.data?.propertyTitle || "Unknown Property";
      const createdAt = (row.original as any).createdAt;
      const updatedAt = (row.original as any).updatedAt;

      const isEdited =
        createdAt &&
        updatedAt &&
        new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
      console.log(`[Table Row] ${title}:`, {
        createdAt,
        updatedAt,
        createdAtType: typeof createdAt,
        updatedAtType: typeof updatedAt,
        timeDiffMs:
          createdAt && updatedAt
            ? new Date(updatedAt).getTime() - new Date(createdAt).getTime()
            : null,
        isEdited,
      });

      let domain = "Unknown Website";
      try {
        domain = new URL(url).hostname.replace("www.", "");
      } catch (e) {
        console.log(e);
      }

      return (
        <div className="flex flex-col max-w-[250px] gap-0.5">
          <Link
            href={url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="group flex items-center gap-1.5 min-w-0 truncate"
            title={title}
          >
            <span className="truncate font-semibold text-blue-600 dark:text-blue-400 group-hover:underline text-sm">
              {title}
            </span>
            <TooltipWrapper content="Open Link">
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors" />
            </TooltipWrapper>
          </Link>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/80 font-medium">
            <span>{domain}</span>
            {isEdited && (
              <span className="shrink-0 inline-flex items-center rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                Edited
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "data.location",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Location
        <TooltipWrapper content="Sort by Location">
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </TooltipWrapper>
      </div>
    ),
    cell: ({ row }) => <span>{row.original.data?.location || "N/A"}</span>,
  },
  {
    accessorKey: "data.price",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Price
        <TooltipWrapper content="Sort by Price">
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </TooltipWrapper>
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
        <TooltipWrapper content="Sort by Area">
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </TooltipWrapper>
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row, table }) => <AreaCell row={row} table={table} />,
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
        const rawArea = parseIndianPrice(areaToCalc);
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
        <TooltipWrapper content="Sort by Rate/Sqft">
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        </TooltipWrapper>
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row, table }) => <RateCell row={row} table={table} />,
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
              <TooltipWrapper content="Delete Property">
                <Trash2 className="h-4 w-4" />
              </TooltipWrapper>
            </Button>
          )}
        </div>
      );
    },
  },
];
