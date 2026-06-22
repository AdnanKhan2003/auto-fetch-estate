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
  adoptedRate: number;
  setAdoptedRate: (val: number) => void;
}

export function ResultsTableFooter({
  averagePrice,
  discountPercentage,
  setDiscountPercentage,
  discountedAverage,
  showTotalArea,
  totalCarpetArea,
  estimatedCount,
  adoptedRate,
  setAdoptedRate,
}: ResultsTableFooterProps) {
  // When "Calc. Carpet Area" column is visible (showTotalArea ON) there are 9
  // columns total, so the label cell must span 8; otherwise 7.
  const labelSpan = showTotalArea ? 9 : 8;

  return (
    <TableFooter className="border-t-0">
      {/* ── Total Carpet Area (shown when toggle is ON) ── */}
      {showTotalArea && (
        <TableRow className="bg-muted/40 hover:bg-muted/40 border-border/50 border-b text-foreground">
          {/* Label spans cols 1-7 (up to and including Area col) */}
          <TableCell
            colSpan={8}
            className="py-3 pl-6 font-medium text-muted-foreground text-right"
          >
            <span>Total Carpet Area</span>
            {estimatedCount > 0 && (
              <span className="ml-2 font-normal text-[10px] text-amber-500/80">
                ({estimatedCount} row{estimatedCount > 1 ? "s" : ""} estimated
                via factor)
              </span>
            )}
          </TableCell>
          {/* Value lands under the "Calc. Carpet Area" column (col 8) */}
          <TableCell colSpan={1} className="px-4 py-3 text-left">
            <span className="font-black text-foreground text-xl">
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
      <TableRow className="bg-secondary hover:bg-secondary text-secondary-foreground">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 font-medium text-secondary-foreground/70 text-right"
        >
          Avg Price/sqft:
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <span className="font-black text-secondary-foreground text-xl">
            {averagePrice > 0
              ? `₹${averagePrice.toLocaleString("en-IN")}`
              : "—"}
          </span>
        </TableCell>
        {/* Empty cell for actions column */}
        <TableCell colSpan={1} />
      </TableRow>

      {/* ── Discount % ── */}
      <TableRow className="bg-background hover:bg-background text-foreground">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 font-medium text-muted-foreground text-right"
        >
          Discount %
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <div className="flex justify-end items-center gap-2">
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
              className="bg-background border-border w-24 h-9 font-black text-foreground text-lg text-right"
            />
            <span className="font-black text-foreground text-lg">%</span>
          </div>
        </TableCell>
        {/* Empty cell for actions column */}
        <TableCell colSpan={1} />
      </TableRow>

      {/* ── Discounted Avg Price/sqft ── */}
      <TableRow className="bg-secondary hover:bg-secondary text-secondary-foreground">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 font-medium text-secondary-foreground/70 text-right"
        >
          Discounted Avg Price/sqft:
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <span className="font-black text-secondary-foreground text-2xl">
            {discountedAverage > 0
              ? `₹${discountedAverage.toLocaleString("en-IN")}`
              : "—"}
          </span>
        </TableCell>
        {/* Empty cell for actions column */}
        <TableCell colSpan={1} />
      </TableRow>
      <TableRow className="bg-background hover:bg-background border-5 text-foreground">
        <TableCell
          colSpan={labelSpan}
          className="py-4 pl-6 font-medium text-muted-foreground text-right"
        >
          Adopted Rate / sqft:
        </TableCell>
        <TableCell colSpan={1} className="py-4 pr-6 text-right">
          <div className="flex justify-end items-center gap-1">
            <span className="font-black text-foreground text-lg">₹</span>
            <Input
              id="adoptedRate"
              aria-label="Adopted Rate"
              type="number"
              min={0}
              value={adoptedRate}
              onChange={(e) => {
                const value = Number(e.target.value);
                setAdoptedRate(Number.isNaN(value) ? 0 : Math.max(0, value));
              }}
              className="bg-background border-border w-28 h-9 font-black text-foreground text-lg text-right"
            />
          </div>
        </TableCell>
        <TableCell colSpan={1} />
      </TableRow>
    </TableFooter>
  );
}
