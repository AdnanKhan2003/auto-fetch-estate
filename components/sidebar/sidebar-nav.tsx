import { Home, Search } from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { usePathname } from "next/navigation";

function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu aria-label="Main Navigation">
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip="Dashboard"
          isActive={pathname === "/"}
        >
          <a href="/" aria-label="Go to Dashboard" title="Dashboard">
            <Home />
            <span>Dashboard</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="History">
          <a href="#" aria-label="View Scrape History" title="Scrape History">
            <Search />
            <span>Scrape History</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

export default SidebarNav;
