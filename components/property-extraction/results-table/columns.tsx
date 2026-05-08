import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";

// Helper to sort strings that contain numbers (like "₹24,286/sqft" or "1,200 sqft")
const numericStringSort = (rowA: any, rowB: any, columnId: string) => {
  const parseNum = (val: any) => {
    if (!val) return 0;
    const match = String(val).replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
    return match ? Number(match[1]) : 0;
  };
  const a = parseNum(rowA.getValue(columnId));
  const b = parseNum(rowB.getValue(columnId));
  return a < b ? -1 : a > b ? 1 : 0;
};

export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center h-full">
        <span className="sr-only">Select properties for analysis</span>
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all properties for analysis"
          title="Select all properties for analysis"
          className="cursor-pointer"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center h-full">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          onClick={(e) => e.stopPropagation()}
          aria-label="Select row"
          className="cursor-pointer"
        />
      </div>
    ),
    meta: {
      headerClassName: "w-10 py-4 pl-4",
      cellClassName: "py-4 pl-4 w-10",
    }
  },
  {
    accessorKey: "screenshotUrl",
    header: "Evidence",
    cell: ({ row }) => {
      const url = row.getValue("screenshotUrl") as string | undefined;
      const title = row.original?.data?.propertyTitle || "Property screenshot";
      return (
        <div className="h-10 w-14 relative overflow-hidden rounded border border-border bg-muted">
          {url ? (
            <Image
              src={url}
              fill
              className="object-cover transition-all duration-700"
              alt={`Screenshot of ${title}`}
              title={`Screenshot of ${title}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
              N/A
            </div>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[100px] py-4 pl-2",
      cellClassName: "py-4 pl-2",
    }
  },
  {
    id: "propertyTitle",
    accessorFn: (row) => row.data?.propertyTitle,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center gap-1 uppercase hover:text-foreground transition-colors cursor-pointer"
      >
        Property
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ getValue }) => {
      const title = getValue() as string | undefined;
      return (
        <p
          className="truncate text-sm font-bold text-foreground"
          title={title || ""}
        >
          {title || "Pending Analysis..."}
        </p>
      );
    },
    meta: {
      headerClassName: "max-w-[180px] py-4",
      cellClassName: "py-4 max-w-[180px]",
    }
  },
  {
    id: "pricePerSqft",
    accessorFn: (row) => row.data?.pricePerSqft,
    sortingFn: numericStringSort,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-center gap-1 w-full uppercase hover:text-foreground transition-colors cursor-pointer"
      >
        Price/sqft
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ getValue }) => {
      const val = getValue() as string | undefined;
      return <>{val || "-"}</>;
    },
    meta: {
      headerClassName: "py-4 text-center",
      cellClassName: "py-4 text-center font-black text-foreground",
    }
  },
  {
    id: "area",
    accessorFn: (row) => row.data?.area || row.data?.carpetArea,
    sortingFn: numericStringSort,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-center gap-1 w-full uppercase hover:text-foreground transition-colors cursor-pointer"
      >
        Area
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ getValue }) => {
      const val = getValue() as string | undefined;
      return <>{val || "-"}</>;
    },
    meta: {
      headerClassName: "py-4 text-center",
      cellClassName: "py-4 text-center font-medium text-muted-foreground",
    }
  },
  {
    id: "location",
    accessorFn: (row) => row.data?.location,
    header: ({ column }) => (
      <button
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="flex items-center justify-end gap-1 w-full uppercase hover:text-foreground transition-colors cursor-pointer"
      >
        Locality
        <ArrowUpDown className="h-3 w-3" />
      </button>
    ),
    cell: ({ getValue }) => {
      const val = getValue() as string | undefined;
      return <>{val || "-"}</>;
    },
    meta: {
      headerClassName: "py-4 pr-6 text-right",
      cellClassName: "py-4 pr-6 text-right text-sm text-muted-foreground",
    }
  },
];
