import MetricCard from "./metric-card";
import { calculateRatePerSqft, parseIndianNumber } from "@/lib/format-utils";

interface MetricsGridProps {
  data?: any;
}

export function MetricsGrid({ data }: MetricsGridProps) {
  let effectiveArea: number | null = null;
  if (data?.carpetArea) {
    effectiveArea = parseIndianNumber(data.carpetArea);
  } else if (data?.builtupArea) {
    effectiveArea = parseIndianNumber(data.builtupArea) * 0.85;
  } else if (data?.superBuiltupArea) {
    effectiveArea = parseIndianNumber(data.superBuiltupArea) * 0.72;
  } else if (data?.area) {
    effectiveArea = parseIndianNumber(data.area) * 0.72;
  }

  let areaToDisplay = data?.carpetArea || data?.builtupArea || data?.superBuiltupArea || data?.area;
  let areaLabel = undefined;
  if (!data?.carpetArea) {
    if (data?.builtupArea) areaLabel = "*Built-up area";
    else if (data?.superBuiltupArea) areaLabel = "*Super built-up area";
    else if (data?.area) areaLabel = "*Carpet area unknown";
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: "Market Price",
          value: data?.price,
          highlight: true,
        },
        {
          label: "Rate / Sqft",
          value:
            calculateRatePerSqft(data?.price, effectiveArea) ||
            data?.pricePerSqft,
        },
        {
          label: "Total Area",
          value: areaToDisplay,
          subtext: areaLabel,
        },
        {
          label: "Bldg Age",
          value: data?.ageOfBuilding,
        },
      ].map((stat, i) => (
        <MetricCard
          key={i}
          label={stat.label}
          value={stat.value}
          subtext={stat.subtext}
          highlight={stat.highlight}
        />
      ))}
    </section>
  );
}
