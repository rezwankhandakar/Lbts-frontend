import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { GATE_PASS_COLUMNS, lineMatchesColumns } from '../lib/gate-pass-columns'
import type { FilterPatch, GatePassColumnId, GatePassListParams, GatePassListRecord } from '../types'
import type { GatePassActions } from './gate-pass-action-menu'
import { GatePassColumnFilter } from './gate-pass-column-filter'
import { GatePassSheetRow } from './gate-pass-sheet-row'

export interface GatePassSheetProps {
  records: GatePassListRecord[]
  actions: GatePassActions
  onOpen: (record: GatePassListRecord) => void
  filters: GatePassListParams
  onFilterChange: (patch: FilterPatch) => void
  /** Drawn in the body when nothing matches, so the column filters stay in reach. */
  empty?: ReactNode
}

const HEAD =
  'sticky top-0 z-20 h-9 border-r border-b border-border/60 bg-muted px-2.5 pr-1 text-left align-middle text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase'

export interface SheetLine {
  record: GatePassListRecord
  index: number
  /** Rows of one gate pass share a shaded band, so a record reads as a unit. */
  banded: boolean
}

/**
 * One row per product line, in each gate pass's own line order — only the
 * lines the product, model, quantity and delivery filters keep.
 */
function linesOf(records: readonly GatePassListRecord[], filters: GatePassListParams): SheetLine[] {
  return records.flatMap((record, position) =>
    record.items
      .map((_, index) => index)
      .filter((index) => lineMatchesColumns(record, index, filters.columns))
      .map((index) => ({ record, index, banded: position % 2 === 1 })),
  )
}

/**
 * The gate pass records as a sheet: one row for every model on every gate pass,
 * the style of the Trip DO sheet, with a spreadsheet filter dropdown on every
 * column header. Each row says where that model's goods are, read from the
 * challans linked to it on the Trip DO sheet.
 *
 * A `border-separate` table with a sticky header, the Trip DO pinned left and
 * the actions pinned right, for the reason the Trip DO sheet gives: a collapsed
 * border does not travel with a sticky cell. Paging is still by gate pass, so
 * one record's lines are never split across two pages.
 */
export function GatePassSheet({ records, actions, onOpen, filters, onFilterChange, empty }: GatePassSheetProps) {
  const lines = linesOf(records, filters)

  const heading = (id: GatePassColumnId, label: string, className?: string) => (
    <span className={cn('flex items-center gap-1', className === 'text-right' && 'justify-end')}>
      {label}
      <GatePassColumnFilter column={id} label={label} params={filters} onChange={onFilterChange} />
    </span>
  )

  return (
    <div className="relative max-h-[calc(100dvh-14rem)] min-h-[18rem] overflow-auto overscroll-x-contain">
      <table className="w-max min-w-full border-separate border-spacing-0 text-[12.5px]">
        <thead>
          <tr>
            <th className={cn(HEAD, 'left-0 z-30')}>{heading('tripDo', 'Trip Do')}</th>
            {GATE_PASS_COLUMNS.map((column) => (
              <th key={column.id} className={cn(HEAD, column.className)}>
                {heading(column.id, column.label, column.className)}
              </th>
            ))}
            <th
              className={cn(
                HEAD,
                'right-0 z-30 w-12 border-l shadow-[-10px_0_14px_-14px_var(--foreground)]',
              )}
            >
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>

        <tbody>
          {records.length === 0 && empty ? (
            <tr>
              <td colSpan={GATE_PASS_COLUMNS.length + 2} className="p-0">
                {/* Held to the visible width, so the message sits in view rather
                    than in the middle of a table wider than the screen. */}
                <div className="sticky left-0 w-[min(100vw-4rem,1500px)]">{empty}</div>
              </td>
            </tr>
          ) : (
            lines.map((line) => (
              <GatePassSheetRow
                key={`${line.record.id}-${line.index}`}
                line={line}
                actions={actions}
                onOpen={onOpen}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
