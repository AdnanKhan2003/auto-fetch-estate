"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { EmptyState } from "./results-table/empty-state";
import { ResultsTableFooter } from "./results-table/results-table-footer";
import { SkeletonRow } from "./results-table/skeleton-row";
import { columns } from "./results-table/columns";
import { cn } from "@/lib/utils";

interface ResultsTableProps {
  results: any[];
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
  const isEmpty = results.length === 0 && pendingUrls.length === 0;
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data: results,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.url,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    enableRowSelection: true,
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Compare Prices
      </h2>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <Table>
          <TableHeader className="hover:bg-transparent border-none">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-none">
                {headerGroup.headers.map((header) => {
                  const meta: any = header.column.columnDef.meta;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "text-[10px] font-black uppercase text-muted-foreground",
                        meta?.headerClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <EmptyState />
            ) : (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick(row.original)}
                    className="cursor-pointer border-border transition-colors hover:bg-muted/40"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta: any = cell.column.columnDef.meta;
                      return (
                        <TableCell key={cell.id} className={meta?.cellClassName}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
                {pendingUrls.map((url) => (
                  <SkeletonRow key={url} />
                ))}
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
      </Card>
    </div>
  );
}

export default ResultsTable;

