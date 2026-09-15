import { shortTripNumber } from '@/features/delivery/lib/cart'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { formatTaka } from '@/lib/format'
import type { ColumnValue, TripDoColumnId } from '../types'
import { rowStatusMeta } from './trip-do-meta'

/**
 * The sheet's columns between the SL and the Trip DO, in the order the office's
 * own spreadsheet keeps them. Each one carries the id its filter dropdown asks
 * the API about — `trip-do.columns.ts` owns what an id means.
 */

export interface SheetColumn {
  id: TripDoColumnId
  label: string
  className?: string
}

export const COLUMNS: SheetColumn[] = [
  { id: 'date', label: 'Date' },
  { id: 'trip', label: 'Trip Number' },
  { id: 'status', label: 'Delivery Status' },
  { id: 'customer', label: 'Customer' },
  { id: 'address', label: 'Address' },
  { id: 'district', label: 'District' },
  { id: 'thana', label: 'Thana' },
  { id: 'location', label: 'Location' },
  { id: 'receiver', label: 'Receiver number' },
  { id: 'zone', label: 'Zone' },
  { id: 'product', label: 'Product name' },
  { id: 'model', label: 'Model' },
  { id: 'qty', label: 'Qty', className: 'text-right' },
  { id: 'rate', label: 'Rate', className: 'text-right' },
  { id: 'amount', label: 'Amount', className: 'text-right' },
  { id: 'capacity', label: 'Capacity' },
  { id: 'csd', label: 'CSD' },
  { id: 'unit', label: 'Unit' },
  { id: 'bill', label: 'Bill' },
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
export function columnValueLabel(column: TripDoColumnId, value: ColumnValue): string {
  if (value === null || value === '') {
    return '(Blanks)'
  }
  switch (column) {
    case 'date':
      return formatTripDate(String(value))
    case 'status':
      return rowStatusMeta(String(value)).label
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
