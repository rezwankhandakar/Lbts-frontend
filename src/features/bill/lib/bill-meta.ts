import { BadgeCheck, CircleDashed, CircleDot, FileCheck2, FilePen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatPeriod, shortMonthName } from '@/lib/i18n'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type { BillStatus, BillingFilter, BillingStatus } from '../types'

export const BILLING_FILTER_KEYS: Record<BillingFilter, TranslationKey> = {
  all: 'bill.billingFilters.all',
  unbilled: 'bill.billingFilters.unbilled',
  partial: 'bill.billingFilters.partial',
  billed: 'bill.billingFilters.billed',
}

/**
 * Display metadata for the Bill vocabulary. Colour lives in one table and never
 * inline, and every class is a full literal string, because Tailwind scans
 * source text — the rule `trip-do-meta.ts` follows.
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
  /** Text in the same hue, for a quiet flag beneath a primary badge. */
  text: string
}

export const BILL_STATUS_META: Record<BillStatus, TonePresentation> = {
  Draft: {
    icon: FilePen,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    text: 'text-tone-amber',
  },
  Finalized: {
    icon: FileCheck2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    text: 'text-tone-emerald',
  },
}

export function billStatusMeta(value: string, t: Translator): ToneMeta {
  const status: BillStatus = value in BILL_STATUS_META ? (value as BillStatus) : 'Draft'

  return {
    ...BILL_STATUS_META[status],
    label: t(`bill.statuses.${status}.label` as TranslationKey),
    description: t(`bill.statuses.${status}.description` as TranslationKey),
  }
}

export const BILLING_STATUS_META: Record<BillingStatus, TonePresentation> = {
  Unbilled: {
    icon: CircleDashed,
    badge: 'border-border bg-muted text-muted-foreground',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  Partial: {
    icon: CircleDot,
    badge: 'border-tone-orange/25 bg-tone-orange/10 text-tone-orange',
    dot: 'bg-tone-orange',
    text: 'text-tone-orange',
  },
  Billed: {
    icon: BadgeCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    text: 'text-tone-emerald',
  },
}

export function billingStatusMeta(value: string | null | undefined, t: Translator): ToneMeta {
  const status: BillingStatus =
    value && value in BILLING_STATUS_META ? (value as BillingStatus) : 'Unbilled'

  return {
    ...BILLING_STATUS_META[status],
    label: t(`bill.billingStatuses.${status}.label` as TranslationKey),
    description: t(`bill.billingStatuses.${status}.description` as TranslationKey),
  }
}

/**
 * "September 2026" — in the reader's language.
 *
 * The twelve month names used to be a hard-coded array in this module, in the
 * Labour Bill's and in Accounts'. They come from `Intl` now, once, which is
 * what makes a billing month read as সেপ্টেম্বর without any of the three
 * learning about the other two.
 */
export function periodLabel(month: number, year: number): string {
  return formatPeriod(month, year)
}

/** "Sep". */
export function shortMonth(month: number): string {
  return shortMonthName(month)
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
