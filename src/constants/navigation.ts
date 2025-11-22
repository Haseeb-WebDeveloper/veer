import {
  LayoutDashboard,
  Phone,
  Calendar,
  FileText,
  Settings2,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { NavigationItem } from "@/types/navigation";

/**
 * Main navigation items for the dashboard sidebar
 */
export const NAV_ITEMS: Omit<NavigationItem, "isActive">[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Calls",
    url: "/dashboard/calls",
    icon: Phone,
  },
  {
    title: "Appointments",
    url: "/dashboard/appointments",
    icon: Calendar,
  },
  {
    title: "Forms",
    url: "/dashboard/forms",
    icon: FileText,
  },
  {
    title: "Integrations",
    url: "/dashboard/integrations",
    icon: Zap,
  },
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
];
