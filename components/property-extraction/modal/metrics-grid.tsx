import MetricCard from "./metric-card";

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
          value: data?.pricePerSqft,
        },
        { label: "Total Area", value: data?.area },
        {
          label: "Bldg Age",
          value: data?.ageOfBuilding,
        },
      ].map((stat, i) => (
        <MetricCard
          key={i}
          label={stat.label}
          value={stat.value}
          highlight={stat.highlight}
        />
      ))}
    </section>
  );
}
