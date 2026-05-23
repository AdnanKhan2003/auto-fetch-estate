import { MapPin, Ruler, Home, ArrowRight, ShieldCheck } from "lucide-react";
import SectionHeader from "./section-header";

interface TechnicalMatrixProps {
  data?: any;
}

export function TechnicalMatrix({ data }: TechnicalMatrixProps) {
  const dynamicFeatures = Object.entries(data?.additionalFeatures || {}).map(
    ([key, value]) => ({
      label: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      value: String(value),
      icon: <ArrowRight size={14} />,
    }),
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
    (row) =>
      row.value &&
      row.value !== "Pending" &&
      row.value !== "undefined" &&
      row.value !== "null",
  );

  return (
    <div className="space-y-6">
      <SectionHeader title="Technical Matrix" />
      <div className="space-y-4">
        {rows.length > 0 ? (
          rows.map((row, i) => (
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
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed border-border/50">
            <span className="text-sm">No technical metrics found for this listing.</span>
          </div>
        )}
      </div>
    </div>
  );
}
