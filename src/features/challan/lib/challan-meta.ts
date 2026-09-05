import { CircleCheck, CircleSlash, FileCheck2, Loader, PencilLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ChallanBatchStatus, ChallanStatus, PageRange } from '../types'

/**
 * Display metadata for the Challan vocabulary, in the same shape
 * `lib/roles.ts` uses for roles and `gate-pass-meta.ts` uses for gate pass
 * statuses — and for the same reason: colour for a status belongs in one
 * table, never inline in a component.
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

export interface ChallanStatusMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
}

export const CHALLAN_STATUS_META: Record<ChallanStatus, ChallanStatusMeta> = {
  Submitted: {
    label: 'Submitted',
    description: 'Filed, numbered and stored with its barcode back page.',
    icon: FileCheck2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Amended: {
    label: 'Amended',
    description: 'Corrected after filing. The stored document was regenerated.',
    icon: PencilLine,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
}

export interface ChallanBatchStatusMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
}

export const CHALLAN_BATCH_STATUS_META: Record<ChallanBatchStatus, ChallanBatchStatusMeta> = {
  Processing: {
    label: 'Processing',
    description: 'Pages of this source PDF have not been filed as challans yet.',
    icon: Loader,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Completed: {
    label: 'Completed',
    description: 'Every page of the source PDF belongs to a submitted challan.',
    icon: CircleCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
}

/** Neutral presentation for a value this client does not recognise. */
const UNKNOWN: ChallanStatusMeta = {
  label: 'Unknown',
  description: 'Unrecognised status',
  icon: CircleSlash,
  badge: 'border-border bg-muted text-muted-foreground',
  dot: 'bg-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
}

/**
 * Tolerant lookups. A record written before this vocabulary was fixed still
 * has to render as something, rather than throwing on `undefined.badge`.
 */
export function challanStatusMeta(value: string): ChallanStatusMeta {
  return value in CHALLAN_STATUS_META
    ? CHALLAN_STATUS_META[value as ChallanStatus]
    : { ...UNKNOWN, label: value || 'Unknown' }
}

export function batchStatusMeta(value: string): ChallanBatchStatusMeta {
  return value in CHALLAN_BATCH_STATUS_META
    ? CHALLAN_BATCH_STATUS_META[value as ChallanBatchStatus]
    : { ...UNKNOWN, label: value || 'Unknown' }
}

/** "page 4" or "pages 4–6", for a sentence a person reads. */
export function formatRange(range: PageRange): string {
  return range.startPage === range.endPage
    ? `page ${range.startPage}`
    : `pages ${range.startPage}–${range.endPage}`
}

/** "4" or "4–6", for a chip with no room for a word. */
export function formatRangeShort(range: PageRange): string {
  return range.startPage === range.endPage
    ? String(range.startPage)
    : `${range.startPage}–${range.endPage}`
}

/** "pages 3–4 and 7–9", for a list of gaps in a sentence. */
export function formatRanges(ranges: PageRange[]): string {
  if (ranges.length === 0) {
    return 'none'
  }

  const parts = ranges.map((range) =>
    range.startPage === range.endPage
      ? String(range.startPage)
      : `${range.startPage}–${range.endPage}`,
  )

  const label = ranges.length === 1 && ranges[0].startPage === ranges[0].endPage ? 'page' : 'pages'

  if (parts.length === 1) {
    return `${label} ${parts[0]}`
  }

  return `${label} ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`
}

/**
 * A challan's load in one line: the first product, and how many more there
 * are. A list has room for a line, not a table, and the first product is what
 * somebody scanning for a delivery recognises. The same helper Gate Pass uses,
 * for the same reason.
 */
export function itemSummary(record: { items: { productName: string; model: string }[] }): string {
  const first = record.items[0]
  if (!first) {
    return '—'
  }

  const rest = record.items.length - 1
  return `${first.productName} (${first.model})${rest > 0 ? ` +${rest} more` : ''}`
}

/** "LBTS-CH-2026-000123" is long; a table cell often only needs the tail. */
export function shortChallanNumber(challanNumber: string): string {
  const parts = challanNumber.split('-')
  return parts.length > 2 ? parts.slice(-2).join('-') : challanNumber
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) {
    return '—'
  }
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Today as YYYY-MM-DD in the viewer's own calendar, for date inputs. */
export function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}
