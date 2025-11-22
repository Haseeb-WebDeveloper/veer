import type { LucideIcon } from 'lucide-react'

/**
 * Navigation item structure for sidebar
 */
export type NavigationItem = {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

