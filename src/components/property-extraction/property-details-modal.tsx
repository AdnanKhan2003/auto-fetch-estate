"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "../ui/dialog";
import { Lightbox } from "./modal/lightbox";
import { MetricsGrid } from "./modal/metrics-grid";
import { TechnicalMatrix } from "./modal/technical-matrix";
import { EvidenceSection } from "./modal/evidence-section";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";
import TooltipWrapper from "../tooltip/tooltip";

interface PropertyDetailsModalProps {
  property: any | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
}

function PropertyDetailsModal({
  property,
  onClose,
  onDelete,
  onUpdate,
}: PropertyDetailsModalProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  console.log(`[Modal Open] ${property?.data?.propertyTitle}:`, {
    createdAt: property?.createdAt,
    updatedAt: property?.updatedAt,
    isEdited:
      property?.createdAt &&
      property?.updatedAt &&
      new Date(property.updatedAt).getTime() -
        new Date(property.createdAt).getTime() >
        1000,
  });

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
          showCloseButton={false}
          className="flex flex-col bg-card shadow-2xl p-0 pr-0! border-border rounded-2xl w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-hidden"
          onInteractOutside={(e) => {
            // Prevent Radix from closing the modal if the lightbox is open
            // or if the user is interacting with the lightbox.
            if (lightboxOpen) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="flex-row justify-between items-start space-y-0 bg-card p-6 sm:p-8 border-border border-b overflow-x-hidden shrink-0">
            <div className="flex flex-col flex-1 gap-1 min-w-0 text-card-foreground">
              <DialogTitle asChild>
                <Link
                  href={property?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 w-full min-w-0 font-bold text-xl sm:text-2xl tracking-tight"
                  title={property?.data?.propertyTitle || "Property Overview"}
                >
                  <span className="text-blue-600 dark:text-blue-400 group-hover:underline truncate">
                    {property?.data?.propertyTitle || "Property Overview"}
                  </span>
                  <TooltipWrapper content="Open URL">
                    <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-colors shrink-0" />
                  </TooltipWrapper>
                </Link>
              </DialogTitle>

              <DialogDescription className="sr-only">
                Detailed analysis and metrics of the scraped property listing.
              </DialogDescription>

              <div className="flex items-center gap-2 font-medium text-muted-foreground/80 text-sm">
                <span>{domain}</span>
                {property?.createdAt &&
                  property?.updatedAt &&
                  new Date(property.updatedAt).getTime() -
                    new Date(property.createdAt).getTime() >
                    1000 && (
                    <span className="inline-flex items-center bg-amber-500/10 px-1.5 py-0.5 rounded-sm ring-1 ring-amber-500/20 ring-inset font-bold text-[9px] text-amber-500 tracking-wider shrink-0">
                      EDITED
                    </span>
                  )}
              </div>
            </div>

            <div className="flex items-center gap-2 ml-4 shrink-0">
              {property?.id && onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(property.id)}
                  className="cursor-pointer"
                  title="Delete property"
                >
                  <TooltipWrapper content="Delete Property">
                    <Trash2 className="w-4 h-4" />
                  </TooltipWrapper>
                </Button>
              )}
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="cursor-pointer"
                  title="Close modal"
                >
                  <TooltipWrapper content="Close Modal">
                    <X className="w-4 h-4" />
                  </TooltipWrapper>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-12 bg-card p-6 sm:p-10 overflow-x-hidden overflow-y-auto custom-scrollbar">
            <MetricsGrid
              data={property?.data}
              propertyId={property?.id}
              onUpdate={onUpdate}
            />

            <div className="items-start gap-12 grid grid-cols-1 lg:grid-cols-2">
              <TechnicalMatrix data={property?.data} />
              <div className="top-0 sm:top-4 sticky self-start">
                <EvidenceSection
                  property={property}
                  onOpenLightbox={() => setLightboxOpen(true)}
                />
              </div>
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
