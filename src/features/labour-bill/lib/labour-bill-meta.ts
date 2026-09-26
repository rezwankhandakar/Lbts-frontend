import { FileCheck2, FilePen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatNumber, formatPeriod, shortMonthName } from '@/lib/i18n'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type { LabourBillStatus } from '../types'

/**
 * Display metadata for the Walton Labour Bill vocabulary. Colour lives in one
 * table and never inline, and every class is a full literal string, because
 * Tailwind scans source text — the rule `bill-meta.ts` follows.
 */

/** What a status says. `labourBillStatusMeta` resolves it. */
export interface ToneMeta extends TonePresentation {
  label: string
  description: string
}

/** The untranslatable half: icon and colour, and nothing it says. */
export interface TonePresentation {
  icon: LucideIcon
  badge: string
  dot: string
  text: string
}

export const LABOUR_BILL_STATUS_META: Record<LabourBillStatus, TonePresentation> = {
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

export function labourBillStatusMeta(value: string, t: Translator): ToneMeta {
  const status: LabourBillStatus =
    value in LABOUR_BILL_STATUS_META ? (value as LabourBillStatus) : 'Draft'

  return {
    ...LABOUR_BILL_STATUS_META[status],
    label: t(`labourBill.statuses.${status}.label` as TranslationKey),
    description: t(`labourBill.statuses.${status}.description` as TranslationKey),
  }
}

/** "September 2026", in the reader's language — see `bill-meta.ts`. */
export function labourPeriodLabel(month: number, year: number): string {
  return formatPeriod(month, year)
}

/** "Sep". */
export function shortMonth(month: number): string {
  return shortMonthName(month)
}

/**
 * "3 rows · 2 challans", the line a card and a toast both want.
 *
 * Two counted nouns joined by one separator, each its own message — English
 * agrees the noun with the number and Bangla does not, and the join itself is
 * a third thing a locale may want to write differently.
 */
export function rowsAndChallans(
  lineCount: number,
  challanCount: number,
  t: Translator,
): string {
  return t('labourBill.stats.rowsAndChallans', {
    rows: t('labourBill.stats.rowCount', { count: lineCount, n: formatNumber(lineCount) }),
    challans: t('labourBill.stats.challanCount', {
      count: challanCount,
      n: formatNumber(challanCount),
    }),
  })
}
