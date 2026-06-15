import { MapPin, Ruler, Home, ArrowRight, ShieldCheck } from "lucide-react";
import SectionHeader from "./section-header";

interface TechnicalMatrixProps {
  data?: any;
}

export function TechnicalMatrix({ data }: TechnicalMatrixProps) {
  const dynamicFeatures = (
    Array.isArray(data?.additionalFeatures) ? data.additionalFeatures : []
  ).map((feature: any) => ({
    label: feature.featureName
      ? feature.featureName.replace(/^./, (str: string) => str.toUpperCase())
      : "Feature",
    value: String(feature.featureValue || ""),
    icon: <ArrowRight size={14} />,
  }));

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
              className="flex justify-between items-start gap-4 py-2 border-border last:border-0 border-b text-sm"
            >
              <span className="flex items-center gap-3 mt-0.5 w-1/3 text-muted-foreground shrink-0">
                <span className="mt-0.5 shrink-0">{row.icon}</span>
                <span className="leading-snug">{row.label}</span>
              </span>
              <span
                className="max-w-[60%] font-semibold text-foreground text-right"
                title={row.value}
              >
                {row.value}
              </span>
            </div>
          ))
        ) : (
          <div className="flex flex-col justify-center items-center bg-muted/20 py-6 border border-border/50 border-dashed rounded-md text-muted-foreground">
            <span className="text-sm">
              No technical metrics found for this listing.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
