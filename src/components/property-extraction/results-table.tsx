"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
  focusedUrl: string | null;
  globalConversionFactor: number;
  rowFactors: Record<string, number>;
  setRowFactors: Dispatch<SetStateAction<Record<string, number>>>;
  showTotalArea: boolean;
  setShowTotalArea: (val: boolean) => void;
  totalCarpetArea: number;
  estimatedCount: number;
  originalUrls: string[];
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
  focusedUrl,
  globalConversionFactor,
  rowFactors,
  setRowFactors,
  showTotalArea,
  setShowTotalArea,
  totalCarpetArea,
  estimatedCount,
  originalUrls,
}: ResultsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: results,
    columns,
    state: {
      sorting,
      rowSelection,
      // Show the "Calc. Carpet Area" column only when the Σ Total Area toggle is ON
      columnVisibility: { calculatedCarpetArea: showTotalArea },
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.url,
    enableSortingRemoval: true,
    meta: { globalConversionFactor, rowFactors, setRowFactors, originalUrls },
  });

  useEffect(() => {
    if (focusedUrl) {
      const rowId = `row-${btoa(focusedUrl).replaceAll("=", "")}`;
      const element = document.getElementById(rowId);

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [focusedUrl]);

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <div className="px-1 flex items-center justify-between">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Compare Prices
        </h2>
        <button
          onClick={() => {
            const turningOn = !showTotalArea;
            setShowTotalArea(turningOn);
            if (turningOn) {
              // Select ALL rows so user sees every row is counted
              setRowSelection(
                Object.fromEntries(results.map((r) => [r.url, true])),
              );
            } else {
              // Restore to only rows that have actual carpet area
              setRowSelection(
                Object.fromEntries(
                  results
                    .filter((r) => r.data?.carpetArea)
                    .map((r) => [r.url, true]),
                ),
              );
            }
          }}
          aria-pressed={showTotalArea}
          aria-label="Toggle total carpet area"
          className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-md border transition-all duration-200 cursor-pointer ${
            showTotalArea
              ? "bg-foreground text-background border-foreground"
              : "text-muted-foreground border-border hover:text-foreground hover:border-foreground/40"
          }`}
        >
          Σ Calculate Missing Carpet Area
        </button>
      </div>
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
                  {table.getRowModel().rows.map((row) => {
                    const rowId = `row-${btoa(row.original.url).replaceAll("=", "")}`;
                    const isFocused = focusedUrl === row.original.url;
                    return (
                      <TableRow
                        key={row.id}
                        id={rowId}
                        data-state={row.getIsSelected() && "selected"}
                        // className={`border-b transition-all duration-300 hover:bg-muted/50 cursor-pointer
                        //    ${isFocused ? "bg-black/20! dark:bg-white/15! border-1-foreground" : "border-1-transparent"}
                        //   `}
                        className={`border-b transition-all duration-300 cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 data-[state=selected]:hover:bg-black/10 dark:data-[state=selected]:hover:bg-muted/80
 
${isFocused ? "bg-black/10! dark:bg-white/15!" : ""}




                          `}
                        onClick={() => onRowClick(row.original)}
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell
                            key={cell.id}
                            className={`
                            py-4 relative 
                            ${cell.column.id === "select" ? "pl-6 w-[50px]" : "px-4"}
                            ${cell.column.id === "data_pricePerSqft" ? "pr-6 text-right font-black text-foreground" : ""}
                     ${isFocused ? "first:before:absolute first:before:left-0 first:before:top-0 first:before:bottom-0 first:before:w-1 first:before:bg-foreground first:before:rounded-full" : ""}



                          `}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
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
              showTotalArea={showTotalArea}
              totalCarpetArea={totalCarpetArea}
              estimatedCount={estimatedCount}
            />
          </Table>
        </div>
      </Card>
    </div>
  );
}

export default ResultsTable;
