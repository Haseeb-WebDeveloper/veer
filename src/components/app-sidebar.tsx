"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Phone,
  Calendar,
  FileText,
  Settings2,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: false,
  },
  {
    title: "Calls",
    url: "/dashboard/calls",
    icon: Phone,
    isActive: false,
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: Calendar,
    isActive: false,
  },
  {
    title: "Forms",
    url: "/dashboard/forms",
    icon: FileText,
    isActive: false,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
    isActive: false,
  },
]

function SidebarLogo() {
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <Link href="/dashboard" className="flex items-center gap-2">
        {!isCollapsed && (
          <span className="font-semibold font-family-brimful tracking-widest">Veer</span>
        )}
      </Link>
    </div>
  )
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  
  // Update active state based on current path
  const navMain = navItems.map((item) => ({
    ...item,
    isActive: pathname === item.url || pathname?.startsWith(item.url + "/"),
  }))

  return (
    <Sidebar collapsible="icon" {...props}>
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
  )
}
