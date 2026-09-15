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

export interface ToneMeta {
  label: string
  description: string
  icon: LucideIcon
  badge: string
  dot: string
  /** A thin progress fill in the same hue. */
  bar: string
}

export const ROW_STATUS_META: Record<RowDeliveryStatus, ToneMeta> = {
  Pending: {
    label: 'Not dispatched',
    description: 'Filed, and on no trip yet.',
    icon: PackageX,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    bar: 'bg-muted-foreground/60',
  },
  Partial: {
    label: 'Partly sent',
    description: 'Split across trips, with something still to go.',
    icon: PackageOpen,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    bar: 'bg-tone-cyan',
  },
  Dispatched: {
    label: 'Sent',
    description: 'Out of the gate; the signed copy is not back yet.',
    icon: Truck,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    bar: 'bg-tone-indigo',
  },
  Delivered: {
    label: 'Delivered',
    description: 'Every trip carrying it has its signed copy in.',
    icon: PackageCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    bar: 'bg-tone-emerald',
  },
  Returned: {
    label: 'Returned',
    description: 'Went out and came back; waiting at the depot.',
    icon: Undo2,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    dot: 'bg-tone-rose',
    bar: 'bg-tone-rose',
  },
}

export function rowStatusMeta(value: string): ToneMeta {
  return ROW_STATUS_META[value as RowDeliveryStatus] ?? ROW_STATUS_META.Pending
}

export const GATE_PASS_PRODUCT_STATUS_META: Record<GatePassProductStatus, ToneMeta> = {
  Unlinked: {
    label: 'No challan yet',
    description: 'No challan row has this gate pass as its Trip DO.',
    icon: CircleDashed,
    badge: 'border-dashed border-tone-amber/40 bg-tone-amber/5 text-tone-amber',
    dot: 'bg-tone-amber',
    bar: 'bg-tone-amber',
  },
  Pending: ROW_STATUS_META.Pending,
  Returned: {
    ...ROW_STATUS_META.Returned,
    description: 'A linked return is back at the depot, and nothing linked has taken it out again.',
  },
  Resent: {
    label: 'Re-sent',
    description: 'Returned pieces have gone out again on a later trip; not all signed for yet.',
    icon: Repeat,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    bar: 'bg-tone-cyan',
  },
  Partial: ROW_STATUS_META.Partial,
  Dispatched: ROW_STATUS_META.Dispatched,
  Delivered: ROW_STATUS_META.Delivered,
}

export function gatePassProductStatusMeta(value: string): ToneMeta {
  return (
    GATE_PASS_PRODUCT_STATUS_META[value as GatePassProductStatus] ??
    GATE_PASS_PRODUCT_STATUS_META.Unlinked
  )
}

export interface KindMeta {
  label: string
  description: string
  icon: LucideIcon | null
  /** The small tag beside the SL. Empty for an order row, which needs none. */
  tag: string
  /** A coloured rule down the row's left edge. */
  accent: string
  /** The product cell's text, so a return reads apart from an order at a glance. */
  text: string
}

export const KIND_META: Record<TripDoRowKind, KindMeta> = {
  Order: {
    label: 'Order',
    description: 'A product line as the challan orders it.',
    icon: null,
    tag: '',
    accent: '',
    text: '',
  },
  Return: {
    label: 'Return',
    description: 'Pieces that went out on this trip and came back.',
    icon: Undo2,
    tag: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    accent: 'shadow-[inset_3px_0_0_var(--tone-rose)]',
    text: 'text-tone-rose',
  },
  Resent: {
    label: 'Re-sent',
    description: 'Pieces that had come back and this trip took out again.',
    icon: Repeat,
    tag: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    accent: 'shadow-[inset_3px_0_0_var(--tone-cyan)]',
    text: 'text-tone-cyan',
  },
}

export const KIND_FILTER_LABELS: Record<'all' | TripDoRowKind, string> = {
  all: 'Every row',
  Order: 'Order rows',
  Return: 'Returns',
  Resent: 'Re-sends',
}

export const LINK_FILTER_LABELS = {
  all: 'Any Trip DO',
  linked: 'Trip DO set',
  unlinked: 'Waiting for Trip DO',
} as const

export const STATUS_FILTER_LABELS: Record<'all' | RowDeliveryStatus, string> = {
  all: 'Any delivery status',
  Pending: ROW_STATUS_META.Pending.label,
  Partial: ROW_STATUS_META.Partial.label,
  Dispatched: ROW_STATUS_META.Dispatched.label,
  Delivered: ROW_STATUS_META.Delivered.label,
  Returned: ROW_STATUS_META.Returned.label,
}

/** A model reduced to what the API compares — the gate pass `comparisonKey`. */
export function modelKey(model: string): string {
  return model.toUpperCase().replace(/[^A-Z0-9]/g, '')
}
