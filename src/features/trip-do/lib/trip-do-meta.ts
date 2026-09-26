import {
  CircleDashed,
  PackageCheck,
  PackageOpen,
  PackageX,
  Repeat,
  Truck,
  Undo2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type {
  GatePassProductStatus,
  RowDeliveryStatus,
  TripDoRowKind,
} from '../types'

/**
 * Display metadata for the Trip DO vocabulary. Colour for a status lives in one
 * table and never inline, and every class is a full literal string, because
 * Tailwind scans source text — the rule `challan-meta.ts` follows.
 *
 * The delivery words are the Challan list's own, so a row here and the same
 * challan there can never describe one lorry two ways.
 */

/** What a status says. The lookups below resolve it. */
export interface ToneMeta extends TonePresentation {
  label: string
  description: string
}

/** The untranslatable half: icon and colour, and nothing it says. */
export interface TonePresentation {
  icon: LucideIcon
  badge: string
  dot: string
  /** A thin progress fill in the same hue. */
  bar: string
}

export const ROW_STATUS_META: Record<RowDeliveryStatus, TonePresentation> = {
  Pending: {
    icon: PackageX,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    bar: 'bg-muted-foreground/60',
  },
  Partial: {
    icon: PackageOpen,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    bar: 'bg-tone-cyan',
  },
  Dispatched: {
    icon: Truck,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    bar: 'bg-tone-indigo',
  },
  Delivered: {
    icon: PackageCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    bar: 'bg-tone-emerald',
  },
  Returned: {
    icon: Undo2,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
    bar: 'bg-tone-rose',
  },
}

export function rowStatusMeta(value: string, t: Translator): ToneMeta {
  const status: RowDeliveryStatus =
    value in ROW_STATUS_META ? (value as RowDeliveryStatus) : 'Pending'

  return {
    ...ROW_STATUS_META[status],
    label: t(`tripDo.rowStatuses.${status}.label` as TranslationKey),
    description: t(`tripDo.rowStatuses.${status}.description` as TranslationKey),
  }
}

export const GATE_PASS_PRODUCT_STATUS_META: Record<GatePassProductStatus, TonePresentation> = {
  Unlinked: {
    icon: CircleDashed,
    badge: 'border-dashed border-tone-amber/40 bg-tone-amber/5 text-tone-amber',
    dot: 'bg-tone-amber',
    bar: 'bg-tone-amber',
  },
  Pending: ROW_STATUS_META.Pending,
  Returned: ROW_STATUS_META.Returned,
  Resent: {
    icon: Repeat,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    bar: 'bg-tone-cyan',
  },
  Partial: ROW_STATUS_META.Partial,
  Dispatched: ROW_STATUS_META.Dispatched,
  Delivered: ROW_STATUS_META.Delivered,
}

/**
 * Four of the seven read exactly as the row status does; three say something
 * of their own. The overrides are named here rather than duplicated into every
 * status, so a wording that *is* shared stays shared.
 */
const GATE_PASS_OVERRIDES: Partial<
  Record<GatePassProductStatus, { label?: TranslationKey; description: TranslationKey }>
> = {
  Unlinked: {
    label: 'tripDo.gatePassStatuses.Unlinked.label',
    description: 'tripDo.gatePassStatuses.Unlinked.description',
  },
  Returned: { description: 'tripDo.gatePassStatuses.Returned.description' },
  Resent: {
    label: 'tripDo.gatePassStatuses.Resent.label',
    description: 'tripDo.gatePassStatuses.Resent.description',
  },
}

export function gatePassProductStatusMeta(value: string, t: Translator): ToneMeta {
  const status: GatePassProductStatus =
    value in GATE_PASS_PRODUCT_STATUS_META ? (value as GatePassProductStatus) : 'Unlinked'

  const override = GATE_PASS_OVERRIDES[status]
  const base =
    status === 'Unlinked'
      ? { label: t('tripDo.gatePassStatuses.Unlinked.label'), description: '' }
      : rowStatusMeta(status, t)

  return {
    ...GATE_PASS_PRODUCT_STATUS_META[status],
    label: override?.label ? t(override.label) : base.label,
    description: override ? t(override.description) : base.description,
  }
}

export interface KindMeta extends KindPresentation {
  label: string
  description: string
}

interface KindPresentation {
  icon: LucideIcon | null
  /** The small tag beside the SL. Empty for an order row, which needs none. */
  tag: string
  /** A coloured rule down the row's left edge. */
  accent: string
  /** The product cell's text, so a return reads apart from an order at a glance. */
  text: string
}

export const KIND_META: Record<TripDoRowKind, KindPresentation> = {
  Order: {
    icon: null,
    tag: '',
    accent: '',
    text: '',
  },
  Return: {
    icon: Undo2,
    tag: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    accent: 'shadow-[inset_3px_0_0_var(--tone-rose)]',
    text: 'text-tone-rose',
  },
  Resent: {
    icon: Repeat,
    tag: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    accent: 'shadow-[inset_3px_0_0_var(--tone-cyan)]',
    text: 'text-tone-cyan',
  },
}

/** A row kind, with its words resolved. Tolerant: anything unknown reads as an order row. */
export function kindMeta(value: string, t: Translator): KindMeta {
  const kind: TripDoRowKind = value in KIND_META ? (value as TripDoRowKind) : 'Order'

  return {
    ...KIND_META[kind],
    label: t(`tripDo.kinds.${kind}.label` as TranslationKey),
    description: t(`tripDo.kinds.${kind}.description` as TranslationKey),
  }
}

export const KIND_FILTER_KEYS: Record<'all' | TripDoRowKind, TranslationKey> = {
  all: 'tripDo.filters.kindAll',
  Order: 'tripDo.filters.kindOrder',
  Return: 'tripDo.filters.kindReturn',
  Resent: 'tripDo.filters.kindResent',
}

export const LINK_FILTER_KEYS: Record<'all' | 'linked' | 'unlinked', TranslationKey> = {
  all: 'tripDo.filters.linkAll',
  linked: 'tripDo.filters.linkLinked',
  unlinked: 'tripDo.filters.linkUnlinked',
}

/**
 * The status filter reads the row-status wording rather than repeating it, so
 * the dropdown and the badge can never come to disagree about what "Partly
 * sent" is called.
 */
export function statusFilterLabel(value: 'all' | RowDeliveryStatus, t: Translator): string {
  return value === 'all' ? t('tripDo.filters.statusAll') : rowStatusMeta(value, t).label
}

/** A model reduced to what the API compares — the gate pass `comparisonKey`. */
export function modelKey(model: string): string {
  return model.toUpperCase().replace(/[^A-Z0-9]/g, '')
}
