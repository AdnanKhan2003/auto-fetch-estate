import { Input } from "../../ui/input";
import { TableFooter, TableRow, TableCell } from "../../ui/table";

interface ResultsTableFooterProps {
  averagePrice: number;
  discountPercentage: number;
  setDiscountPercentage: (val: number) => void;
  discountedAverage: number;
  showTotalArea: boolean;
  totalCarpetArea: number;
  estimatedCount: number;
}

export function ResultsTableFooter({
  averagePrice,
  discountPercentage,
  setDiscountPercentage,
  discountedAverage,
  showTotalArea,
  totalCarpetArea,
  estimatedCount,
}: ResultsTableFooterProps) {
  // When "Calc. Carpet Area" column is visible (showTotalArea ON) there are 9
  // columns total, so the label cell must span 8; otherwise 7.
  const labelSpan = showTotalArea ? 8 : 7;

  return (
    <TableFooter className="border-t-0">
      {/* ── Total Carpet Area (shown when toggle is ON) ── */}
      {showTotalArea && (
        <TableRow className="bg-muted/40 text-foreground hover:bg-muted/40 border-b border-border/50">
          {/* Label spans cols 1-7 (up to and including Area col) */}
          <TableCell
            colSpan={7}
            className="py-3 pl-6 text-right font-medium text-muted-foreground"
          >
            <span>Total Carpet Area</span>
            {estimatedCount > 0 && (
              <span className="ml-2 text-[10px] font-normal text-amber-500/80">
                ({estimatedCount} row{estimatedCount > 1 ? "s" : ""} estimated via factor)
              </span>
            )}
          </TableCell>
          {/* Value lands under the "Calc. Carpet Area" column (col 8) */}
          <TableCell colSpan={1} className="py-3 px-4 text-left">
            <span className="text-xl font-black text-foreground">
              {totalCarpetArea > 0
                ? `${totalCarpetArea.toLocaleString("en-IN")} sqft`
                : "—"}
            </span>
          </TableCell>
          {/* Empty cell for Rate/Sqft AND actions columns */}
          <TableCell colSpan={2} className="py-3 pr-6" />
        </TableRow>
      )}


      {/* ── Avg Price/sqft ── */}
      <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 text-right font-medium text-secondary-foreground/70"
        >
          Avg Price/sqft:
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <span className="text-xl font-black text-secondary-foreground">
            {averagePrice > 0
              ? `₹${averagePrice.toLocaleString("en-IN")}`
              : "—"}
          </span>
        </TableCell>
        {/* Empty cell for actions column */}
        <TableCell colSpan={1} />
      </TableRow>

      {/* ── Discount % ── */}
      <TableRow className="bg-background text-foreground hover:bg-background">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 text-right font-medium text-muted-foreground"
        >
          Discount %
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <div className="flex items-center justify-end gap-2">
            <Input
              id="discountPercentage"
              aria-label="Discount Percentage"
              type="number"
              min={0}
              max={100}
              value={discountPercentage}
              onChange={(e) => {
                const value = Number(e.target.value);
                setDiscountPercentage(
                  Number.isNaN(value) ? 0 : Math.min(100, Math.max(0, value)),
                );
              }}
              className="h-9 w-24 bg-background text-right text-foreground font-black text-lg border-border"
            />
            <span className="text-lg font-black text-foreground">%</span>
          </div>
        </TableCell>
        {/* Empty cell for actions column */}
        <TableCell colSpan={1} />
      </TableRow>

      {/* ── Discounted Avg Price/sqft ── */}
      <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 text-right font-medium text-secondary-foreground/70"
        >
          Discounted Avg Price/sqft:
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <span className="text-2xl font-black text-secondary-foreground">
            {discountedAverage > 0
              ? `₹${discountedAverage.toLocaleString("en-IN")}`
              : "—"}
          </span>
        </TableCell>
        {/* Empty cell for actions column */}
        <TableCell colSpan={1} />
      </TableRow>
    </TableFooter>
  );
}
