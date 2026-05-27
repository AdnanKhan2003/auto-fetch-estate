"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Trash2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
          className="flex max-h-[90vh] w-[95vw] flex-col overflow-hidden rounded-2xl border-border bg-card p-0 pr-0! shadow-2xl sm:max-w-5xl"
          onInteractOutside={(e) => {
            // Prevent Radix from closing the modal if the lightbox is open
            // or if the user is interacting with the lightbox.
            if (lightboxOpen) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader className="flex-row items-start justify-between space-y-0 overflow-x-hidden border-b border-border bg-card p-6 sm:p-8">
            <div className="min-w-0 flex-1 flex flex-col gap-1 text-card-foreground">
              <DialogTitle asChild>
                <Link
                  href={property?.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 min-w-0 text-xl sm:text-2xl font-bold tracking-tight w-fit max-w-full"
                  title={property?.data?.propertyTitle || "Property Overview"}
                >
                  <span className="truncate text-blue-600 dark:text-blue-400 group-hover:underline">
                    {property?.data?.propertyTitle || "Property Overview"}
                  </span>
                  <TooltipWrapper content="Open URL">
                    <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                  </TooltipWrapper>
                </Link>
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground/80 font-medium">
                <span>{domain}</span>
                {property?.createdAt &&
                  property?.updatedAt &&
                  new Date(property.updatedAt).getTime() -
                    new Date(property.createdAt).getTime() >
                    1000 && (
                    <span className="shrink-0 inline-flex items-center rounded-sm bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-500 ring-1 ring-inset ring-amber-500/20 tracking-wider">
                      EDITED
                    </span>
                  )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              {property?.id && onDelete && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onDelete(property.id)}
                  className="cursor-pointer"
                  title="Delete property"
                >
                  <TooltipWrapper content="Delete Property">
                    <Trash2 className="h-4 w-4" />
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
                    <X className="h-4 w-4" />
                  </TooltipWrapper>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <div className="flex-1 space-y-12 overflow-y-auto overflow-x-hidden bg-card p-6 sm:p-10 custom-scrollbar">
            <MetricsGrid
              data={property?.data}
              propertyId={property?.id}
              onUpdate={onUpdate}
            />

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
