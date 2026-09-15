import { gatePassProductStatusMeta } from '@/features/trip-do/lib/trip-do-meta'
import { sameFilterValue } from '@/lib/column-filters'
import type { ColumnFilterValue } from '@/lib/column-filters'
import type { GatePassColumnFilters, GatePassColumnId, GatePassListRecord } from '../types'
import { formatTripDate, gatePassStatusMeta } from './gate-pass-meta'

/**
 * The records sheet's columns between the pinned Trip DO and the pinned
 * actions, each with the id its filter dropdown asks the API about —
 * `gate-pass.columns.ts` owns what an id means.
 */

export interface GatePassSheetColumn {
  id: GatePassColumnId
  label: string
  className?: string
}

export const GATE_PASS_COLUMNS: GatePassSheetColumn[] = [
  { id: 'tripDate', label: 'Trip Date' },
  { id: 'delivery', label: 'Delivery Status' },
  { id: 'csd', label: 'CSD' },
  { id: 'unit', label: 'Unit' },
  { id: 'vehicle', label: 'Vehicle' },
  { id: 'customer', label: 'Customer' },
  { id: 'product', label: 'Product' },
  { id: 'model', label: 'Model' },
  { id: 'qty', label: 'QTY', className: 'text-right' },
  { id: 'status', label: 'Status' },
]

/** A dropdown value as the cell in its column draws it. */
export function gatePassColumnLabel(column: GatePassColumnId, value: ColumnFilterValue): string {
  if (value === null || value === '') {
    return '(Blanks)'
  }
  switch (column) {
    case 'tripDate':
      return formatTripDate(String(value))
    case 'delivery':
      return gatePassProductStatusMeta(String(value)).label
    case 'status':
      return gatePassStatusMeta(String(value)).label
    default:
      return String(value)
  }
}

/**
 * Whether one product line on a gate pass meets the line filters — product,
 * model, quantity and delivery status. The server keeps a gate pass when one
 * of its lines does; the sheet then draws only the lines that do, so ticking a
 * model shows that model's rows rather than every line of every gate pass
 * carrying it. `lineMatchesColumns` in `gate-pass.columns.ts` is the same rule.
 */
export function lineMatchesColumns(
  record: GatePassListRecord,
  index: number,
  columns: GatePassColumnFilters,
): boolean {
  const item = record.items[index]
  if (!item) {
    return false
  }
  const checks: [GatePassColumnId, ColumnFilterValue][] = [
    ['product', item.productName],
    ['model', item.model],
    ['qty', item.qty],
    ['delivery', record.lineDelivery[index]?.status ?? 'Unlinked'],
  ]
  return checks.every(([column, value]) => {
    const ticked = columns[column]
    return !ticked || ticked.length === 0 || ticked.some((entry) => sameFilterValue(entry, value))
  })
}
