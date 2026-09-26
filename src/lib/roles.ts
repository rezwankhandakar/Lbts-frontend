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
import type { TranslationKey, Translator } from '@/lib/i18n'

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

/**
 * A role or status as the UI renders it.
 *
 * `label` and `description` are **already translated** — every lookup below
 * takes a `Translator` and resolves them, so a caller cannot accidentally
 * render an English label on a Bangla page by forgetting a step. The classes
 * and the icon are not translatable and never change.
 */
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

/** The untranslatable half: what a value looks like, and nothing it says. */
interface RolePresentation extends ToneClasses {
  icon: LucideIcon
}

/**
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` would generate nothing and the colour
 * would silently vanish — the same rule as layout/nav-accents.ts.
 */
export const ROLE_META: Record<UserRole, RolePresentation> = {
  Admin: {
    icon: ShieldCheck,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Manager: {
    icon: Briefcase,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  },
  CEO: {
    icon: Crown,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    dot: 'bg-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  },
  OpEx: {
    icon: Gauge,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Vendor: {
    icon: Store,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
}

export const STATUS_META: Record<UserStatus, RolePresentation> = {
  Pending: {
    icon: Clock,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
  Active: {
    icon: CircleCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Rejected: {
    icon: CircleSlash,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  },
  Suspended: {
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
 *
 * **The translator is a required argument rather than a store read**, and that
 * is deliberate. Reading the locale in here would make the words correct and
 * the *rendering* stale: nothing would have subscribed, so a badge would keep
 * its old language until something else happened to re-render it. Demanding a
 * `Translator` makes the caller hold `useT()`, which is the subscription — so
 * the type system enforces the one thing that cannot be checked at runtime.
 *
 * An unrecognised value keeps showing **its own raw string**, untranslated, for
 * the reason a model code is never transliterated: it is data from the API, and
 * the honest thing to show is what was actually stored.
 */
export function roleMeta(value: string, t: Translator): RoleMeta {
  if (isUserRole(value)) {
    return {
      ...ROLE_META[value],
      label: t(`roles.${value}.label` as TranslationKey),
      description: t(`roles.${value}.description` as TranslationKey),
    }
  }

  return {
    ...UNKNOWN,
    label: value || t('roles.unknown.label'),
    description: t('roles.unknown.description'),
  }
}

export function statusMeta(value: string, t: Translator): StatusMeta {
  if (isUserStatus(value)) {
    return {
      ...STATUS_META[value],
      label: t(`accountStatuses.${value}.label` as TranslationKey),
      description: t(`accountStatuses.${value}.description` as TranslationKey),
    }
  }

  return {
    ...UNKNOWN,
    label: value || t('accountStatuses.unknown.label'),
    description: t('accountStatuses.unknown.description'),
  }
}

/** Just the word, for a select trigger or a filter chip. */
export function roleLabel(value: string, t: Translator): string {
  return roleMeta(value, t).label
}

export function statusLabel(value: string, t: Translator): string {
  return statusMeta(value, t).label
}
