import {
  CircleCheck,
  CircleSlash,
  FileCheck2,
  Loader,
  PackageCheck,
  PackageOpen,
  PackageX,
  PencilLine,
  Truck,
  Undo2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { formatFileSize, formatNumber } from '@/lib/format'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type { RangeProblem } from './page-ranges'
import type {
  ChallanBatchStatus,
  ChallanStatus,
  DispatchStatus,
  PageRange,
} from '../types'

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

/** What a status says, once a translator has been asked. */
export interface ChallanStatusMeta extends StatusPresentation {
  label: string
  description: string
}

/** The untranslatable half: an icon and the classes, and nothing it says. */
export interface StatusPresentation extends ToneClasses {
  icon: LucideIcon
}

export const CHALLAN_STATUS_META: Record<ChallanStatus, StatusPresentation> = {
  Submitted: {
    icon: FileCheck2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Amended: {
    icon: PencilLine,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
}

/**
 * How much of a challan has left the gate.
 *
 * Drawn in **every** state, unlike a backlog chip: this is a status badge on a
 * row, and an absent one would read as "no information" rather than "nothing
 * has gone". The same rule the Location module's status badge follows.
 */
export const DISPATCH_META: Record<DispatchStatus, StatusPresentation> = {
  Pending: {
    icon: PackageX,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    chip: 'bg-muted text-muted-foreground ring-border',
  },
  Partial: {
    icon: PackageOpen,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  },
  Dispatched: {
    icon: Truck,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Delivered: {
    icon: PackageCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
}

export function dispatchMeta(value: string, t: Translator): ChallanStatusMeta {
  const status: DispatchStatus = value in DISPATCH_META ? (value as DispatchStatus) : 'Pending'

  return {
    ...DISPATCH_META[status],
    label: t(`challan.dispatchStatuses.${status}.label` as TranslationKey),
    description: t(`challan.dispatchStatuses.${status}.description` as TranslationKey),
  }
}

/**
 * A `Pending` challan whose goods came back rather than never leaving. The
 * stored status stays `Pending` — it is still waiting for a lorry, and the
 * filters say so — and only the word on the badge says why.
 */
const RETURNED_DISPATCH_META: StatusPresentation = {
  icon: Undo2,
  badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
  dot: 'bg-tone-rose',
  chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
}

/** Pieces that came back and have not gone out again. */
export function atDepotQty(record: { returnedQty?: number; resentQty?: number }): number {
  return Math.max(0, (record.returnedQty ?? 0) - (record.resentQty ?? 0))
}

export function dispatchMetaFor(
  record: {
    dispatchStatus: string
    returnedQty?: number
    resentQty?: number
  },
  t: Translator,
): ChallanStatusMeta {
  if (record.dispatchStatus === 'Pending' && atDepotQty(record) > 0) {
    return {
      ...RETURNED_DISPATCH_META,
      label: t('challan.dispatchStatuses.Returned.label'),
      description: t('challan.dispatchStatuses.Returned.description'),
    }
  }
  return dispatchMeta(record.dispatchStatus, t)
}

export interface ChallanBatchStatusMeta extends StatusPresentation {
  label: string
  description: string
}

export const CHALLAN_BATCH_STATUS_META: Record<ChallanBatchStatus, StatusPresentation> = {
  Processing: {
    icon: Loader,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Completed: {
    icon: CircleCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
}

/** Neutral presentation for a value this client does not recognise. */
const UNKNOWN: StatusPresentation = {
  icon: CircleSlash,
  badge: 'border-border bg-muted text-muted-foreground',
  dot: 'bg-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
}

/**
 * Tolerant lookups. A record written before this vocabulary was fixed still
 * has to render as something, rather than throwing on `undefined.badge`.
 */
export function challanStatusMeta(value: string, t: Translator): ChallanStatusMeta {
  if (value in CHALLAN_STATUS_META) {
    const status = value as ChallanStatus
    return {
      ...CHALLAN_STATUS_META[status],
      label: t(`challan.statuses.${status}.label` as TranslationKey),
      description: t(`challan.statuses.${status}.description` as TranslationKey),
    }
  }
  return {
    ...UNKNOWN,
    label: value || t('challan.statuses.unknown.label'),
    description: t('challan.statuses.unknown.description'),
  }
}

export function batchStatusMeta(value: string, t: Translator): ChallanBatchStatusMeta {
  if (value in CHALLAN_BATCH_STATUS_META) {
    const status = value as ChallanBatchStatus
    return {
      ...CHALLAN_BATCH_STATUS_META[status],
      label: t(`challan.batchStatuses.${status}.label` as TranslationKey),
      description: t(`challan.batchStatuses.${status}.description` as TranslationKey),
    }
  }
  return {
    ...UNKNOWN,
    label: value || t('challan.statuses.unknown.label'),
    description: t('challan.statuses.unknown.description'),
  }
}

/**
 * "page 4" or "pages 4–6", for a sentence a person reads.
 *
 * The count chooses the whole message rather than an `s` on the end of a noun:
 * English agrees the noun with the number, Bangla does not, and a sentence
 * assembled from a stem and a suffix can only ever be right in one of them.
 */
export function formatRange(range: PageRange, t: Translator): string {
  return t('challan.pages.range', {
    count: range.startPage === range.endPage ? 1 : 2,
    range: formatRangeShort(range),
  })
}

/** "4" or "4–6", for a chip with no room for a word. */
export function formatRangeShort(range: PageRange): string {
  return range.startPage === range.endPage
    ? formatNumber(range.startPage)
    : `${formatNumber(range.startPage)}–${formatNumber(range.endPage)}`
}

/** "pages 3–4 and 7–9", for a list of gaps in a sentence. */
export function formatRanges(ranges: PageRange[], t: Translator): string {
  if (ranges.length === 0) {
    return t('challan.pages.none')
  }

  const parts = ranges.map(formatRangeShort)
  const single = ranges.length === 1 && ranges[0].startPage === ranges[0].endPage

  return t('challan.pages.range', {
    count: single ? 1 : 2,
    range:
      parts.length === 1
        ? parts[0]
        : t('challan.pages.listJoin', {
            head: parts.slice(0, -1).join(', '),
            last: parts[parts.length - 1],
          }),
  })
}

/**
 * A page-range problem, as a sentence.
 *
 * `page-ranges.ts` is import-free so it can be loaded by `node --test`, which
 * means it hands back a key and the raw values its message needs. Numbers are
 * formatted here — a page number reads in Bengali digits on a Bangla page —
 * and the overlap case builds its own `{range}` through `formatRange`, because
 * "page 4" against "pages 4–6" is a decision only the count can make.
 */
export function rangeProblemText(problem: RangeProblem, t: Translator): string {
  const values: Record<string, string | number> = {}

  for (const key of Object.keys(problem.values ?? {})) {
    const value: string | number = problem.values?.[key] ?? ''
    values[key] = typeof value === 'number' && key !== 'count' ? formatNumber(value) : value
  }

  if (problem.code === 'overlap') {
    values.range = formatRangeShort(problem.range)
  }

  return t(problem.messageKey as TranslationKey, values)
}

/**
 * "LBTS-CH-2026-000123" is long; a card's header only needs the tail, beside
 * the SL that identifies it.
 *
 * There was an `itemSummary` here too — the first product and "+2 more", which
 * is what a row had room for. The records list draws every line now, so
 * nothing needs a summary that hides the rest of a load.
 */
export function shortChallanNumber(challanNumber: string): string {
  const parts = challanNumber.split('-')
  return parts.length > 2 ? parts.slice(-2).join('-') : challanNumber
}

/** Delegates to the shared formatter, so a size reads the same everywhere. */
export function formatBytes(bytes: number | null): string {
  return formatFileSize(bytes)
}

/** Today as YYYY-MM-DD in the viewer's own calendar, for date inputs. */
export function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}
