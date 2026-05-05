import {
  ArrowRight,
  ExternalLink,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";

interface PropertyDetailsModalProps {
  property: any | null;
  onClose: () => void;
}

function PropertyDetailsModal({
  property,
  onClose,
}: PropertyDetailsModalProps) {
  return (
    <Dialog open={!!property} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-2xl border-border bg-card p-0 shadow-2xl sm:max-w-5xl">
        <DialogHeader className="flex-row items-center justify-between space-y-0 overflow-x-hidden border-b border-border bg-card p-6 sm:p-8">
          <div className="min-w-0 flex-1 space-y-1 text-card-foreground">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {property?.data?.propertyTitle || "Property Overview"}
            </DialogTitle>
            <div className="flex w-fit max-w-full items-center gap-2 rounded border border-border bg-muted px-2 py-0.5 font-mono text-[10px] italic text-muted-foreground sm:text-xs">
              <ExternalLink size={10} className="shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-sm">
                {property?.url}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 space-y-12 overflow-y-auto overflow-x-hidden bg-card p-6 sm:p-10">
          {/* Primary Metrics Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Market Price",
                value: property?.data?.price,
                highlight: true,
              },
              {
                label: "Rate / Sqft",
                value: property?.data?.pricePerSqft,
              },
              { label: "Total Area", value: property?.data?.area },
              {
                label: "Bldg Age",
                value: property?.data?.ageOfBuilding,
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Technical Specifications */}
            <div className="space-y-6">
              <h4 className="border-b border-border pb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Technical Matrix
              </h4>
              <div className="space-y-4">
                {[
                  {
                    label: "Locality",
                    value: property?.data?.location,
                    icon: <MapPin size={14} />,
                  },
                  {
                    label: "Internal Floor Area",
                    value: property?.data?.carpetArea,
                    icon: <Ruler size={14} />,
                  },
                  {
                    label: "Vertical Position",
                    value: property?.data?.floorNo,
                    icon: <Home size={14} />,
                  },
                  {
                    label: "Cardinal Facing",
                    value: property?.data?.facing,
                    icon: <ArrowRight size={14} />,
                  },
                  {
                    label: "Furnishing Status",
                    value: property?.data?.furnishingStatus,
                    icon: <Home size={14} />,
                  },
                  {
                    label: "Legal Status",
                    value: property?.data?.reraApproved
                      ? "RERA Approved"
                      : "Pending",
                    icon: <ShieldCheck size={14} />,
                  },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
                  >
                    <span className="flex items-center gap-3 text-muted-foreground">
                      {row.icon} {row.label}
                    </span>
                    <span className="font-semibold text-foreground">
                      {row.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Evidence Area */}
            <div className="space-y-6">
              <h4 className="border-b border-border pb-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                Evidence Verification
              </h4>
              <div className="group relative overflow-hidden rounded-xl border border-border bg-muted shadow-inner">
                {property && (
                  <img
                    src={property.screenshotUrl}
                    className="w-full h-auto transition-all duration-1000"
                  />
                )}
              </div>
              <Button
                variant="outline"
                className="h-12 w-full cursor-pointer gap-3 rounded-xl border-border font-bold text-muted-foreground hover:text-foreground"
                asChild
              >
                <a href={property?.url} target="_blank" rel="noreferrer">
                  <ExternalLink size={16} /> Open Original Source
                </a>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PropertyDetailsModal;
