import {
  BadgeCheck,
  CircleSlash,
  FileText,
  Send,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import type { GatePassReferenceType, GatePassStatus } from '../types'

/**
 * Display metadata for the Gate Pass vocabulary, in the same shape
 * `lib/roles.ts` uses for roles and account statuses — and for the same
 * reason: colour for a status belongs in one table, never inline in a
 * component.
 *
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` would generate nothing and the colour
 * would silently vanish.
 */

interface ToneClasses {
  /** Soft tinted pill: background, hairline border and text in one hue. */
  badge: string
  /** Solid swatch for the indicator dot, so status is not carried by colour alone. */
  dot: string
  /** Icon chip on a card or panel header. */
  chip: string
}

export interface GatePassStatusMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
}

export const GATE_PASS_STATUS_META: Record<GatePassStatus, GatePassStatusMeta> = {
  Draft: {
    label: 'Draft',
    description: 'Being prepared. Not yet part of the record.',
    icon: FileText,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    chip: 'bg-muted text-muted-foreground ring-border',
  },
  Submitted: {
    label: 'Submitted',
    description: 'Awaiting verification against the physical document.',
    icon: Send,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Verified: {
    label: 'Verified',
    description: 'Checked against the scanned gate pass and accepted.',
    icon: BadgeCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Rejected: {
    label: 'Rejected',
    description: 'Sent back for correction. Fix it and submit again.',
    icon: Undo2,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  },
  Cancelled: {
    label: 'Cancelled',
    description: 'Withdrawn. Kept for the record, but no longer counts.',
    icon: CircleSlash,
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
    dot: 'bg-tone-orange',
    chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
  },
}

/** Neutral presentation for a value this client does not recognise. */
const UNKNOWN: GatePassStatusMeta = {
  label: 'Unknown',
  description: 'Unrecognised status',
  icon: CircleSlash,
  badge: 'border-border bg-muted text-muted-foreground',
  dot: 'bg-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
}

function isGatePassStatus(value: string): value is GatePassStatus {
  return value in GATE_PASS_STATUS_META
}

/**
 * Tolerant lookup. A record written before this vocabulary was fixed still has
 * to render as something, rather than throwing on `undefined.badge`.
 */
export function gatePassStatusMeta(value: string): GatePassStatusMeta {
  return isGatePassStatus(value) ? GATE_PASS_STATUS_META[value] : { ...UNKNOWN, label: value || 'Unknown' }
}

export const REFERENCE_TYPE_LABELS: Record<GatePassReferenceType, string> = {
  None: 'No reference',
  Zone: 'Zone',
  PO: 'PO',
}

/** "Zone CSD-07", "PO 627143140", or nothing at all. */
export function referenceLabel(record: {
  referenceType: GatePassReferenceType
  zone: string | null
  po: string | null
}): string | null {
  if (record.referenceType === 'Zone' && record.zone) {
    return `Zone ${record.zone}`
  }
  if (record.referenceType === 'PO' && record.po) {
    return `PO ${record.po}`
  }
  return null
}

/**
 * A gate pass's load in one line: the first product, and how many more there
 * are. A list has room for a line, not a table, and the first product is what
 * somebody scanning for a delivery recognises.
 */
export function itemSummary(record: { items: { productName: string; model: string }[] }): string {
  const first = record.items[0]
  if (!first) {
    return '—'
  }

  const rest = record.items.length - 1
  return `${first.productName} (${first.model})${rest > 0 ? ` +${rest} more` : ''}`
}

/**
 * "20 Aug 2026" from a YYYY-MM-DD trip date.
 *
 * `lib/format.ts` renders instants in the viewer's timezone, which is right for
 * a timestamp and wrong for a calendar day: a trip dated the 20th must not read
 * as the 19th for anyone. Parsing the parts and formatting in UTC keeps the day
 * the day.
 */
const TRIP_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

export function formatTripDate(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(`${value.slice(0, 10)}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? value : TRIP_DATE_FORMAT.format(date)
}

/** Today as YYYY-MM-DD in the viewer's own calendar, for date inputs. */
export function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
