import { FileCheck2, FilePen } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { MONTH_NAMES } from '../types'
import type { LabourBillStatus } from '../types'

/**
 * Display metadata for the Walton Labour Bill vocabulary. Colour lives in one
 * table and never inline, and every class is a full literal string, because
 * Tailwind scans source text — the rule `bill-meta.ts` follows.
 */

export interface ToneMeta {
  label: string
  description: string
  icon: LucideIcon
  badge: string
  dot: string
  text: string
}

export const LABOUR_BILL_STATUS_META: Record<LabourBillStatus, ToneMeta> = {
  Draft: {
    label: 'Draft',
    description: 'Still being prepared: challans can be scanned in and amounts typed.',
    icon: FilePen,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    text: 'text-tone-amber',
  },
  Finalized: {
    label: 'Finalized',
    description: 'Signed off. What it charges is fixed until an Admin or Manager reopens it.',
    icon: FileCheck2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    text: 'text-tone-emerald',
  },
}

export function labourBillStatusMeta(value: string): ToneMeta {
  return LABOUR_BILL_STATUS_META[value as LabourBillStatus] ?? LABOUR_BILL_STATUS_META.Draft
}

/** "September 2026". */
export function labourPeriodLabel(month: number, year: number): string {
  return `${MONTH_NAMES[month - 1] ?? ''} ${year}`.trim()
}

/** "Sep". */
export function shortMonth(month: number): string {
  return (MONTH_NAMES[month - 1] ?? '').slice(0, 3)
}

/** "3 rows · 2 challans", the line a card and a toast both want. */
export function rowsAndChallans(lineCount: number, challanCount: number): string {
  return `${lineCount} ${lineCount === 1 ? 'row' : 'rows'} · ${challanCount} ${
    challanCount === 1 ? 'challan' : 'challans'
  }`
}
