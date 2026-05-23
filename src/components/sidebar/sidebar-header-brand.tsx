import Image from "next/image";

function SidebarHeaderBrand() {
  return (
    <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-foreground shadow-sm overflow-hidden border border-zinc-200/50 dark:border-zinc-800/30">
        <Image
          src="/favicon.ico"
          alt="EstateScraper Logo"
          width={20}
          height={20}
          className="h-5 w-5 object-contain"
        />
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
