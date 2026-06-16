import { Trash2 } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import ThemeToggle from "../theme/theme-toggle";
import { Button } from "../ui/button";

interface EstateHeaderProps {
  onClear: () => void;
}

function EstateHeader({ onClear }: EstateHeaderProps) {
  return (
    <header className="top-0 z-50 sticky bg-background/80 backdrop-blur-md mb-0 border-border border-b w-full">
      <div className="flex justify-between items-center gap-4 px-4 sm:px-6 h-[64px]">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="md:hidden cursor-pointer" />
          <h1 className="max-w-[150px] sm:max-w-none font-bold text-foreground text-sm sm:text-xl truncate tracking-tight">
            V S Jadon Compare
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={onClear}
            className="flex items-center gap-2 hover:bg-destructive font-medium text-background hover:text-destructive-foreground text-xs transition-all cursor-pointer"
          >
            <span className="hidden sm:inline">Clear History</span>
            <Trash2 className="w-4 sm:w-3 h-4 sm:h-3" />
          </Button>
          <div className="hidden sm:block mx-1 border-border border-l h-6" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default EstateHeader;
