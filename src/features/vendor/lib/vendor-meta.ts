import {
  BadgeCheck,
  CalendarClock,
  CircleCheck,
  CircleHelp,
  CircleMinus,
  CircleSlash,
  Clock,
  FileWarning,
  KeyRound,
  Palmtree,
  Truck,
  Wrench,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatCalendarDay } from '@/lib/format'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type {
  AssignmentStatus,
  DocumentStatus,
  DriverStatus,
  VehicleOwnershipType,
  VehicleStatus,
  VendorStatus,
} from '../types'

/**
 * Display metadata for the Vendor vocabulary, in the same shape `lib/roles.ts`
 * uses for roles and `location-meta.ts` uses for location types — and for the
 * same reason: colour for a classification belongs in one table, never inline
 * in a component.
 *
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` would generate nothing and the colour would
 * silently vanish.
 *
 * The palette is deliberately restrained. Green means working, amber means
 * somebody has to do something, orange means paused, rose means stopped, and
 * neutral means nothing is claimed. Nothing here is coloured for decoration.
 */

interface ToneClasses {
  badge: string
  dot: string
  chip: string
}

/**
 * The untranslatable half of a status: an icon and three class strings.
 *
 * The **words** are not here. `vendor.vendorStatuses.*` and its five siblings
 * carry them, and each lookup below reads them through a translator, so a
 * language switch renames every badge, title and filter at once.
 */
export interface StatusPresentation extends ToneClasses {
  icon: LucideIcon
}

/**
 * One of the six lookups, by reference.
 *
 * The status dialog takes whichever one belongs to its subject; naming the
 * shape here means the translator travels with it rather than being closed over
 * at each of the four call sites.
 */
export type StatusLookup = (value: string, t: Translator) => StatusMeta

export interface StatusMeta extends StatusPresentation {
  label: string
  description: string
}

const NEUTRAL: ToneClasses = {
  badge: 'border-border bg-muted text-muted-foreground',
  dot: 'bg-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
}

const EMERALD: ToneClasses = {
  badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
  dot: 'bg-tone-emerald',
  chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
}

const AMBER: ToneClasses = {
  badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
  dot: 'bg-tone-amber',
  chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
}

const ORANGE: ToneClasses = {
  badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
  dot: 'bg-tone-orange',
  chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
}

const ROSE: ToneClasses = {
  badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
  dot: 'bg-tone-rose',
  chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
}

const INDIGO: ToneClasses = {
  badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
  dot: 'bg-tone-indigo',
  chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
}

const CYAN: ToneClasses = {
  badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
  dot: 'bg-tone-cyan',
  chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
}

export const VENDOR_STATUS_META: Record<VendorStatus, StatusPresentation> = {
  Pending: { icon: Clock, ...AMBER },
  Active: { icon: CircleCheck, ...EMERALD },
  Inactive: { icon: CircleMinus, ...NEUTRAL },
  Suspended: { icon: CircleSlash, ...ROSE },
}

export const VEHICLE_STATUS_META: Record<VehicleStatus, StatusPresentation> = {
  Active: { icon: CircleCheck, ...EMERALD },
  Inactive: { icon: CircleMinus, ...NEUTRAL },
  'Under Maintenance': { icon: Wrench, ...AMBER },
  Suspended: { icon: CircleSlash, ...ORANGE },
  Expired: { icon: FileWarning, ...ROSE },
}

export const DRIVER_STATUS_META: Record<DriverStatus, StatusPresentation> = {
  Active: { icon: CircleCheck, ...EMERALD },
  Inactive: { icon: CircleMinus, ...NEUTRAL },
  Suspended: { icon: CircleSlash, ...ROSE },
  'On Leave': { icon: Palmtree, ...AMBER },
}

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, StatusPresentation> = {
  Active: { icon: BadgeCheck, ...EMERALD },
  Ended: { icon: CalendarClock, ...NEUTRAL },
}

/**
 * The three document states.
 *
 * All three carry a chip, unlike the alert row on the overview: a document
 * table is a list of facts, and an absent badge there would read as "no
 * information" rather than "nothing wrong". That is the same rule the Location
 * module's status badge follows.
 */
