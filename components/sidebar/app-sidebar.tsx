"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Home, LogOut, Search, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

function AppSidebar() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push("/login"),
      },
    });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="h-[65px] border-b border-border/50 justify-center p-0">
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
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
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
                  <a
                    href="#"
                    aria-label="View Scrape History"
                    title="Scrape History"
                  >
                    <Search />
                    <span>Scrape History</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu aria-label="User Settings">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full justify-start gap-3 p-2"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={session?.user?.image || ""}></AvatarImage>
                    <AvatarFallback className="bg-primary/10 text-primary uppercase">
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start group-data-[collapsible=icon]:hidden overflow-hidden">
                    <span className="text-sm font-medium">
                      {session?.user?.name || "Guest"}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {session?.user?.email}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="end" className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  LogOut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebar;
