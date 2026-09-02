import { Boxes, LayoutDashboard, Settings, ShieldCheck, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { UserRole } from '@/lib/roles'

/** Keys into the coordinated accent palette defined in `src/index.css`. */
export type NavAccent = 'indigo' | 'cyan' | 'violet' | 'emerald' | 'amber'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  /** Gives each destination a stable colour identity for fast scanning. */
  accent: NavAccent
  disabled?: boolean
  /**
   * Restricts who sees the item. Presentation only — the route guard and the
   * API are what actually enforce access. Omit for a destination everyone gets.
   */
  roles?: readonly UserRole[]
}

export interface NavSection {
  /** Rendered as a small uppercase label above the group. */
  label: string
  items: NavItem[]
}

/**
 * The single source of truth for sidebar navigation and header titles.
 * Adding a module means adding one entry here and one route in app/router.tsx.
 */
export const navSections: NavSection[] = [
  {
    label: 'Main',
    items: [
      { label: 'Dashboard', path: '/', icon: LayoutDashboard, accent: 'indigo' },
      { label: 'Module A', path: '/module-a', icon: Boxes, accent: 'cyan' },
      { label: 'Module B', path: '/module-b', icon: Users, accent: 'violet' },
      { label: 'Module C', path: '/module-c', icon: Wallet, accent: 'emerald' },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Administration',
        path: '/administration',
        icon: ShieldCheck,
        accent: 'violet',
        roles: ['Admin'],
      },
      { label: 'Settings', path: '/settings', icon: Settings, accent: 'amber' },
    ],
  },
]

/** Flat view, for title lookup and anything that does not care about grouping. */
export const navItems: NavItem[] = navSections.flatMap((section) => section.items)

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  return item.path === '/' ? pathname === '/' : pathname.startsWith(item.path)
}

/** True when the item carries no role restriction, or the role satisfies it. */
export function canSeeNavItem(item: NavItem, role: UserRole | null): boolean {
  if (!item.roles) {
    return true
  }
  return role !== null && item.roles.includes(role)
}

/**
 * The sections a given role should see, with empty groups dropped so a
 * restricted account never gets a heading above nothing.
 */
export function visibleNavSections(role: UserRole | null): NavSection[] {
  return navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => canSeeNavItem(item, role)),
    }))
    .filter((section) => section.items.length > 0)
}
