"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Lightbox } from "./modal/lightbox";
import { MetricsGrid } from "./modal/metrics-grid";
import { TechnicalMatrix } from "./modal/technical-matrix";
import { EvidenceSection } from "./modal/evidence-section";
import { Button } from "../ui/button";

interface PropertyDetailsModalProps {
  property: any | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

function PropertyDetailsModal({
  property,
  onClose,
  onDelete,
}: PropertyDetailsModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Reset lightbox whenever the modal closes or switches property
  useEffect(() => {
    setLightboxOpen(false);
  }, [property]);

  let domain = "Unknown Website";
  if (property?.url) {
    try {
      domain = new URL(property.url).hostname.replace("www.", "");
    } catch (e) {
      console.log(e);
    }
  }

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
          <DialogHeader className="flex-row items-center justify-between space-y-0 overflow-x-hidden border-b border-border bg-card p-6 sm:p-8 pr-12 sm:pr-16">
            <div className="min-w-0 flex-1 flex flex-col gap-1 text-card-foreground">
              <DialogTitle asChild>
                <a
                  href={property?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 w-fit max-w-full text-xl sm:text-2xl font-bold tracking-tight"
                  title={property?.data?.propertyTitle || "Property Overview"}
                >
                  <span className="truncate text-blue-600 dark:text-blue-400 group-hover:underline">
                    {property?.data?.propertyTitle || "Property Overview"}
                  </span>
                  <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </a>
              </DialogTitle>
              <span className="text-sm text-muted-foreground/80 font-medium">
                {domain}
              </span>
            </div>

            {property?.id && onDelete && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => onDelete(property.id)}
                className="ml-4 cursor-pointer shrink-0"
                title="Delete property"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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
        imageUrl={
          property?.screenshotUrl
            ? `/api/images/${property.screenshotUrl}`
            : "/fallback-image.png"
        }
        title={property?.data?.propertyTitle}
      />
    </>
  );
}

export default PropertyDetailsModal;
