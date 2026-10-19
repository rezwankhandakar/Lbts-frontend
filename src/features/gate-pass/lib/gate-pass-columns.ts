import { gatePassProductStatusMeta } from '@/features/trip-do/lib/trip-do-meta'
import type { TranslationKey, Translator } from '@/lib/i18n'
import { sameFilterValue } from '@/lib/column-filters'
import type { ColumnFilterValue } from '@/lib/column-filters'
import type {
  GatePassColumnFilters,
  GatePassColumnId,
  GatePassListParams,
  GatePassListRecord,
  PieceFilter,
} from '../types'
import { formatTripDate, gatePassStatusMeta } from './gate-pass-meta'

/**
 * The records sheet's columns between the pinned Trip DO and the pinned
 * actions, each with the id its filter dropdown asks the API about —
 * `gate-pass.columns.ts` owns what an id means.
 */

export interface GatePassSheetColumn {
  id: GatePassColumnId
  labelKey: TranslationKey
  className?: string
}

/**
 * The sheet's columns, as keys rather than words: this is the screen, and the
 * `.xlsx` the office sends is built server-side with the headings it has
 * always had.
 */
export const GATE_PASS_COLUMNS: GatePassSheetColumn[] = [
  { id: 'tripDate', labelKey: 'gatePass.columns.tripDate' },
  { id: 'delivery', labelKey: 'gatePass.columns.delivery' },
  { id: 'csd', labelKey: 'gatePass.columns.csd' },
  { id: 'unit', labelKey: 'gatePass.columns.unit' },
  { id: 'vehicle', labelKey: 'gatePass.columns.vehicle' },
  { id: 'customer', labelKey: 'gatePass.columns.customer' },
  { id: 'product', labelKey: 'gatePass.columns.product' },
  { id: 'model', labelKey: 'gatePass.columns.model' },
  { id: 'qty', labelKey: 'gatePass.columns.qty', className: 'text-right' },
  { id: 'status', labelKey: 'gatePass.columns.status' },
]

/** A dropdown value as the cell in its column draws it. */
export function gatePassColumnLabel(
  column: GatePassColumnId,
  value: ColumnFilterValue,
  t: Translator,
): string {
  if (value === null || value === '') {
    return t('common.states.blanks')
  }
  switch (column) {
    case 'tripDate':
      return formatTripDate(String(value))
    case 'delivery':
      return gatePassProductStatusMeta(String(value), t).label
    case 'status':
      return gatePassStatusMeta(String(value), t).label
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

/**
 * Whether one line holds pieces in a pressed delivery card's bucket, so the
 * sheet under a card shows the lines that card counted. `lineHasPieces` in
 * `gate-pass.columns.ts` is the same rule.
 */
export function lineHasPieces(record: GatePassListRecord, index: number, filter: PieceFilter): boolean {
  const qty = record.items[index]?.qty ?? 0
  const line = record.lineDelivery[index]
  const delivered = Math.min(qty, line?.deliveredQty ?? 0)
  switch (filter) {
    case 'delivered':
      return delivered > 0
    case 'notDelivered':
      return delivered < qty
    case 'sent':
      return (line?.sentQty ?? 0) > 0
    case 'returned':
      return (line?.returnedQty ?? 0) > 0
    default:
      return true
  }
}

/** Every line filter the sheet applies: the column dropdowns and the delivery card. */
export function lineIsShown(
  record: GatePassListRecord,
  index: number,
  filters: Pick<GatePassListParams, 'columns' | 'pieces'>,
): boolean {
  return (
    lineMatchesColumns(record, index, filters.columns) &&
    lineHasPieces(record, index, filters.pieces)
  )
}
