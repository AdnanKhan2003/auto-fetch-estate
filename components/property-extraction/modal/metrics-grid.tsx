import MetricCard from "./metric-card";
import { calculateRatePerSqft } from "@/lib/format-utils";

interface MetricsGridProps {
  data?: any;
}

export function MetricsGrid({ data }: MetricsGridProps) {
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
          value: calculateRatePerSqft(data?.price, data?.carpetArea, data?.area) || data?.pricePerSqft,
        },
        { 
          label: "Total Area", 
          value: data?.carpetArea || data?.area,
          subtext: (!data?.carpetArea && data?.area) ? "*Carpet area unknown" : undefined
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
