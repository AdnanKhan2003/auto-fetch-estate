"use client";

import { usePathname } from "next/navigation";
import { TooltipProvider } from "./ui/tooltip";
import { SidebarProvider } from "./ui/sidebar";
import AppSidebar from "./sidebar/app-sidebar";
import React from "react";
import ThemeToggle from "./theme/theme-toggle";

function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return (
      <div className="min-h-screen w-full relative">
        <div className="absolute top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        {children}
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 w-full relative">
            <div className="fixed top-4 right-4 z-100">
              <ThemeToggle />
            </div>
            {children}
          </main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}

export default LayoutWrapper;
