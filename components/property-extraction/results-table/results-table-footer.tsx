import { Input } from "../../ui/input";
import { TableFooter, TableRow, TableCell } from "../../ui/table";

interface ResultsTableFooterProps {
  averagePrice: number;
  discountPercentage: number;
  setDiscountPercentage: (val: number) => void;
  discountedAverage: number;
}

export function ResultsTableFooter({
  averagePrice,
  discountPercentage,
  setDiscountPercentage,
  discountedAverage,
}: ResultsTableFooterProps) {
  return (
    <TableFooter className="border-t-0">
      <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
        <TableCell
          colSpan={6}
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
      </TableRow>
      <TableRow className="bg-background text-foreground hover:bg-background">
        <TableCell
          colSpan={6}
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
      </TableRow>
      <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
        <TableCell
          colSpan={6}
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
      </TableRow>
    </TableFooter>
  );
}
