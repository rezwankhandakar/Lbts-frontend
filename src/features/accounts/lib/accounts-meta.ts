import {
  ArrowDownLeft,
  ArrowLeftRight,
  BadgeCheck,
  HandCoins,
  Receipt,
  RotateCcw,
  Truck,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MONTH_NAMES } from '../types'
import type { EntryKind, Period, SettlementStatus, VendorBillStatus, WalletKind } from '../types'

/**
 * How each kind of entry looks. Every class is a full literal string, because
 * Tailwind scans source text and a composed `text-tone-${x}` generates nothing.
 */
export interface KindMeta {
  label: string
  /** What the action is called on a button. */
  action: string
  description: string
  icon: LucideIcon
  /** Icon chip: tinted surface, ring and text. */
  chip: string
  /** Amount colour in a list. */
  amount: string
  /** `+`, `−` or nothing, before the amount. */
  sign: string
}

export const KIND_META: Record<EntryKind, KindMeta> = {
  Deposit: {
    label: 'Deposit',
    action: 'Add money',
    description: 'Money added into cash as a deposit. Every transaction runs through cash.',
    icon: ArrowDownLeft,
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    amount: 'text-tone-emerald',
    sign: '+',
  },
  Transfer: {
    label: 'Transfer',
    action: 'Transfer',
    description: 'Move money between two cash wallets — the cash box and petty cash.',
    icon: ArrowLeftRight,
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    amount: 'text-foreground',
    sign: '',
  },
  Expense: {
    label: 'Expense',
    action: 'Add expense',
    description: 'Any office expense — rent, bills, salary, conveyance and the rest.',
    icon: Receipt,
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
    amount: 'text-tone-rose',
    sign: '−',
  },
  Advance: {
    label: 'Advance',
    action: 'Give advance',
    description: 'Money handed to anyone, to be returned in cash later.',
    icon: HandCoins,
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    amount: 'text-tone-amber',
    sign: '−',
  },
  AdvanceReturn: {
    label: 'Advance return',
    action: 'Record return',
    description: 'Cash given back against an advance. It comes off the advance in cash out, not added to cash in.',
    icon: RotateCcw,
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    amount: 'text-tone-amber',
    sign: '↩ ',
  },
  AdvanceAdjust: {
    label: 'Advance adjusted',
    action: 'Advance adjusted',
    description: 'An older adjustment of an advance, recorded before advances were settled by cash alone.',
    icon: BadgeCheck,
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    amount: 'text-tone-violet',
    sign: '',
  },
  TripAdvance: {
    label: 'Trip advance',
    action: 'Trip advance',
    description: "An advance to a vendor against one trip's rent and labour bill.",
    icon: Truck,
    chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
    amount: 'text-tone-orange',
    sign: '−',
  },
  VendorPayment: {
    label: 'Vendor payment',
    action: 'Pay vendor',
    description: "A vendor's monthly trip bill, after its advances.",
    icon: Wallet,
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    amount: 'text-tone-indigo',
    sign: '−',
  },
}

export const WALLET_KIND_LABEL: Record<WalletKind, string> = {
  Cash: 'Cash',
  Bank: 'Bank account',
  'Mobile Banking': 'Mobile banking',
}

