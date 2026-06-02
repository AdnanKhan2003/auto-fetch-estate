import { useEffect, useState } from "react";
import MetricCard from "./metric-card";
import { formatRatePerSqft, parseIndianPrice } from "@/lib/format-utils";
import { Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import TooltipWrapper from "@/components/tooltip/tooltip";

interface MetricsGridProps {
  data?: any;
  propertyId?: string;
  onUpdate?: (id: string, update: any) => void;
}

const AreaInput = ({
  propertyId,
  initialArea,
  onUpdate,
}: {
  propertyId: string;
  initialArea: string;
  onUpdate: any;
}) => {
  const numericArea = initialArea ? parseIndianPrice(initialArea) : 0;
  const [val, setVal] = useState(numericArea ? numericArea.toString() : "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setVal(numericArea ? numericArea.toString() : "");
  }, [initialArea]);

  const handleSave = () => {
    setIsEditing(false);
    const num = Number(val);
    if (!Number.isNaN(num) && num > 0 && onUpdate && propertyId) {
      onUpdate(propertyId, { carpetArea: `${num} sqft` });
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setIsEditing(false);
        }}
        autoFocus
        className="w-full bg-transparent text-xl font-bold border-b border-primary/50 focus:outline-hidden focus:border-primary text-foreground font-mono"
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {initialArea || "N/A"}
      <span
        onClick={() => setIsEditing(true)}
        title="Edit area"
        className="cursor-pointer group/pencil inline-flex items-center"
      >
        <TooltipWrapper content="Edit Area">
          <Pencil className="h-4 w-4 text-muted-foreground/40 group-hover/pencil:text-foreground shrink-0 transition-colors" />
        </TooltipWrapper>
      </span>
    </span>
  );
};

const RateInput = ({
  propertyId,
  initialRate,
  onUpdate,
}: {
  propertyId: string;
  initialRate: string;
  onUpdate: any;
}) => {
  const numericRate = initialRate ? parseIndianPrice(initialRate) : 0;
  const [val, setVal] = useState(numericRate ? numericRate.toString() : "");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setVal(numericRate ? numericRate.toString() : "");
  }, [initialRate]);

  const handleSave = () => {
    setIsEditing(false);
    const num = Number(val);
    if (!Number.isNaN(num) && num > 0 && onUpdate && propertyId) {
      onUpdate(propertyId, {
        pricePerSqft: `₹${num.toLocaleString("en-IN")}/sqft`,
      });
    }
  };

  if (isEditing) {
    return (
      <Input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") setIsEditing(false);
        }}
        autoFocus
        className="w-full bg-transparent text-xl font-bold border-b border-primary/50 focus:outline-hidden focus:border-primary text-foreground font-mono"
      />
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      {initialRate || "N/A"}
      <span
        onClick={() => setIsEditing(true)}
        title="Edit rate per sqft"
        className="cursor-pointer group/pencil inline-flex items-center"
      >
        <TooltipWrapper content="Edit Rate / Sqft">
          <Pencil className="h-4 w-4 text-muted-foreground/40 group-hover/pencil:text-foreground shrink-0 transition-colors" />
        </TooltipWrapper>
      </span>
    </span>
  );
};

export function MetricsGrid({ data, propertyId, onUpdate }: MetricsGridProps) {
  let effectiveArea: number | null = null;
  if (data?.carpetArea) {
    effectiveArea = parseIndianPrice(data.carpetArea);
  } else if (data?.builtupArea) {
    effectiveArea = parseIndianPrice(data.builtupArea) * 0.85;
  } else if (data?.superBuiltupArea) {
    effectiveArea = parseIndianPrice(data.superBuiltupArea) * 0.72;
  } else if (data?.area) {
    effectiveArea = parseIndianPrice(data.area) * 0.72;
  }

  let areaToDisplay =
    data?.carpetArea ||
    data?.builtupArea ||
    data?.superBuiltupArea ||
    data?.area;
  let areaLabel = undefined;
  if (!data?.carpetArea) {
    if (data?.builtupArea) areaLabel = "*Built-up area";
    else if (data?.superBuiltupArea) areaLabel = "*Super built-up area";
    else if (data?.area) areaLabel = "*Carpet area unknown";
  }
  const rateToDisplay =
    formatRatePerSqft(data?.price, effectiveArea) || data?.pricePerSqft;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Market Price" value={data?.price} highlight={true} />
      <MetricCard
        label="Rate / Sqft"
        value={
          propertyId && onUpdate ? (
            <RateInput
              propertyId={propertyId}
              initialRate={rateToDisplay}
              onUpdate={onUpdate}
            />
          ) : (
            rateToDisplay
          )
        }
      />

      <MetricCard
        label="Total Area"
        value={
          propertyId && onUpdate ? (
            <AreaInput
              propertyId={propertyId}
              initialArea={areaToDisplay}
              onUpdate={onUpdate}
            />
          ) : (
            areaToDisplay
          )
        }
        subtext={areaLabel}
      />

      <MetricCard label="Building Age" value={data?.ageOfBuilding} />
    </section>
  );
}
