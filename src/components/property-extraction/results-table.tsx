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
import { Button } from "../ui/button";
import { Scale } from "lucide-react";

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
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
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

  onDelete,
  onUpdate,
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
    meta: {
      globalConversionFactor,
      rowFactors,
      setRowFactors,
      onDelete,
      onUpdate,
    },
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
    <div className="space-y-4 animate-in duration-700 fade-in">
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className="flex justify-center items-center bg-primary/10 rounded-md w-6 h-6">
            <Scale className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="font-semibold text-foreground text-lg tracking-tight">
            Compare Prices
          </h2>
        </div>
        <Button
          variant="default"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md font-black text-[10px] text-background uppercase tracking-widest duration-200 cursor-pointer"
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
        >
          Σ Calculate Missing Carpet Area
        </Button>
      </div>
      <Card className="bg-card shadow-none border-border rounded-xl overflow-hidden">
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
              {table.getRowModel().rows.length > 0 || pendingUrls.length > 0 ? (
                <>
                  {(() => {
                    const renderedUrls = new Set<string>();

                    const renderRow = (row: any) => {
                      const rowId = `row-${btoa(row.original.url).replaceAll("=", "")}`;
                      const isFocused = focusedUrl === row.original.url;
                      return (
                        <TableRow
                          key={row.id}
                          id={rowId}
                          data-state={row.getIsSelected() && "selected"}
                          className={`border-b cursor-pointer hover:bg-black/10 dark:hover:bg-muted/50 transition-all duration-300 data-[state=selected]:hover:bg-black/10 dark:data-[state=selected]:hover:bg-muted/80 ${isFocused ? "bg-black/10! dark:bg-white/15!" : ""}`}
                          onClick={() => onRowClick(row.original)}
                        >
                          {row.getVisibleCells().map((cell: any) => (
                            <TableCell
                              key={cell.id}
                              className={`py-4 relative 
                              ${cell.column.id === "select" ? "pl-6 w-[50px]" : "px-4"}
                              ${cell.column.id === "data_pricePerSqft" ? "pr-6 text-right font-black text-foreground" : ""}
                              ${isFocused ? "first:before:absolute first:before:left-0 first:before:top-0 first:before:bottom-0 first:before:w-1 first:before:bg-foreground first:before:rounded-full" : ""}`}
                            >
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    };

                    // WITH THIS:
                    const isSortingActive = sorting && sorting.length > 0;

                    if (isSortingActive) {
                      // 1. Render all rows in their sorted order
                      const sortedNodes = table
                        .getRowModel()
                        .rows.map((row) => renderRow(row));

                      // 2. Append pending loading skeletons to the bottom
                      const loadingNodes = pendingUrls.map((url) => (
                        <SkeletonRow key={`skel-${url}`} />
                      ));

                      return [...sortedNodes, ...loadingNodes];
                    }

                    // No sorting active — render in natural order
                    const naturalNodes = table
                      .getRowModel()
                      .rows.map((row) => renderRow(row));

                    const extraSkeletons = pendingUrls
                      .filter(
                        (url: string) =>
                          !table
                            .getRowModel()
                            .rows.some((r) => r.original.url === url),
                      )
                      .map((url: string) => (
                        <SkeletonRow key={`skel-${url}`} />
                      ));

                    return [...naturalNodes, ...extraSkeletons];
                  })()}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-muted-foreground text-center"
                  >
                    No properties extracted yet.
                  </TableCell>
                </TableRow>
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