export const VENDOR_STATUS_META: Record<VendorBillStatus, { label: string; badge: string }> = {
  'No Bill': { label: 'No bill yet', badge: 'bg-muted text-muted-foreground ring-border' },
  Unpaid: { label: 'Unpaid', badge: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20' },
  Partial: { label: 'Partly paid', badge: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20' },
  Paid: { label: 'Paid', badge: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20' },
  Overpaid: { label: 'Overpaid', badge: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20' },
}

export const SETTLEMENT_META: Record<SettlementStatus, { label: string; received: string; badge: string }> = {
  Open: { label: 'Open', received: 'Not received', badge: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20' },
  Partial: { label: 'Partly settled', received: 'Partly received', badge: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20' },
  Settled: { label: 'Settled', received: 'Received', badge: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20' },
}

// --- Describing an entry ----------------------------------------------------

interface DescribableEntry {
  kind: EntryKind
  party: string
  purpose: string
  source: string | null
  finalBill: { label: string } | null
  expenseName: string
  advance: { entryNumber: string } | null
  vendor: { name: string } | null
  trip: { tripNumber: string; registrationNo: string } | null
  period: { label: string } | null
  wallet: { name: string } | null
  toWallet: { name: string } | null
}

/** What an entry was, in two lines: who or what, and the detail under it. */
export function describeEntry(entry: DescribableEntry): { title: string; detail: string } {
  switch (entry.kind) {
    case 'Deposit':
      return entry.finalBill
        ? { title: 'Walton payment', detail: entry.finalBill.label }
        : { title: 'Cash deposit', detail: entry.party }
    case 'Transfer':
      return { title: `${entry.wallet?.name ?? '—'} → ${entry.toWallet?.name ?? '—'}`, detail: 'Between wallets' }
    case 'Expense':
      return { title: entry.expenseName || 'Expense', detail: entry.party ? `Paid to ${entry.party}` : '' }
    case 'Advance':
      return { title: entry.party, detail: entry.purpose }
    case 'AdvanceReturn':
      return { title: entry.party, detail: `Returned against ${entry.advance?.entryNumber ?? 'an advance'}` }
    case 'AdvanceAdjust':
      return {
        title: entry.party,
        detail: `${entry.expenseName || 'Expense'} · from ${entry.advance?.entryNumber ?? 'an advance'}`,
      }
    case 'TripAdvance':
      return {
        title: entry.vendor?.name ?? 'Trip advance',
        detail: [entry.trip?.tripNumber, entry.trip?.registrationNo, entry.party && `to ${entry.party}`].filter(Boolean).join(' · '),
      }
    case 'VendorPayment':
      return {
        title: entry.vendor?.name ?? 'Vendor payment',
        detail: `Trip bill · ${entry.period?.label ?? ''}${entry.party ? ` · to ${entry.party}` : ''}`,
      }
  }
}

// --- Days and months --------------------------------------------------------

/** Today in the viewer's own calendar, `YYYY-MM-DD` — not UTC's, which is six hours behind Dhaka. */
export function todayString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function currentPeriod(): Period {
  const today = todayString()
  return { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) }
}

export function shiftPeriod(period: Period, months: number): Period {
  const index = period.year * 12 + period.month - 1 + months
  return { year: Math.floor(index / 12), month: (index % 12) + 1 }
}

export function comparePeriods(a: Period, b: Period): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month)
}

/** `2026-09`. */
export function periodParam(period: Period): string {
  return `${period.year}-${String(period.month).padStart(2, '0')}`
}

export function parsePeriodParam(value: string | null): Period | null {
  const match = value?.match(/^(\d{4})-(0[1-9]|1[0-2])$/)
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null
}

/**
 * A month as two calendar days, and the day a new entry in it defaults to:
 * today while it is the current month, its last day once it is past.
 */
export function periodRange(period: Period): { from: string; to: string; defaultDay: string } {
  const lastDay = new Date(Date.UTC(period.year, period.month, 0)).getUTCDate()
  const prefix = periodParam(period)
  const today = todayString()
  const to = `${prefix}-${String(lastDay).padStart(2, '0')}`
  return { from: `${prefix}-01`, to, defaultDay: today.startsWith(prefix) ? today : to }
}

export function periodLabel(period: Period): string {
  return `${MONTH_NAMES[period.month - 1]} ${period.year}`
}

export function shortPeriodLabel(period: Period): string {
  return `${MONTH_NAMES[period.month - 1].slice(0, 3)} ${String(period.year).slice(2)}`
}

export interface PeriodRange {
  from: Period
  to: Period
}

/** The report range a Profit & Loss page opens on: the last six months, this one included. */
export function defaultReportRange(): PeriodRange {
  return { from: shiftPeriod(currentPeriod(), -5), to: currentPeriod() }
}

/** The Bangladesh fiscal year a month falls in, July to June. */
export function fiscalYearOf(period: Period): { from: Period; to: Period; label: string } {
  const start = period.month >= 7 ? period.year : period.year - 1
  return { from: { year: start, month: 7 }, to: { year: start + 1, month: 6 }, label: `FY ${start}–${String(start + 1).slice(2)}` }
}

const DAY_FORMAT = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

/**
 * A calendar day as it is written, in UTC so the day never shifts — `formatDate`
 * in `lib/format.ts` renders in the viewer's zone, which moves a UTC midnight
 * back a day west of Greenwich.
 */
export function formatDay(day: string | null): string {
  return day ? DAY_FORMAT.format(new Date(`${day}T00:00:00.000Z`)) : '—'
}

/** Taka, whole, grouped the South Asian way. */
export function taka(amount: number): string {
  return `৳${Math.round(amount).toLocaleString('en-IN')}`
}

/** Whole taka with a sign, for a figure that may be negative. */
export function signedTaka(amount: number): string {
  const formatted = `৳${Math.abs(amount).toLocaleString('en-IN')}`
  return amount < 0 ? `−${formatted}` : formatted
}
