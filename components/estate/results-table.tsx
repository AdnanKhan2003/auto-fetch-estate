import { CheckSquare, Square } from "lucide-react";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ResultsTableProps {
  results: any[];
  pendingUrls: string[];
  onRowClick: (property: any) => void;
  averagePrice: number;
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
  discountedAverage: number;
  selectedUrls: Set<string>;
  onToggleUrl: (url: string) => void;
}

function SkeletonRow() {
  return (
    <TableRow className="animate-pulse border-border">
      <TableCell className="py-4 pl-4 w-10">
        <div className="mx-auto h-4 w-4 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 pl-2">
        <div className="h-10 w-14 rounded border border-border bg-muted" />
      </TableCell>
      <TableCell className="py-4">
        <div className="h-4 w-52 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 text-center">
        <div className="mx-auto h-4 w-24 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 text-center">
        <div className="mx-auto h-4 w-16 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 pr-6 text-right">
        <div className="ml-auto h-4 w-28 rounded bg-muted" />
      </TableCell>
    </TableRow>
  );
}

function ResultsTable({
  results,
  pendingUrls,
  onRowClick,
  averagePrice,
  discountPercentage,
  setDiscountPercentage,
  discountedAverage,
  selectedUrls,
  onToggleUrl,
}: ResultsTableProps) {
  const isEmpty = results.length === 0 && pendingUrls.length === 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Compare Prices
      </h2>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <Table>
          <TableHeader className="hover:bg-transparent border-none">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-10 py-4 pl-4 text-[10px] font-black uppercase text-muted-foreground">
                {/* checkbox */}
              </TableHead>
              <TableHead className="w-[100px] py-4 pl-2 text-[10px] font-black uppercase text-muted-foreground">
                Evidence
              </TableHead>
              <TableHead className="py-4 text-[10px] font-black uppercase text-muted-foreground">
                Property
              </TableHead>
              <TableHead className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
                Price/sqft
              </TableHead>
              <TableHead className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
                Area
              </TableHead>
              <TableHead className="py-4 pr-6 text-right text-[10px] font-black uppercase text-muted-foreground">
                Locality
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isEmpty ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium text-muted-foreground">
                      No results to compare yet.
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Enter listing URLs above to start your analysis.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              <>
                {results.map((item, idx) => (
                  <TableRow
                    key={idx}
                    onClick={() => onRowClick(item)}
                    className="cursor-pointer border-border transition-colors hover:bg-muted/40"
                  >
                    {/* Checkbox — stops row click so only toggle fires */}
                    <TableCell
                      className="py-4 pl-4 w-10"
                      onClick={(e) => { e.stopPropagation(); onToggleUrl(item.url); }}
                    >
                      <button className="flex items-center justify-center cursor-pointer">
                        {selectedUrls.has(item.url) ? (
                          <CheckSquare size={18} className="text-primary transition-colors" />
                        ) : (
                          <Square size={18} className="text-muted-foreground/40 transition-colors" />
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="py-4 pl-2">
                      <div className="h-10 w-14 overflow-hidden rounded border border-border bg-muted">
                        {item.screenshotUrl ? (
                          <img
                            src={item.screenshotUrl}
                            className="object-cover w-full h-full transition-all duration-700"
                            alt="screenshot"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
                            N/A
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 font-bold text-foreground">
                      {item.data?.propertyTitle || "Pending Analysis..."}
                    </TableCell>
                    <TableCell className="py-4 text-center font-black text-foreground">
                      {item.data?.pricePerSqft || "-"}
                    </TableCell>
                    <TableCell className="py-4 text-center font-medium text-muted-foreground">
                      {item.data?.area || item.data?.carpetArea || "-"}
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right text-sm text-muted-foreground">
                      {item.data?.location || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Skeleton rows for URLs still being scraped */}
                {pendingUrls.map((url) => (
                  <SkeletonRow key={url} />
                ))}
              </>
            )}
          </TableBody>
          <TableFooter className="border-t-0">
            <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
              <TableCell
                colSpan={4}
                className="py-4 pl-6 text-right font-medium text-secondary-foreground/70"
              >
                Avg Price/sqft:
              </TableCell>
              <TableCell colSpan={2} className="py-4 pr-6 text-right">
                <span className="text-xl font-black text-secondary-foreground">
                  {averagePrice > 0
                    ? `₹${averagePrice.toLocaleString("en-IN")}`
                    : "—"}
                </span>
              </TableCell>
            </TableRow>
            <TableRow className="bg-background text-foreground hover:bg-background">
              <TableCell
                colSpan={4}
                className="py-4 pl-6 text-right font-medium text-muted-foreground"
              >
                Discount %
              </TableCell>
              <TableCell colSpan={2} className="py-4 pr-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Input
                    id="discountPercentage"
                    type="number"
                    min={0}
                    max={100}
                    value={discountPercentage}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      setDiscountPercentage(
                        Number.isNaN(value) ? 0 : Math.min(100, Math.max(0, value))
                      );
                    }}
                    className="h-9 w-24 bg-background text-right text-foreground font-black text-lg border-border"
                  />
                  <span className="text-lg font-black text-foreground">%</span>
                </div>
              </TableCell>
            </TableRow>
            <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
              <TableCell
                colSpan={4}
                className="py-4 pl-6 text-right font-medium text-secondary-foreground/70"
              >
                Discounted Avg Price/sqft:
              </TableCell>
              <TableCell colSpan={2} className="py-4 pr-6 text-right">
                <span className="text-2xl font-black text-secondary-foreground">
                  {discountedAverage > 0
                    ? `₹${discountedAverage.toLocaleString("en-IN")}`
                    : "—"}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  );
}

export default ResultsTable;
