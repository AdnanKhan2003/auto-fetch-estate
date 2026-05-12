import { SidebarTrigger } from "../ui/sidebar";

interface EstateHeaderProps {
  onClear: () => void;
}

function EstateHeader({ onClear }: EstateHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-[64px] items-center justify-between gap-4 px-8">
        {" "}
        {/* Use px-8 here */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="cursor-pointer" />
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            V S Jadon Compare
          </h1>
        </div>
        <div className="flex items-center gap-3 pr-12">
          <button
            onClick={onClear}
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
          >
            Clear History
          </button>
        </div>
      </div>
    </header>
  );
}

export default EstateHeader;
