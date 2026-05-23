import { Check, Copy } from "lucide-react";
import { Button } from "../ui/button";

interface CopyableDataRowProps {
  label: string;
  value: string;
  fieldName: string;
  copiedField: string | null;
  onCopy: (text: string, fieldName: string) => void;
  isLast?: boolean;
}

function CopyableDataRow({
  label,
  value,
  fieldName,
  copiedField,
  onCopy,
  isLast = false,
}: CopyableDataRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 ${!isLast ? "border-b border-border/50" : ""}`}
    >
      <div className="space-y-0.5">
        <p className="text-[9px] font-bold uppercase text-muted-foreground/70">
          {label}
        </p>
        <p className="text-[13px] font-medium">{value}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md"
        onClick={() => onCopy(value, fieldName)}
      >
        {copiedField === fieldName ? (
          <Check size={14} className="text-green-600" />
        ) : (
          <Copy size={14} />
        )}
      </Button>
    </div>
  );
}

export default CopyableDataRow;
