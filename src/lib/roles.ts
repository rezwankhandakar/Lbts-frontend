import {
  Briefcase,
  CircleCheck,
  CircleMinus,
  CircleSlash,
  Clock,
  Crown,
  Gauge,
  ShieldCheck,
  Store,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Mirror of `LBTS-Backend/src/modules/user/user.constants.ts`. The backend is
 * the source of truth; this file exists so the UI can talk about roles without
 * hand-writing strings, and so the two never drift onto different casing.
 * Change one, change both.
 */
export const USER_ROLES = ['Admin', 'Manager', 'CEO', 'OpEx', 'Vendor'] as const
export type UserRole = (typeof USER_ROLES)[number]

export const USER_STATUSES = ['Pending', 'Active', 'Rejected', 'Suspended'] as const
export type UserStatus = (typeof USER_STATUSES)[number]

export const ADMIN_ROLE: UserRole = 'Admin'

interface ToneClasses {
  /** Soft tinted pill: background, hairline border and text in one hue. */
  badge: string
  /** Solid swatch, for the indicator dot that carries status without colour alone. */
  dot: string
  /** Icon chip on a card or sheet header. */
  chip: string
}

export interface RoleMeta extends ToneClasses {
  label: string
  /** Expands an abbreviation the business uses; never replaces the role value. */
  description: string
  icon: LucideIcon
}

export interface StatusMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
}

/**
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` would generate nothing and the colour
 * would silently vanish — the same rule as layout/nav-accents.ts.
 */
export const ROLE_META: Record<UserRole, RoleMeta> = {
  Admin: {
    label: 'Admin',
    description: 'Full system administration',
    icon: ShieldCheck,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Manager: {
    label: 'Manager',
    description: 'Day-to-day operational management',
    icon: Briefcase,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  },
  CEO: {
    label: 'CEO',
    description: 'Executive oversight',
    icon: Crown,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    dot: 'bg-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  },
  OpEx: {
    label: 'OpEx',
    description: 'Operation Executive',
    icon: Gauge,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Vendor: {
    label: 'Vendor',
    description: 'External supplier or partner',
    icon: Store,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
}

export const STATUS_META: Record<UserStatus, StatusMeta> = {
  Pending: {
    label: 'Pending',
    description: 'Awaiting an administrator decision',
    icon: Clock,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
  Active: {
    label: 'Active',
    description: 'Approved and able to sign in',
    icon: CircleCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Rejected: {
    label: 'Rejected',
    description: 'Access request declined',
    icon: CircleSlash,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  },
  Suspended: {
    label: 'Suspended',
    description: 'Access withdrawn until reactivated',
    icon: CircleMinus,
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
    dot: 'bg-tone-orange',
    chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
  },
}

/** Neutral presentation for a value the client does not recognise. */
const UNKNOWN: ToneClasses & { icon: LucideIcon } = {
  icon: CircleSlash,
  badge: 'border-border bg-muted text-muted-foreground',
  dot: 'bg-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
}

export function isUserRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value)
}

export function isUserStatus(value: string): value is UserStatus {
  return (USER_STATUSES as readonly string[]).includes(value)
}

/**
 * Tolerant lookups. A record written before the role set was fixed still has
 * to render as something — an unrecognised value degrades to a neutral badge
 * rather than throwing on `undefined.badge`.
 */
export function roleMeta(value: string): RoleMeta {
  return isUserRole(value)
    ? ROLE_META[value]
    : { ...UNKNOWN, label: value || 'Unknown', description: 'Unrecognised role' }
}

export function statusMeta(value: string): StatusMeta {
  return isUserStatus(value)
    ? STATUS_META[value]
    : { ...UNKNOWN, label: value || 'Unknown', description: 'Unrecognised status' }
}
