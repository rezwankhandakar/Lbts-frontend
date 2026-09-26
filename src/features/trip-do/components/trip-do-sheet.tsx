import type { ReactNode } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { RowSelection } from '../hooks/use-row-selection'
import { COLUMNS } from '../lib/trip-do-columns'
import type { TripDoColumnId, TripDoFilterPatch, TripDoListParams, TripDoRowRecord } from '../types'
import { ColumnFilterMenu } from './trip-do-column-filter'
import { TripDoSheetRow } from './trip-do-sheet-row'
import type { RowActions } from './trip-do-sheet-row'

export interface TripDoSheetProps extends RowActions {
  rows: TripDoRowRecord[]
  canWrite: boolean
  selection: RowSelection
  filters: TripDoListParams
  onFilterChange: (patch: TripDoFilterPatch) => void
  /** Drawn in the body when no row matches, so the column filters stay in reach. */
  empty?: ReactNode
}

/**
 * The SL is pinned left and the Trip DO pinned right, because those are the
 * two a person matches by eye while scrolling across twenty columns in between.
 */
const HEAD =
  'sticky top-0 z-20 h-9 border-r border-b border-border/60 bg-muted px-2.5 text-left align-middle text-[11px] font-semibold tracking-wide whitespace-nowrap text-muted-foreground uppercase'

/**
 * Which rows sit on a shaded band. A challan's rows share one, so the eye can
 * tell where one delivery ends and the next begins without a heavier rule.
 */
function bandsFor(rows: readonly TripDoRowRecord[]): boolean[] {
  return rows.reduce<{ bands: boolean[]; last: string; band: boolean }>(
    (state, row) => {
      const band = row.challanId === state.last ? state.band : !state.band
      return { bands: [...state.bands, band], last: row.challanId, band }
    },
    { bands: [], last: '', band: true },
  ).bands
}

/**
 * The sheet itself: one scroll container with a sticky header — every column
 * carrying its filter dropdown — and sticky first and last columns. A
 * `border-separate` table, because a collapsed border does not travel with a
 * sticky cell and the grid lines would be left behind as a column scrolled
 * under them.
 */
export function TripDoSheet({
  rows,
  canWrite,
  selection,
  filters,
  onFilterChange,
  empty,
  ...actions
}: TripDoSheetProps) {
  const t = useT()

  const bands = bandsFor(rows)
  // A billed row cannot be given another Trip DO, so it is never ticked for one.
  const selectable = rows.filter((row) => !row.bill)
  const ticked = selectable.filter((row) => selection.isSelected(row.id)).length
  const allTicked = selectable.length > 0 && ticked === selectable.length
  const columnCount = COLUMNS.length + 2 + (canWrite ? 1 : 0)

  const heading = (id: TripDoColumnId, label: string, className?: string) => (
    <span className={cn('flex items-center gap-1', className === 'text-right' && 'justify-end')}>
      {label}
      <ColumnFilterMenu column={id} label={label} params={filters} onChange={onFilterChange} />
    </span>
  )

  return (
    <div className="relative max-h-[calc(100dvh-15rem)] min-h-[20rem] overflow-auto overscroll-x-contain">
      <table className="w-max min-w-full border-separate border-spacing-0 text-[12.5px]">
        <thead>
          <tr>
            {canWrite && (
              <th className={cn(HEAD, 'left-0 z-30 w-9 px-0 text-center')}>
                <Checkbox
                  checked={allTicked}
                  indeterminate={ticked > 0 && !allTicked}
                  onCheckedChange={() => selection.toggleAll(selectable)}
                  aria-label={t('tripDo.sheet.tickAll')}
                  disabled={selectable.length === 0}
                />
              </th>
            )}
            <th className={cn(HEAD, 'z-30 pr-1', canWrite ? 'left-9' : 'left-0')}>{heading('sl', t('tripDo.sheet.sl'))}</th>
            {COLUMNS.map((column) => (
              <th key={column.id} className={cn(HEAD, 'pr-1', column.className)}>
                {heading(column.id, t(column.labelKey), column.className)}
              </th>
            ))}
            <th
              className={cn(
                HEAD,
                'right-0 z-30 border-l pr-1 shadow-[-10px_0_14px_-14px_var(--foreground)]',
              )}
            >
              {heading('tripDo', t('tripDo.columns.tripDo'))}
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && empty ? (
            <tr>
              <td colSpan={columnCount} className="p-0">
                {/* Held to the visible width, so the message sits in view rather
                    than in the middle of a table wider than the screen. */}
                <div className="sticky left-0 w-[min(100vw-4rem,1500px)]">{empty}</div>
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <TripDoSheetRow
                key={row.id}
                row={row}
                banded={bands[index] ?? false}
                canWrite={canWrite}
                isSelected={selection.isSelected(row.id)}
                onToggle={selection.toggle}
                {...actions}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
