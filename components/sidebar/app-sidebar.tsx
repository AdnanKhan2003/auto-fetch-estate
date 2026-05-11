import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from "@/components/ui/sidebar";
import SidebarNav from "./sidebar-nav";
import SidebarProfile from "./sidebar-profile";
import SidebarHeaderBrand from "./sidebar-header-brand";

function AppSidebar() {
  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="h-[65px] border-b border-border/50 justify-center p-0">
        <SidebarHeaderBrand />
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
