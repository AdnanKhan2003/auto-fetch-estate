import { MapPin, Ruler, Home, ArrowRight, ShieldCheck } from "lucide-react";

interface TechnicalMatrixProps {
  data?: any;
}

export function TechnicalMatrix({ data }: TechnicalMatrixProps) {
  const dynamicFeatures = Object.entries(data?.additionalFeatures || {}).map(
    ([key, value]) => ({
      label: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
      value: String(value),
      icon: <ArrowRight size={14} />,
    })
  );

  const rows = [
    {
      label: "Locality",
      value: data?.location,
      icon: <MapPin size={14} />,
    },
    {
      label: "Internal Floor Area",
      value: data?.carpetArea,
      icon: <Ruler size={14} />,
    },
    {
      label: "Vertical Position",
      value: data?.floorNo,
      icon: <Home size={14} />,
    },
    {
      label: "Cardinal Facing",
      value: data?.facing,
      icon: <ArrowRight size={14} />,
    },
    {
      label: "Furnishing Status",
      value: data?.furnishingStatus,
      icon: <Home size={14} />,
    },
    {
      label: "Legal Status",
      value: data?.reraApproved
        ? "RERA Approved"
        : data?.legalStatus || "Pending",
      icon: <ShieldCheck size={14} />,
    },
    ...dynamicFeatures,
  ].filter(
    (row) => row.value && row.value !== "Pending" && row.value !== "undefined" && row.value !== "null"
  );

  return (
    <div className="space-y-6">
      <h4 className="border-b border-border pb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
        Technical Matrix
      </h4>
      <div className="space-y-4">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
          >
            <span className="flex items-center gap-3 text-muted-foreground">
              {row.icon} {row.label}
            </span>
            <span
              className="font-semibold text-foreground text-right max-w-[60%] truncate"
              title={row.value}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
