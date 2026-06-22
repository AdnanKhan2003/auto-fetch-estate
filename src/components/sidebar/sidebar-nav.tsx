"use client";

import {
  Home,
  LayoutDashboard,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
  Calculator,
  FolderArchive,
} from "lucide-react";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { usePathname } from "next/navigation";
import { authClient } from "@/auth/auth-client";
import Link from "next/link";

function SidebarNav() {
  const { data: session } = authClient.useSession();
  const isAdmin = session?.user?.role === "admin";
  const pathname = usePathname();

  const navItems = [
    { title: "Dashboard", href: "/", icon: LayoutDashboard },
    { title: "Saved Researches", href: "/researches", icon: FolderArchive }, // <-- Add this line!

    { title: "Tools", href: "/tools", icon: Calculator },
    ...(isAdmin
      ? [
          {
            title: "Create Makers",
            href: "/admin/create-makers",
            icon: UserPlus,
          },
          { title: "View Users", href: "/admin/view-users", icon: ShieldCheck },
        ]
      : []),
  ];

  return (
    <SidebarMenu aria-label="Main Navigation">
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            tooltip={item.title}
            isActive={pathname === item.href}
          >
            <Link href={item.href} aria-label={item.title} title={item.title}>
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default SidebarNav;
