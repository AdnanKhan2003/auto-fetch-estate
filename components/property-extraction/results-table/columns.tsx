"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";
import { ArrowUpDown } from "lucide-react";

// Smart helper to sort Indian currency and numeric strings
const smartNumericSort = (rowA: any, rowB: any, columnId: string) => {
  const parseIndianPrice = (val: any) => {
    if (!val) return 0;
    const str = String(val).toLowerCase().replace(/,/g, "");
    
    // Extract the number part
    const match = str.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;
    let num = Number(match[1]);

    // Multiply based on unit
    if (str.includes("cr") || str.includes("crore")) {
      num *= 10000000;
    } else if (str.includes("lac") || str.includes("lakh") || str.includes(" l")) {
      num *= 100000;
    } else if (str.includes("k")) {
      num *= 1000;
    }
    
    return num;
  };

  const a = parseIndianPrice(rowA.getValue(columnId));
  const b = parseIndianPrice(rowB.getValue(columnId));
  
  return a < b ? -1 : a > b ? 1 : 0;
};

export const columns: ColumnDef<PropertyExtractionResult>[] = [
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
    cell: ({ row }) => (
      <div className="max-w-[250px]">
        <p className="truncate font-medium text-muted-foreground text-sm">
          {row.original.data?.propertyTitle || "Unknown Property"}
        </p>
      </div>
    ),
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
    accessorKey: "data.area",
    header: ({ column }) => (
      <div className="flex items-center gap-1">
        Area
        <ArrowUpDown className="h-3 w-3 opacity-50" />
      </div>
    ),
    sortingFn: smartNumericSort,
    cell: ({ row }) => <span>{row.original.data?.area || "N/A"}</span>,
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
      const rate = row.original.data?.pricePerSqft;
      return (
        <div className="text-right font-black text-foreground">
          {rate || "N/A"}
        </div>
      );
    },
  },
];
