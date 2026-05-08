import { Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

interface UrlInputRowProps {
  url: string;
  canDelete: boolean;
  onChange: (value: string) => void;
  onDelete: () => void;
}

export function UrlInputRow({ url, canDelete, onChange, onDelete }: UrlInputRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        type="url"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        spellCheck="false"
        aria-label="Property listing URL"
        className="h-11 flex-1 border-border bg-background text-foreground focus-visible:ring-ring"
        placeholder="Paste listing URL here..."
      />
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label="Remove URL input"
          className="cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
        >
          <Trash2 size={18} />
        </Button>
      )}
    </div>
  );
}
