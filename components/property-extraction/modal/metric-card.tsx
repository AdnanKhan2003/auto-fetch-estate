interface MetricCardProps {
  label: string;
  value: string | number | null | undefined;
  highlight?: boolean;
}

function MetricCard({ label, value, highlight = false }: MetricCardProps) {
  return (
    <div
      className={`min-w-0 overflow-hidden rounded-xl border border-border p-6 
        ${
          highlight
            ? "bg-primary text-primary-foreground shadow-lg"
            : "bg-card text-card-foreground"
        }
        `}
    >
      <p
        className={`mb-2 text-[10px] font-black uppercase tracking-widest ${
          highlight ? "text-shadow-primary/70" : "text-muted-foreground"
        }`}
      >
        {label}
      </p>
      <p className="text-xl font-bold tracking-tight truncate">
        {value || "N/A"}
      </p>
    </div>
  );
}

export default MetricCard;
