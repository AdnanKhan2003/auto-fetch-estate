import { Trash2 } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import ThemeToggle from "../theme/theme-toggle";
import { Button } from "../ui/button";

interface EstateHeaderProps {
  onClear: () => void;
}

function EstateHeader({ onClear }: EstateHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md mb-0">
      <div className="flex h-[64px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-sm sm:text-xl font-bold tracking-tight text-foreground truncate max-w-[150px] sm:max-w-none">
            V S Jadon Compare
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Clear History</span>
            <Trash2 className="h-4 w-4 sm:h-3 sm:w-3" />
          </Button>
          <div className="border-l border-border h-6 mx-1 hidden sm:block" />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export default EstateHeader;
