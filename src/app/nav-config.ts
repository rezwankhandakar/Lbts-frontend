import {
  Boxes,
  LayoutDashboard,
  MapPinned,
  ReceiptText,
  ScanLine,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  Wallet,
} from 'lucide-react'
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
      /**
       * Gate Pass is hidden from Vendor accounts: it is the transport
       * service's own operating record, not something an external supplier
       * files or reads. This is presentation — `RoleRoute` guards the URL and
       * the API refuses the request either way.
       */
      {
        label: 'Gate Pass',
        path: '/gate-pass',
        icon: ScanLine,
        accent: 'cyan',
        roles: ['Admin', 'Manager', 'CEO', 'OpEx'],
      },
      /**
       * Challan is hidden from Vendor accounts for a sharper reason than Gate
       * Pass: a challan carries a customer's home address and phone number,
       * and an external supplier has no business reading one. This is
       * presentation — `RoleRoute` guards the URL and the API refuses the
       * request either way.
       */
      {
        label: 'Challan',
        path: '/challan',
        icon: ReceiptText,
        accent: 'violet',
        roles: ['Admin', 'Manager', 'CEO', 'OpEx'],
      },
      { label: 'Module A', path: '/module-a', icon: Boxes, accent: 'amber' },
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
      /**
       * The district and thana master list. Reference data rather than a
       * records module, which is why it sits under System beside
       * Administration and not beside Challan.
       *
       * Visible to everyone Challan is: the classification a delivery carries
       * is something an operator looks up, and only the Add, Edit and Remove
       * controls are Admin-only. Vendor is out for the same reason it is out
       * of Challan.
       */
      {
        label: 'Locations',
        path: '/locations',
        icon: MapPinned,
        accent: 'cyan',
        roles: ['Admin', 'Manager', 'CEO', 'OpEx'],
      },
      /**
       * The product rate card. Reference data, so it sits beside Locations
       * under System rather than beside Challan, and it carries the same
       * visibility: everyone Challan is open to can read it, because the entry
       * form offers product names off it, and only the Add, Edit and Remove
       * controls are Admin-only. Vendor is out for the same reason it is out
       * of Challan.
       */
      {
        label: 'Product Rates',
        path: '/product-rates',
        icon: Tags,
        accent: 'emerald',
        roles: ['Admin', 'Manager', 'CEO', 'OpEx'],
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
