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
import {
  BLANK,
  formatCalendarDay,
  formatPadded,
  formatPeriod,
  formatShortPeriod,
  formatTaka,
} from '@/lib/format'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type { EntryKind, Period, SettlementStatus, VendorBillStatus, WalletKind } from '../types'

/**
 * How each kind of entry looks. Every class is a full literal string, because
 * Tailwind scans source text and a composed `text-tone-${x}` generates nothing.
 *
 * The **words** are not here. `accounts.kinds.*` carries them and `kindMeta`
 * reads them through a translator, so a language switch renames every button,
 * badge and list row at once. What stays is the half that has no language: an
 * icon, three class strings and a sign.
 */
export interface KindPresentation {
  icon: LucideIcon
  /** Icon chip: tinted surface, ring and text. */
  chip: string
  /** Amount colour in a list. */
  amount: string
  /** `+`, `−` or nothing, before the amount. */
  sign: string
}

export interface KindMeta extends KindPresentation {
  label: string
  /** What the action is called on a button. */
  action: string
  description: string
}

export const KIND_META: Record<EntryKind, KindPresentation> = {
  Deposit: {
    icon: ArrowDownLeft,
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    amount: 'text-tone-emerald',
    sign: '+',
  },
  Transfer: {
    icon: ArrowLeftRight,
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    amount: 'text-foreground',
    sign: '',
  },
  Expense: {
    icon: Receipt,
    chip: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
    amount: 'text-tone-rose',
    sign: '−',
  },
  Advance: {
    icon: HandCoins,
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    amount: 'text-tone-amber',
    sign: '−',
  },
  AdvanceReturn: {
    icon: RotateCcw,
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    amount: 'text-tone-amber',
    sign: '↩ ',
  },
  AdvanceAdjust: {
    icon: BadgeCheck,
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    amount: 'text-tone-violet',
    sign: '',
  },
  TripAdvance: {
    icon: Truck,
    chip: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
    amount: 'text-tone-orange',
    sign: '−',
  },
  VendorPayment: {
    icon: Wallet,
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    amount: 'text-tone-indigo',
    sign: '−',
  },
}

/** One kind of entry, in words. */
export function kindMeta(kind: EntryKind, t: Translator): KindMeta {
  return {
    ...KIND_META[kind],
    label: t(`accounts.kinds.${kind}.label` as TranslationKey),
    action: t(`accounts.kinds.${kind}.action` as TranslationKey),
    description: t(`accounts.kinds.${kind}.description` as TranslationKey),
  }
}

export function walletKindLabel(kind: WalletKind, t: Translator): string {
  return t(`accounts.walletKinds.${kind}` as TranslationKey)
}

const VENDOR_STATUS_BADGE: Record<VendorBillStatus, string> = {
  'No Bill': 'bg-muted text-muted-foreground ring-border',
  Unpaid: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  Partial: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  Paid: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  Overpaid: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
}

export function vendorStatusMeta(
  status: VendorBillStatus,
  t: Translator,
): { label: string; badge: string } {
  return {
    label: t(`accounts.vendorStatuses.${status}` as TranslationKey),
    badge: VENDOR_STATUS_BADGE[status],
  }
}

const SETTLEMENT_BADGE: Record<SettlementStatus, string> = {
  Open: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  Partial: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  Settled: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
}

/**
 * An advance's state, and the same state read from the other side.
 *
 * `received` is not a translation of `label` — an advance is "Open" to whoever
 * gave it and "Not received" to whoever is waiting for it back, and the two
 * words sit on different screens.
 */
export function settlementMeta(
  status: SettlementStatus,
  t: Translator,
): { label: string; received: string; badge: string } {
  return {
    label: t(`accounts.settlement.${status}.label` as TranslationKey),
    received: t(`accounts.settlement.${status}.received` as TranslationKey),
    badge: SETTLEMENT_BADGE[status],
  }
}

// --- Describing an entry ----------------------------------------------------

interface DescribableEntry {
  kind: EntryKind
  party: string
  purpose: string
  source: string | null
  finalBill: { label: string } | null
  labourBill: { label: string } | null
  expenseName: string
  advance: { entryNumber: string } | null
  vendor: { name: string } | null
  trip: { tripNumber: string; registrationNo: string } | null
  period: { label: string } | null
  wallet: { name: string } | null
  toWallet: { name: string } | null
}

