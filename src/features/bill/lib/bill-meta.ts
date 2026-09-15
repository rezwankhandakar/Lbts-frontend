import { BadgeCheck, CircleDashed, CircleDot, FileCheck2, FilePen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MONTH_NAMES } from '../types'
import type { BillStatus, BillingFilter, BillingStatus } from '../types'

export const BILLING_FILTER_LABELS: Record<BillingFilter, string> = {
  all: 'Any billing',
  unbilled: 'Not billed',
  partial: 'Partly billed',
  billed: 'Billed',
}

/**
 * Display metadata for the Bill vocabulary. Colour lives in one table and never
 * inline, and every class is a full literal string, because Tailwind scans
 * source text — the rule `trip-do-meta.ts` follows.
 */

export interface ToneMeta {
  label: string
  description: string
  icon: LucideIcon
  badge: string
  dot: string
  /** Text in the same hue, for a quiet flag beneath a primary badge. */
  text: string
}

export const BILL_STATUS_META: Record<BillStatus, ToneMeta> = {
  Draft: {
    label: 'Draft',
    description: 'Still being prepared: rows can be added and taken off.',
    icon: FilePen,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    text: 'text-tone-amber',
  },
  Finalized: {
    label: 'Finalized',
    description: 'Signed off. What it carries is fixed until an Admin or Manager reopens it.',
    icon: FileCheck2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    text: 'text-tone-emerald',
  },
}

export function billStatusMeta(value: string): ToneMeta {
  return BILL_STATUS_META[value as BillStatus] ?? BILL_STATUS_META.Draft
}

export const BILLING_STATUS_META: Record<BillingStatus, ToneMeta> = {
  Unbilled: {
    label: 'Not billed',
    description: 'None of its Trip DO rows is on a bill yet.',
    icon: CircleDashed,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  Partial: {
    label: 'Partly billed',
    description: 'Some of its Trip DO rows are on a bill and some are not.',
    icon: CircleDot,
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
    dot: 'bg-tone-orange',
    text: 'text-tone-orange',
  },
  Billed: {
    label: 'Billed',
    description: 'Every one of its Trip DO rows is on a bill.',
    icon: BadgeCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    text: 'text-tone-emerald',
  },
}

export function billingStatusMeta(value: string | null | undefined): ToneMeta {
  return BILLING_STATUS_META[value as BillingStatus] ?? BILLING_STATUS_META.Unbilled
}

/** "September 2026". */
export function periodLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? ''} ${year}`.trim()
}

/** "Sep". */
export function shortMonth(month: number): string {
  return (MONTH_NAMES[month - 1] ?? '').slice(0, 3)
}

/** The years a bill slot offers, oldest first: two back, this one and next — and `current` if it is none of those. */
export function billYearOptions(current: number, now: Date = new Date()): number[] {
  const year = now.getFullYear()
  return [...new Set([year - 2, year - 1, year, year + 1, current])].sort((a, b) => a - b)
}

/** `LBTS-BILL-2026-0007` read as `BILL-0007` where the year is already on screen. */
export function shortBillNumber(billNumber: string): string {
  const match = /^LBTS-BILL-\d{4}-(\d+)$/.exec(billNumber)
  return match ? `BILL-${match[1]}` : billNumber
}
