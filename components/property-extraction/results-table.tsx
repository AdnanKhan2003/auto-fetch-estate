"use client";

import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Card } from "../ui/card";
import Image from "next/image";
import { Checkbox } from "../ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { EmptyState } from "./results-table/empty-state";
import { ResultsTableFooter } from "./results-table/results-table-footer";
import { SkeletonRow } from "./results-table/skeleton-row";
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
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [filterQuery, setFilterQuery] = useState("");
  const TABLE_HEADERS = [
    { id: "select", label: "" },
    { id: "image", label: "Image" },
    { id: "propertyTitle", label: "Property" },
    { id: "location", label: "Location" },
    { id: "price", label: "Price" },
    { id: "area", label: "Area" },
    { id: "pricePerSqft", label: "Rate/Sqft" },
  ];

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const processedData = useMemo(() => {
    let result = [...results];

    if (filterQuery) {
      result = result.filter(
        (item) =>
          item.data?.propertyTitle
            ?.toLowerCase()
            .includes(filterQuery.toLowerCase()) ||
          item.data?.location
            ?.toLowerCase()
            .includes(filterQuery.toLowerCase()),
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a.data?.[sortConfig.key];
        const bValue = b.data?.[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction == "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction == "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [results, filterQuery, sortConfig]);

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Compare Prices
      </h2>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="hover:bg-transparent border-none">
              <TableRow className="hover:bg-transparent border-none">
                {TABLE_HEADERS.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "cursor-pointer text-[10px] font-black uppercase text-muted-foreground tracking-widest py-4",
                      header.id === "select" ? "pl-6" : "px-4",
                      header.id === "pricePerSqft" ? "text-right pr-6" : "",
                    )}
                    onClick={() => handleSort(header.id)}
                  >
                    {header.id === "select" ? (
                      <div className="flex items-center h-full">
                        <Checkbox
                          checked={
                            processedData.length > 0 &&
                            Object.keys(rowSelection).length ===
                              processedData.length
                          }
                          onCheckedChange={(checked) => {
                            const newSelection: Record<string, boolean> = {};
                            if (checked)
                              processedData.forEach(
                                (p) => (newSelection[p.url] = true),
                              );
                            setRowSelection(newSelection);
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    ) : (
                      header.label
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <EmptyState />
              ) : (
                <>
                  {processedData.map((property, index) => (
                    <TableRow
                      key={property.url || index}
                      onClick={() => onRowClick(property)}
                    >
                      <TableCell
                        className="py-4 pl-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={!!rowSelection[property.url]}
                          onCheckedChange={(checked) => {
                            setRowSelection((prev) => ({
                              ...prev,
                              [property.url]: !!checked,
                            }));
                          }}
                        />
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        <div className="h-10 w-14 relative overflow-hidden rounded border border-border bg-muted">
                          {property.screenshotUrl ? (
                            <Image
                              src={property.screenshotUrl}
                              fill
                              className="object-cover"
                              alt="Property"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[9px]">
                              N/A
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-4 max-w-[250px]">
                        <p
                          className="truncate font-medium text-muted-foreground text-sm"
                          title={property.data?.propertyTitle}
                        >
                          {property.data?.propertyTitle}
                        </p>
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {property.data?.location}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {property.data?.price}
                      </TableCell>
                      <TableCell className="py-4 px-4">
                        {property.data?.area}
                      </TableCell>
                      <TableCell className="text-right pr-6 font-black text-foreground">
                        {property.data?.pricePerSqft}
                      </TableCell>
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
        </div>
      </Card>
    </div>
  );
}

export default ResultsTable;
