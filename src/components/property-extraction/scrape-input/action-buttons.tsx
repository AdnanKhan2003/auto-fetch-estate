import { Loader2, Plus } from "lucide-react";
import { Button } from "../../ui/button";

interface ActionButtonsProps {
  isLoading: boolean;
  isExecuteDisabled: boolean;
  onAddTarget: () => void;
  onExecute: () => void;
}

export function ActionButtons({
  isLoading,
  isExecuteDisabled,
  onAddTarget,
  onExecute,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-between border-t border-border pt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddTarget}
        className="cursor-pointer gap-2 border-border font-medium text-foreground hover:bg-muted"
      >
        <Plus size={14} /> Add Target
      </Button>
      <Button
        onClick={onExecute}
        disabled={isExecuteDisabled}
        className="h-11 cursor-pointer border-none bg-primary px-10 font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
            Extracting...
          </>
        ) : (
          "Execute Scrape"
        )}
      </Button>
    </div>
  );
}
