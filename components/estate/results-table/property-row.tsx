import { CheckSquare, Square } from "lucide-react";
import { TableRow, TableCell } from "../../ui/table";

interface PropertyRowProps {
  item: any;
  isSelected: boolean;
  onToggle: () => void;
  onClick: () => void;
}

export function PropertyRow({ item, isSelected, onToggle, onClick }: PropertyRowProps) {
  return (
    <TableRow
      onClick={onClick}
      className="cursor-pointer border-border transition-colors hover:bg-muted/40"
    >
      {/* Checkbox — stops row click so only toggle fires */}
      <TableCell
        className="py-4 pl-4 w-10"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        <button aria-label="Select row" className="flex items-center justify-center cursor-pointer">
          {isSelected ? (
            <CheckSquare size={18} className="text-primary transition-colors" />
          ) : (
            <Square size={18} className="text-muted-foreground/40 transition-colors" />
          )}
        </button>
      </TableCell>
      <TableCell className="py-4 pl-2">
        <div className="h-10 w-14 overflow-hidden rounded border border-border bg-muted">
          {item.screenshotUrl ? (
            <img
              src={item.screenshotUrl}
              className="object-cover w-full h-full transition-all duration-700"
              alt="screenshot"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground">
              N/A
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="py-4 max-w-[180px]">
        <p
          className="truncate text-sm font-bold text-foreground"
          title={item.data?.propertyTitle || ""}
        >
          {item.data?.propertyTitle || "Pending Analysis..."}
        </p>
      </TableCell>
      <TableCell className="py-4 text-center font-black text-foreground">
        {item.data?.pricePerSqft || "-"}
      </TableCell>
      <TableCell className="py-4 text-center font-medium text-muted-foreground">
        {item.data?.area || item.data?.carpetArea || "-"}
      </TableCell>
      <TableCell className="py-4 pr-6 text-right text-sm text-muted-foreground">
        {item.data?.location || "-"}
      </TableCell>
    </TableRow>
  );
}
