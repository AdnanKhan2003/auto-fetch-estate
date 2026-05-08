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
        <div
          key={i}
          className={`min-w-0 overflow-hidden rounded-xl border border-border p-6 ${stat.highlight ? "bg-primary text-primary-foreground shadow-lg" : "bg-card text-card-foreground"}`}
        >
          <p
            className={`mb-2 text-[10px] font-black uppercase tracking-widest ${stat.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}
          >
            {stat.label}
          </p>
          <p className="text-xl font-bold tracking-tight truncate">
            {stat.value || "N/A"}
          </p>
        </div>
      ))}
    </section>
  );
}
