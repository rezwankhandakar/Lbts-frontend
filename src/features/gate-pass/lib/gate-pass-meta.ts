import {
  BadgeCheck,
  CircleSlash,
  FileText,
  Send,
  Undo2,
  type LucideIcon,
} from 'lucide-react'
import { formatCalendarDay, formatFileSize } from '@/lib/i18n'
import type { TranslationKey, Translator } from '@/lib/i18n'
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

/** What a status says. `gatePassStatusMeta` resolves it. */
export interface GatePassStatusMeta extends GatePassStatusPresentation {
  label: string
  description: string
}

/** The untranslatable half: icon and colour, and nothing it says. */
interface GatePassStatusPresentation extends ToneClasses {
  icon: LucideIcon
}

export const GATE_PASS_STATUS_META: Record<GatePassStatus, GatePassStatusPresentation> = {
  Draft: {
    icon: FileText,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    chip: 'bg-muted text-muted-foreground ring-border',
  },
  Submitted: {
    icon: Send,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  Verified: {
    icon: BadgeCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Rejected: {
    icon: Undo2,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  },
}

/** Neutral presentation for a value this client does not recognise. */
const UNKNOWN: GatePassStatusPresentation = {
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
export function gatePassStatusMeta(value: string, t: Translator): GatePassStatusMeta {
  if (isGatePassStatus(value)) {
    return {
      ...GATE_PASS_STATUS_META[value],
      label: t(`gatePass.statuses.${value}.label` as TranslationKey),
      description: t(`gatePass.statuses.${value}.description` as TranslationKey),
    }
  }

  // An unrecognised value keeps its own raw string — it is data from the API.
  return {
    ...UNKNOWN,
    label: value || t('gatePass.statuses.unknown.label'),
    description: t('gatePass.statuses.unknown.description'),
  }
}

export const REFERENCE_TYPE_KEYS: Record<GatePassReferenceType, TranslationKey> = {
  None: 'gatePass.referenceTypes.None',
  Zone: 'gatePass.referenceTypes.Zone',
  PO: 'gatePass.referenceTypes.PO',
}

/** "Zone CSD-07", "PO 627143140", or nothing at all. */
export function referenceLabel(
  record: {
    referenceType: GatePassReferenceType
    zone: string | null
    po: string | null
  },
  t: Translator,
): string | null {
  if (record.referenceType === 'Zone' && record.zone) {
    return t('gatePass.zoneWith', { value: record.zone })
  }
  if (record.referenceType === 'PO' && record.po) {
    return t('gatePass.poWith', { value: record.po })
  }
  return null
}

/**
 * A gate pass's load in one line: the first product, and how many more there
 * are. A list has room for a line, not a table, and the first product is what
 * somebody scanning for a delivery recognises.
 */
export function itemSummary(
  record: { items: { productName: string; model: string }[] },
  t: Translator,
): string {
  const first = record.items[0]
  if (!first) {
    return '\u2014'
  }

  const rest = record.items.length - 1

  return rest > 0
    ? t('gatePass.itemSummaryMore', {
        product: first.productName,
        model: first.model,
        count: rest,
      })
    : t('gatePass.itemSummary', { product: first.productName, model: first.model })
}

/**
 * "20 Aug 2026" from a YYYY-MM-DD trip date.
 *
 * `lib/format.ts` renders instants in the viewer's timezone, which is right for
 * a timestamp and wrong for a calendar day: a trip dated the 20th must not read
 * as the 19th for anyone. Parsing the parts and formatting in UTC keeps the day
 * the day.
 */
/**
 * A trip date is a **calendar day**, so it is read at UTC rather than in the
 * viewer's own zone — the rule this module has always kept, now shared with
 * every other day in the app through `lib/i18n/format.ts`.
 */
export function formatTripDate(value: string | null): string {
  return formatCalendarDay(value)
}

/** Today as YYYY-MM-DD in the viewer's own calendar, for date inputs. */
export function todayIso(): string {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 10)
}

/** Kept as this module's name for what is now one shared formatter. */
export function formatBytes(bytes: number): string {
  return formatFileSize(bytes)
}
