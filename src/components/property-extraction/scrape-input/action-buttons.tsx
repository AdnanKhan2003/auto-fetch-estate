import { Loader2, Plus, X } from "lucide-react";
import { Button } from "../../ui/button";

interface ActionButtonsProps {
  isLoading: boolean;
  isExecuteDisabled: boolean;
  onAddTarget: () => void;
  onExecute: () => void;
  onStopScrape?: () => void;
}

export function ActionButtons({
  isLoading,
  isExecuteDisabled,
  onAddTarget,
  onExecute,
  onStopScrape,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-between items-center pt-4 border-border border-t">
      <Button
        variant="outline"
        size="sm"
        onClick={onAddTarget}
        className="gap-2 hover:bg-muted border-border font-medium text-foreground cursor-pointer"
      >
        <Plus size={14} /> Add Target
      </Button>

      <div className="flex gap-2">
        {isLoading && onStopScrape && (
          <Button
            type="button"
            variant="destructive"
            onClick={onStopScrape}
            className="px-4 h-11 cursor-pointer"
          >
            <X className="mr-2 w-4 h-4" /> Stop
          </Button>
        )}
        <Button
          onClick={onExecute}
          type="button"
          disabled={isExecuteDisabled}
          className="bg-primary hover:bg-primary/90 disabled:bg-muted shadow-sm px-10 border-none h-11 font-bold text-primary-foreground disabled:text-muted-foreground cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              Extracting...
            </>
          ) : (
            "Execute Scrape"
          )}
        </Button>
      </div>
    </div>
  );
}
