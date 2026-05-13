"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { ResultsTableFooter } from "./results-table/results-table-footer";
import { SkeletonRow } from "./results-table/skeleton-row";
import { columns } from "./results-table/columns";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { PropertyExtractionResult } from "@/features/property-extraction/scraper";

interface ResultsTableProps {
  results: PropertyExtractionResult[];
  pendingUrls: string[];
  onRowClick: (property: any) => void;
  averagePrice: number;
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
  discountedAverage: number;
  rowSelection: Record<string, boolean>;
  setRowSelection: Dispatch<SetStateAction<Record<string, boolean>>>;
}

function ResultsTable({
  results,
  pendingUrls,
  onRowClick,
  averagePrice,
  discountPercentage,
  setDiscountPercentage,
  discountedAverage,
  rowSelection,
  setRowSelection,
}: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  
  const table = useReactTable({
    data: results,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.url,
    enableSortingRemoval: false,
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Compare Prices
      </h2>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="hover:bg-transparent border-none">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-none"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={`
                        h-10 text-[10px] font-black uppercase text-muted-foreground tracking-widest py-4 cursor-pointer
                        ${header.id === "select" ? "pl-6 w-[50px]" : "px-4"}
                        ${header.id === "data_pricePerSqft" ? "pr-6 text-right" : ""}
                        `}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                      onClick={() => onRowClick(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={`
                            py-4 
                            ${cell.column.id === "select" ? "pl-6 w-[50px]" : "px-4"}
                            ${cell.column.id === "data_pricePerSqft" ? "pr-6 text-right font-black text-foreground" : ""}
                          `}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {pendingUrls.map((url) => (
                    <SkeletonRow key={url} />
                  ))}
                </>
              ) : (
                <>
                  {pendingUrls.length > 0 ? (
                    pendingUrls.map((url) => <SkeletonRow key={url} />)
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No properties extracted yet.
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
            <ResultsTableFooter
              averagePrice={averagePrice}
              discountPercentage={discountPercentage}
              setDiscountPercentage={setDiscountPercentage}
              discountedAverage={discountedAverage}
            />
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default ResultsTable;