export const DOCUMENT_STATUS_META: Record<DocumentStatus, StatusPresentation> = {
  Valid: { icon: CircleCheck, ...EMERALD },
  'Expiring Soon': { icon: Clock, ...AMBER },
  Expired: { icon: FileWarning, ...ROSE },
}

export const OWNERSHIP_META: Record<VehicleOwnershipType, StatusPresentation> = {
  'Vendor Owned': { icon: Truck, ...INDIGO },
  Rented: { icon: KeyRound, ...CYAN },
}

/** Neutral presentation for a value the client does not recognise. */
function unknownMeta(value: string, t: Translator): StatusMeta {
  return {
    label: value || t('vendor.unknown'),
    description: t('vendor.unrecognised'),
    icon: CircleHelp,
    ...NEUTRAL,
  }
}

/**
 * One value out of one vocabulary, in words.
 *
 * The branch name is passed in rather than derived, so a vocabulary renamed in
 * the dictionary is a compile error at exactly one line per lookup rather than
 * a key that silently resolves to itself.
 */
function statusMeta(
  branch: string,
  value: string,
  presentation: StatusPresentation | undefined,
  t: Translator,
): StatusMeta {
  if (!presentation) {
    return unknownMeta(value, t)
  }

  return {
    ...presentation,
    label: t(`${branch}.${value}.label` as TranslationKey),
    description: t(`${branch}.${value}.description` as TranslationKey),
  }
}

/**
 * Tolerant lookups. A record written before one of these sets was fixed still
 * has to render as something — an unrecognised value degrades to a neutral
 * badge rather than throwing on `undefined.badge`.
 */
export function vendorStatusMeta(value: string, t: Translator): StatusMeta {
  return statusMeta('vendor.vendorStatuses', value, VENDOR_STATUS_META[value as VendorStatus], t)
}

export function vehicleStatusMeta(value: string, t: Translator): StatusMeta {
  return statusMeta('vendor.vehicleStatuses', value, VEHICLE_STATUS_META[value as VehicleStatus], t)
}

export function driverStatusMeta(value: string, t: Translator): StatusMeta {
  return statusMeta('vendor.driverStatuses', value, DRIVER_STATUS_META[value as DriverStatus], t)
}

export function assignmentStatusMeta(value: string, t: Translator): StatusMeta {
  return statusMeta(
    'vendor.assignmentStatuses',
    value,
    ASSIGNMENT_STATUS_META[value as AssignmentStatus],
    t,
  )
}

export function documentStatusMeta(value: string, t: Translator): StatusMeta {
  return statusMeta(
    'vendor.documentStatuses',
    value,
    DOCUMENT_STATUS_META[value as DocumentStatus],
    t,
  )
}

/**
 * What a document type is called.
 *
 * The value is stored — it comes off the record and out of `DOCUMENT_TYPES` —
 * so this is a lookup rather than a table of labels, and an unrecognised type
 * falls back to the value itself rather than to a blank cell.
 */
export function documentTypeLabel(value: string, t: Translator): string {
  return t(`vendor.documentTypes.${value}` as TranslationKey)
}

export function ownershipMeta(value: string, t: Translator): StatusMeta {
  return statusMeta('vendor.ownership', value, OWNERSHIP_META[value as VehicleOwnershipType], t)
}

/**
 * A calendar day as the API sends it — `YYYY-MM-DD` — rendered for a reader.
 *
 * Deliberately not `formatDate` from `lib/format.ts`, which takes an instant
 * and would shift the day for a viewer west of Greenwich. Every date in this
 * module is a calendar day: a licence expires *on* the 20th, not at an instant
 * on it. The same reasoning `formatTripDate` follows in Gate Pass.
 */
export function formatDay(value: string | null | undefined): string {
  return formatCalendarDay(value)
}

/**
 * "01 Sep 2026 — current" : how an assignment period reads in a row.
 *
 * It takes a translator because the open end of it is a word. Renamed from
 * `formatPeriod` at the same time — the i18n module has a `formatPeriod` of its
 * own for a month and a year, and two functions of that name meaning different
 * things is one import away from a quiet mistake.
 */
export function formatAssignmentPeriod(
  from: string,
  until: string | null,
  t: Translator,
): string {
  return t('vendor.period', {
    from: formatDay(from),
    until: until ? formatDay(until) : t('vendor.current'),
  })
}
