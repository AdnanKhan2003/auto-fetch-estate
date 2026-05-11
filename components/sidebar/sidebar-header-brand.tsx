import { Home } from "lucide-react";

function SidebarHeaderBrand() {
  return (
    <div className="flex items-center gap-3 px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/60 text-primary-foreground shadow-md">
        <Home className="h-5 w-5" />
      </div>
      <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
        <span className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
          ESTATE<span className="text-primary">SCRAPER</span>
        </span>
      </div>
    </div>
  );
}

export default SidebarHeaderBrand;
