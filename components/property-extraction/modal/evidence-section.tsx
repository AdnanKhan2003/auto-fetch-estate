import { ZoomIn, ExternalLink } from "lucide-react";
import { Button } from "../../ui/button";
import Image from "next/image";
import SectionHeader from "./section-header";

interface EvidenceSectionProps {
  property: any;
  onOpenLightbox: () => void;
}

export function EvidenceSection({
  property,
  onOpenLightbox,
}: EvidenceSectionProps) {
  return (
    <div className="space-y-6">
      <SectionHeader title="Evidence Verification" />

      <div
        className="group relative overflow-hidden rounded-xl border border-border bg-muted shadow-inner cursor-zoom-in"
        onClick={() => property?.screenshotUrl && onOpenLightbox()}
      >
        {property && property.screenshotUrl && (
          <Image
            src={property.screenshotUrl}
            width={1280}
            height={800}
            className="w-full h-auto transition-all duration-1000 group-hover:scale-[1.02]"
            alt={`Screenshot of ${property.data?.propertyTitle || "property"}`}
            title={`Screenshot of ${property.data?.propertyTitle || "property"}`}
          />
        )}
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
        <a
          href={property?.url}
          target="_blank"
          rel="noreferrer"
          title={
            property?.data?.propertyTitle
              ? `Visit listing: ${property.data.propertyTitle}`
              : "Open original property listing source"
          }
        >
          <ExternalLink size={16} /> Open Original Source
        </a>
      </Button>
    </div>
  );
}
