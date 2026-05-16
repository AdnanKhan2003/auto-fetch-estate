"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { ArrowUpDown, ExternalLink } from "lucide-react";

import { COMMA_REGEX, NUMERIC_REGEX } from "@/lib/regex";
import { parseIndianNumber, calculateRatePerSqft } from "@/lib/format-utils";
import Link from "next/link";

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
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-muted/30 border border-border/50 text-xs font-mono text-muted-foreground">
          {row.index + 1}
        </div>
      </div>
    ),
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
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
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
          {screenshot ? (
            <Image
              src={screenshot}
              alt="Property"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
              N/A
            </div>
          )}
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
    accessorFn: (row) => row.data?.carpetArea || row.data?.area,
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Area
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row }) => {
      const carpetArea = row.original.data?.carpetArea;
      const generalArea = row.original.data?.area;

      if (carpetArea) {
        return (
          <div className="flex flex-col">
            <span className="font-medium">{carpetArea}</span>
          </div>
        );
      }

      if (generalArea) {
        return (
          <div className="flex flex-col">
            <span>{generalArea}</span>
            <span className="text-[10px] text-amber-500/80 leading-tight mt-0.5">
              *Carpet area unknown
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
    cell: ({ row }) => {
      const data = row.original.data;

      // Calculate dynamic rate, fallback to AI-provided if calculation fails
      const calculatedRate = calculateRatePerSqft(
        data?.price,
        data?.carpetArea,
        data?.area,
      );
      const rateToDisplay = calculatedRate || data?.pricePerSqft;

      return (
        <div className="text-right font-black text-foreground">
          {rateToDisplay || "N/A"}
        </div>
      );
    },
  },
];
