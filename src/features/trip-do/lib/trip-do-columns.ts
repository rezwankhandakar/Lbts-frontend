import { shortTripNumber } from '@/features/delivery/lib/cart'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { formatTaka } from '@/lib/format'
import type { TranslationKey, Translator } from '@/lib/i18n'
import type { ColumnValue, TripDoColumnId } from '../types'
import { rowStatusMeta } from './trip-do-meta'

/**
 * The sheet's columns between the SL and the Trip DO, in the order the office's
 * own spreadsheet keeps them. Each one carries the id its filter dropdown asks
 * the API about — `trip-do.columns.ts` owns what an id means.
 */

export interface SheetColumn {
  id: TripDoColumnId
  /** A key rather than a heading — the sheet is a screen, and the screen follows the language. */
  labelKey: TranslationKey
  className?: string
}

export const COLUMNS: SheetColumn[] = [
  { id: 'date', labelKey: 'tripDo.columns.date' },
  { id: 'trip', labelKey: 'tripDo.columns.trip' },
  { id: 'status', labelKey: 'tripDo.columns.status' },
  { id: 'customer', labelKey: 'tripDo.columns.customer' },
  { id: 'address', labelKey: 'tripDo.columns.address' },
  { id: 'district', labelKey: 'tripDo.columns.district' },
  { id: 'thana', labelKey: 'tripDo.columns.thana' },
  { id: 'location', labelKey: 'tripDo.columns.location' },
  { id: 'receiver', labelKey: 'tripDo.columns.receiver' },
  { id: 'zone', labelKey: 'tripDo.columns.zone' },
  { id: 'product', labelKey: 'tripDo.columns.product' },
  { id: 'model', labelKey: 'tripDo.columns.model' },
  { id: 'qty', labelKey: 'tripDo.columns.qty', className: 'text-right' },
  { id: 'rate', labelKey: 'tripDo.columns.rate', className: 'text-right' },
  { id: 'amount', labelKey: 'tripDo.columns.amount', className: 'text-right' },
  { id: 'capacity', labelKey: 'tripDo.columns.capacity' },
  { id: 'csd', labelKey: 'tripDo.columns.csd' },
  { id: 'unit', labelKey: 'tripDo.columns.unit' },
  { id: 'bill', labelKey: 'tripDo.columns.bill' },
]

/** `flat:1100` or `tiered:5:60:24`, as the Rate cell would print it. */
function rateKeyLabel(key: string): string {
  const [kind, ...rest] = key.split(':')
  const numbers = rest.map(Number)
  if (kind === 'flat' && numbers.length === 1) {
    return formatTaka(numbers[0])
  }
  if (kind === 'tiered' && numbers.length === 3) {
    return `${formatTaka(numbers[1])} / ${formatTaka(numbers[2])} (first ${numbers[0]})`
  }
  return key
}

/** A dropdown value as the cell in its column draws it. */
export function columnValueLabel(
  column: TripDoColumnId,
  value: ColumnValue,
  t: Translator,
): string {
  if (value === null || value === '') {
    return t('common.states.blanks')
  }
  switch (column) {
    case 'date':
      return formatTripDate(String(value))
    case 'status':
      return rowStatusMeta(String(value), t).label
    case 'trip':
      return shortTripNumber(String(value))
    case 'amount':
      return formatTaka(Number(value))
    case 'rate':
      return rateKeyLabel(String(value))
    default:
      return String(value)
  }
}
