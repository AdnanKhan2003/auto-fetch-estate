interface MetricCardProps {
  label: string;
  value: React.ReactNode;
  subtext?: React.ReactNode;
  highlight?: boolean;
}

function MetricCard({ label, value, subtext, highlight = false }: MetricCardProps) {
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
      <div className="flex flex-col">
        <p className="text-xl font-bold tracking-tight truncate">
          {value || "N/A"}
        </p>
        {subtext && (
          <span className="text-[10px] text-amber-500/80 leading-tight mt-1 truncate">
            {subtext}
          </span>
        )}
      </div>
    </div>
  );
}

export default MetricCard;
