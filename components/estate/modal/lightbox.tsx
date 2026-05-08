import { useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";


interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  title?: string | null;
}

export function Lightbox({ isOpen, onClose, imageUrl, title }: LightboxProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/92 backdrop-blur-sm animate-in fade-in duration-200 pointer-events-auto"
      onClick={() => setTimeout(() => onClose(), 0)}
    >
      <button
        className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
        onClick={(e) => {
          e.stopPropagation();
          setTimeout(() => onClose(), 0);
        }}
        aria-label="Close fullscreen"
      >
        <X size={20} />
      </button>

      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/40 select-none pointer-events-none">
        Press ESC or click anywhere to close
      </span>

      {imageUrl && (
        <Image
          src={imageUrl}
          width={1280}
          height={800}
          className="max-h-[92vh] max-w-[92vw] w-auto h-auto rounded-lg object-contain shadow-2xl"
          alt={`Fullscreen screenshot of ${title || 'property'}`}
          title={`Fullscreen screenshot of ${title || 'property'}`}
          onClick={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
}
