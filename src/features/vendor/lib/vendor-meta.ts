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

export interface StatusMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
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

export const VENDOR_STATUS_META: Record<VendorStatus, StatusMeta> = {
  Pending: {
    label: 'Pending',
    description: 'Recorded, but not yet cleared to work.',
    icon: Clock,
    ...AMBER,
  },
  Active: {
    label: 'Active',
    description: 'Working, and able to take new assignments.',
    icon: CircleCheck,
    ...EMERALD,
  },
  Inactive: {
    label: 'Inactive',
    description: 'Out of use. Existing records are kept; nothing new is assigned.',
    icon: CircleMinus,
    ...NEUTRAL,
  },
  Suspended: {
    label: 'Suspended',
    description: 'Stopped by us. No new assignments until it is reinstated.',
    icon: CircleSlash,
    ...ROSE,
  },
}

export const VEHICLE_STATUS_META: Record<VehicleStatus, StatusMeta> = {
  Active: {
    label: 'Active',
    description: 'On the road, and able to take a driver.',
    icon: CircleCheck,
    ...EMERALD,
  },
  Inactive: {
    label: 'Inactive',
    description: 'Off the fleet for now.',
    icon: CircleMinus,
    ...NEUTRAL,
  },
  'Under Maintenance': {
    label: 'Maintenance',
    description: 'In the workshop. Not available for a new assignment.',
    icon: Wrench,
    ...AMBER,
  },
  Suspended: {
    label: 'Suspended',
    description: 'Stopped by us until further notice.',
    icon: CircleSlash,
    ...ORANGE,
  },
  Expired: {
    label: 'Expired',
    description: 'Papers have run out. It cannot be given a driver.',
    icon: FileWarning,
    ...ROSE,
  },
}

export const DRIVER_STATUS_META: Record<DriverStatus, StatusMeta> = {
  Active: {
    label: 'Active',
    description: 'Available, and able to be assigned.',
    icon: CircleCheck,
    ...EMERALD,
  },
  Inactive: {
    label: 'Inactive',
    description: 'No longer working for this vendor.',
    icon: CircleMinus,
    ...NEUTRAL,
  },
  Suspended: {
    label: 'Suspended',
    description: 'Stopped by us. Cannot be assigned.',
    icon: CircleSlash,
    ...ROSE,
  },
  'On Leave': {
    label: 'On leave',
    description: 'Away, and back later. Cannot take a new assignment meanwhile.',
    icon: Palmtree,
    ...AMBER,
  },
}

export const ASSIGNMENT_STATUS_META: Record<AssignmentStatus, StatusMeta> = {
  Active: {
    label: 'Active',
    description: 'In force now.',
    icon: BadgeCheck,
    ...EMERALD,
  },
  Ended: {
    label: 'Ended',
    description: 'History. Kept so the record can say who was driving.',
    icon: CalendarClock,
    ...NEUTRAL,
  },
}

/**
 * The three document states.
 *
 * All three carry a chip, unlike the alert row on the overview: a document
 * table is a list of facts, and an absent badge there would read as "no
 * information" rather than "nothing wrong". That is the same rule the Location
 * module's status badge follows.
 */
export const DOCUMENT_STATUS_META: Record<DocumentStatus, StatusMeta> = {
  Valid: {
    label: 'Valid',
    description: 'In date, with time to spare.',
    icon: CircleCheck,
    ...EMERALD,
  },
  'Expiring Soon': {
    label: 'Expiring soon',
    description: 'Inside the renewal window. Renew before it lapses.',
    icon: Clock,
    ...AMBER,
  },
  Expired: {
    label: 'Expired',
    description: 'Run out. The vehicle or driver should not be working on it.',
    icon: FileWarning,
    ...ROSE,
  },
}

export const OWNERSHIP_META: Record<VehicleOwnershipType, StatusMeta> = {
  'Vendor Owned': {
    label: 'Owned',
    description: "The vendor's own vehicle.",
    icon: Truck,
    ...INDIGO,
  },
  Rented: {
    label: 'Rented',
    description: 'Hired in by the vendor.',
    icon: KeyRound,
    ...CYAN,
  },
}

/** Neutral presentation for a value the client does not recognise. */
function unknownMeta(value: string): StatusMeta {
  return {
    label: value || 'Unknown',
    description: 'Not one of the recognised values.',
    icon: CircleHelp,
    ...NEUTRAL,
  }
}

/**
 * Tolerant lookups. A record written before one of these sets was fixed still
 * has to render as something — an unrecognised value degrades to a neutral
 * badge rather than throwing on `undefined.badge`.
 */
export function vendorStatusMeta(value: string): StatusMeta {
  return VENDOR_STATUS_META[value as VendorStatus] ?? unknownMeta(value)
}

export function vehicleStatusMeta(value: string): StatusMeta {
  return VEHICLE_STATUS_META[value as VehicleStatus] ?? unknownMeta(value)
}

export function driverStatusMeta(value: string): StatusMeta {
  return DRIVER_STATUS_META[value as DriverStatus] ?? unknownMeta(value)
}

export function assignmentStatusMeta(value: string): StatusMeta {
  return ASSIGNMENT_STATUS_META[value as AssignmentStatus] ?? unknownMeta(value)
}

export function documentStatusMeta(value: string): StatusMeta {
  return DOCUMENT_STATUS_META[value as DocumentStatus] ?? unknownMeta(value)
}

export function ownershipMeta(value: string): StatusMeta {
  return OWNERSHIP_META[value as VehicleOwnershipType] ?? unknownMeta(value)
}

/**
 * A calendar day as the API sends it — `YYYY-MM-DD` — rendered for a reader.
 *
 * Deliberately not `formatDate` from `lib/format.ts`, which takes an instant
 * and would shift the day for a viewer west of Greenwich. Every date in this
 * module is a calendar day: a licence expires *on* the 20th, not at an instant
 * on it. The same reasoning `formatTripDate` follows in Gate Pass.
 */
const DAY_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatDay(value: string | null | undefined): string {
  if (!value) {
    return '—'
  }

  const parsed = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(parsed.getTime()) ? '—' : DAY_FORMAT.format(parsed)
}

/** "01 Sep 2026 — current" : how an assignment period reads in a row. */
export function formatPeriod(from: string, until: string | null): string {
  return `${formatDay(from)} — ${until ? formatDay(until) : 'current'}`
}

/** A file size, for a document row. */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
