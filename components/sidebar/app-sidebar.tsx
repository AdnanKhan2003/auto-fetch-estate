import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import SidebarNav from "./sidebar-nav";
import SidebarProfile from "./sidebar-profile";
import SidebarHeaderBrand from "./sidebar-header-brand";

function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="h-[64px] border-b border-border/50 flex flex-row items-center justify-between px-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
        <div className="group-data-[collapsible=icon]:hidden">
          <SidebarHeaderBrand />
        </div>
        <SidebarTrigger className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNav />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarProfile />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
