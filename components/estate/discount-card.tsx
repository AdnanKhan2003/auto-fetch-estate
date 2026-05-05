import { Input } from "../ui/input";

interface DiscountConfigCardProps {
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
}

function DiscountCard({
  discountPercentage,
  setDiscountPercentage,
}: DiscountConfigCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-card-foreground">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">
            Discount Configuration
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Apply discount percentage on aggregated average.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="discountPercentage"
            className="text-sm font-medium text-muted-foreground"
          >
            Discount %
          </label>

          <Input
            id="discountPercentage"
            type="number"
            min={0}
            max={100}
            value={discountPercentage}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (Number.isNaN(value)) {
                setDiscountPercentage(0);
                return;
              }
              setDiscountPercentage(Math.min(100, Math.max(0, value)));
            }}
            className="h-10 w-28 bg-background text-right text-foreground"
          />
        </div>
      </div>
    </div>
  );
}

export default DiscountCard;