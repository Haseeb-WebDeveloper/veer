"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { NAV_ITEMS } from "@/constants/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

function SidebarLogo() {
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  if (isCollapsed) {
    // When collapsed, show trigger styled like a menu item to match other icons
    const trigger = (
      <SidebarTrigger className="w-full justify-center size-8! p-2! rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-[width,height,padding] focus-visible:ring-2 ring-sidebar-ring" />
    );

    return (
      <SidebarMenu>
        <SidebarMenuItem>
          {isMobile ? (
            trigger
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>{trigger}</TooltipTrigger>
              <TooltipContent side="right" align="center">
                Toggle Sidebar
              </TooltipContent>
            </Tooltip>
          )}
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5">
      <Link href="/dashboard" className="flex items-center gap-2">
        <span className="font-semibold font-family-brimful tracking-widest">
          Veer
        </span>
      </Link>
      <SidebarTrigger />
    </div>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Update active state based on current path
  const navMain = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname?.startsWith(item.url + "/"),
  }));

  return (
    <Sidebar collapsible="icon" className="bg-linear-to-b from-sidebar via-sidebar to-primary/10" {...props}>
      <SidebarHeader>
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
