import ThemeToggle from "../theme/theme-toggle";

interface EstateHeaderProps {
  onClear: () => void;
}

function EstateHeader({ onClear }: EstateHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 px-6 md:px-12 py-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          V S Jadon Compare
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
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
