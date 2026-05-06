"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ExternalLink,
  Home,
  MapPin,
  Ruler,
  ShieldCheck,
  X,
  ZoomIn,
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
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Close lightbox on Escape.
  // ⚠️  Must use capture phase + stopImmediatePropagation so Radix Dialog's
  // own ESC listener never fires — otherwise both lightbox AND modal close.
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        setLightboxOpen(false);
      }
    };
    // true = capture phase → fires before Radix's bubble-phase listener
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightboxOpen]);

  // Reset lightbox whenever the modal closes or switches property
  useEffect(() => {
    setLightboxOpen(false);
  }, [property]);

  return (
    <>
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

                {/* Clickable screenshot — opens lightbox */}
                <div
                  className="group relative overflow-hidden rounded-xl border border-border bg-muted shadow-inner cursor-zoom-in"
                  onClick={() => property?.screenshotUrl && setLightboxOpen(true)}
                >
                  {property && (
                    <img
                      src={property.screenshotUrl}
                      className="w-full h-auto transition-all duration-1000 group-hover:scale-[1.02]"
                      alt="Page screenshot"
                    />
                  )}
                  {/* Zoom hint overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
                    <div className="flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm">
                      <ZoomIn size={14} />
                      View fullscreen
                    </div>
                  </div>
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

      {/* ── Fullscreen Lightbox ──────────────────────────────── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
          // Radix Dialog uses pointerdown to detect outside-clicks.
          // Stopping it here prevents the modal from closing when the
          // lightbox backdrop or X button is clicked.
          onPointerDown={(e) => e.stopPropagation()}
        >
          {/* X close button */}
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            aria-label="Close fullscreen"
          >
            <X size={20} />
          </button>

          {/* ESC hint */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 select-none">
            Press ESC or click anywhere to close
          </span>

          {/* The image — stop propagation so clicking image doesn't close */}
          <img
            src={property?.screenshotUrl}
            className="max-h-[92vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
            alt="Fullscreen screenshot"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

export default PropertyDetailsModal;