/** What an entry was, in two lines: who or what, and the detail under it. */
export function describeEntry(
  entry: DescribableEntry,
  t: Translator,
): { title: string; detail: string } {
  switch (entry.kind) {
    /**
     * A deposit says which claim it settles, because "Walton payment" beside
     * another "Walton payment" tells nobody which of the two arrived. The
     * bill's own name is a proper noun and keeps its capitals, exactly as the
     * tab it comes from spells it; a plain deposit stays what it always was.
     */
    case 'Deposit':
      if (entry.labourBill) {
        return { title: t('accounts.describe.labourPayment'), detail: entry.labourBill.label }
      }
      if (entry.finalBill) {
        return { title: t('accounts.describe.finalPayment'), detail: entry.finalBill.label }
      }
      return { title: t('accounts.describe.cashDeposit'), detail: entry.party }
    case 'Transfer':
      return {
        title: t('accounts.describe.walletToWallet', {
          from: entry.wallet?.name ?? BLANK,
          to: entry.toWallet?.name ?? BLANK,
        }),
        detail: t('accounts.describe.betweenWallets'),
      }
    case 'Expense':
      return {
        title: entry.expenseName || t('accounts.describe.expense'),
        detail: entry.party ? t('accounts.describe.paidTo', { name: entry.party }) : '',
      }
    case 'Advance':
      return { title: entry.party, detail: entry.purpose }
    case 'AdvanceReturn':
      return {
        title: entry.party,
        detail: t('accounts.describe.returnedAgainst', {
          entry: entry.advance?.entryNumber ?? t('accounts.describe.anAdvance'),
        }),
      }
    case 'AdvanceAdjust':
      return {
        title: entry.party,
        detail: t('accounts.describe.adjustedFrom', {
          expense: entry.expenseName || t('accounts.describe.expense'),
          entry: entry.advance?.entryNumber ?? t('accounts.describe.anAdvance'),
        }),
      }
    case 'TripAdvance':
      return {
        title: entry.vendor?.name ?? t('accounts.describe.tripAdvance'),
        detail: [
          entry.trip?.tripNumber,
          entry.trip?.registrationNo,
          entry.party && t('accounts.describe.toParty', { name: entry.party }),
        ]
          .filter(Boolean)
          .join(' · '),
      }
    case 'VendorPayment':
      return {
        title: entry.vendor?.name ?? t('accounts.describe.vendorPayment'),
        detail: entry.party
          ? t('accounts.describe.tripBillPeriodTo', {
              period: entry.period?.label ?? '',
              name: entry.party,
            })
          : t('accounts.describe.tripBillPeriod', { period: entry.period?.label ?? '' }),
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
  return formatPeriod(period.month, period.year)
}

export function shortPeriodLabel(period: Period): string {
  return formatShortPeriod(period.month, period.year)
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
export function fiscalYearOf(period: Period): { from: Period; to: Period } {
  const start = period.month >= 7 ? period.year : period.year - 1
  return { from: { year: start, month: 7 }, to: { year: start + 1, month: 6 } }
}

/**
 * "FY 2026–27", as words.
 *
 * Split from the arithmetic above on purpose: the range picker wants the two
 * months and never the label, and threading a translator into a preset table
 * built at module scope would freeze it in whichever language the tab opened
 * in.
 */
export function fiscalYearLabel(period: Period, t: Translator): string {
  const start = period.month >= 7 ? period.year : period.year - 1
  return t('accounts.fiscalYear', {
    from: formatPadded(start, 4),
    to: formatPadded(Number(String(start + 1).slice(2)), 2),
  })
}


/**
 * A calendar day as it is written, read at UTC so the day never shifts.
 *
 * It delegates now: `formatCalendarDay` is the one UTC day formatter in the
 * app, and it renders Bengali digits and Bengali month names on a Bangla page,
 * which a hand-held `Intl` instance pinned to the browser's own locale could
 * not do.
 */
export function formatDay(day: string | null): string {
  return formatCalendarDay(day)
}

/** Taka, whole, grouped the Bangladeshi way. */
export function taka(amount: number): string {
  return formatTaka(Math.round(amount))
}

/**
 * Whole taka with a sign, for a figure that may be negative.
 *
 * The minus is the typographic one rather than the hyphen, and it is put in
 * front of a formatted absolute value rather than left to `Intl` — a due
 * amount reads "−৳১,২০০" in both languages, and the sign belongs outside the
 * digits it qualifies.
 */
export function signedTaka(amount: number): string {
  const rounded = Math.round(amount)
  const formatted = formatTaka(Math.abs(rounded))
  return rounded < 0 ? `−${formatted}` : formatted
}
