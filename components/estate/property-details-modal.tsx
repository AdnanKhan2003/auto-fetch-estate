"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Lightbox } from "./modal/lightbox";
import { MetricsGrid } from "./modal/metrics-grid";
import { TechnicalMatrix } from "./modal/technical-matrix";
import { EvidenceSection } from "./modal/evidence-section";

interface PropertyDetailsModalProps {
  property: any | null;
  onClose: () => void;
}

function PropertyDetailsModal({
  property,
  onClose,
}: PropertyDetailsModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset lightbox whenever the modal closes or switches property
  useEffect(() => {
    setLightboxOpen(false);
  }, [property]);

  return (
    <>
      <Dialog open={!!property} onOpenChange={onClose}>
        <DialogContent 
          className="flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-2xl border-border bg-card p-0 shadow-2xl sm:max-w-5xl"
          onInteractOutside={(e) => {
            // Prevent Radix from closing the modal if the lightbox is open
            // or if the user is interacting with the lightbox.
            if (lightboxOpen) {
              e.preventDefault();
            }
          }}
        >
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
            <MetricsGrid data={property?.data} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <TechnicalMatrix data={property?.data} />
              <EvidenceSection 
                property={property} 
                onOpenLightbox={() => setLightboxOpen(true)} 
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Lightbox 
        isOpen={lightboxOpen} 
        onClose={() => setLightboxOpen(false)} 
        imageUrl={property?.screenshotUrl} 
      />
    </>
  );
}

export default PropertyDetailsModal;
