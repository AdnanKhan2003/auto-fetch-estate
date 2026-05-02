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
    <Dialog open={!!property} onOpenChange={() => onClose}>
      <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 border-zinc-200 bg-white shadow-2xl rounded-2xl">
        <DialogHeader className="p-6 sm:p-8 border-b border-zinc-50 bg-white space-y-0 flex-row items-center justify-between overflow-x-hidden">
          <div className="space-y-1 text-zinc-900 min-w-0 flex-1">
            <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight truncate">
              {property?.data?.propertyTitle || "Property Overview"}
            </DialogTitle>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400 font-mono italic bg-zinc-50 w-fit px-2 py-0.5 rounded border border-zinc-100 max-w-full">
              <ExternalLink size={10} className="shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-sm">
                {property?.url}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 space-y-12 bg-white">
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
                className={`p-6 rounded-xl border border-zinc-100 ${stat.highlight ? "bg-zinc-900 text-zinc-50 shadow-lg" : "bg-white text-zinc-900"} min-w-0 overflow-hidden`}
              >
                <p
                  className={`text-[10px] uppercase tracking-widest font-black mb-2 ${stat.highlight ? "text-zinc-500" : "text-zinc-400"}`}
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
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 border-b border-zinc-50 pb-3">
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
                    className="flex items-center justify-between py-2 text-sm border-b border-zinc-50 last:border-0"
                  >
                    <span className="text-zinc-400 flex items-center gap-3">
                      {row.icon} {row.label}
                    </span>
                    <span className="font-semibold text-zinc-900">
                      {row.value || "-"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Evidence Area */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 border-b border-zinc-50 pb-3">
                Evidence Verification
              </h4>
              <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 shadow-inner group relative">
                {property && (
                  <img
                    src={property.screenshotUrl}
                    className="w-full h-auto transition-all duration-1000"
                  />
                )}
              </div>
              <Button
                variant="outline"
                className="w-full h-12 text-zinc-600 hover:text-zinc-900 border-zinc-200 font-bold rounded-xl gap-3 cursor-pointer"
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
