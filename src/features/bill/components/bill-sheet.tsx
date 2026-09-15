import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BillLineRecord, BillRecord } from '../types'
import { BillSheetRow, CELL } from './bill-sheet-row'
import type { RemoveTarget } from './bill-sheet-row'

interface BillSheetProps {
  bill: BillRecord
  lines: BillLineRecord[]
  canRemove: boolean
  onRemove: (target: RemoveTarget) => void
}

/** The Excel file's headers, in its order. */
const HEADINGS = [
  'SL',
  'Customer',
  'CSD',
  'Receiver Number',
  'Address',
  'District',
  'Thana',
  'Location',
  'Unit',
  'Products Model',
  'Qty.',
  'Rate',
  'Amount',
  'Products',
  'Trip Do',
  'Capacity',
  'Remarks',
]

const HEAD =
  'sticky top-0 z-10 border-r border-b border-border/70 bg-[color-mix(in_oklch,var(--card),var(--primary)_10%)] px-2.5 py-2.5 text-center align-middle text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase'

const FOOT = cn(
  CELL,
  'sticky bottom-0 z-10 border-t-2 border-t-border bg-[color-mix(in_oklch,var(--card),var(--muted)_80%)] py-2.5 font-semibold tabular-nums',
)

/** Every line's Trip DO group, as line ids, for the SL cell's remove button. */
function groupIdsFor(lines: readonly BillLineRecord[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  lines.forEach((line, index) => {
    if (line.slRowSpan > 0) {
      const members = lines.slice(index, index + line.slRowSpan).map((member) => member.id)
      for (const id of members) {
        groups.set(id, members)
      }
    }
  })
  return groups
}

/**
 * The bill as the Excel file lays it out — the preview is the file. A
 * `border-separate` table with a sticky header and a sticky total row, so the
 * figures stay in view on a long month; Trip DOs are banded so where one ends
 * reads without a heavier rule.
 */
export function BillSheet({ bill, lines, canRemove, onRemove }: BillSheetProps) {
  const groups = groupIdsFor(lines)

  return (
    <div className="relative max-h-[calc(100dvh-10rem)] min-h-[16rem] overflow-auto overscroll-x-contain">
      <table className="w-max min-w-full border-separate border-spacing-0 text-[12.5px]">
        <thead>
          <tr>
            {HEADINGS.map((heading) => (
              <th key={heading} scope="col" className={HEAD}>
                {heading}
              </th>
            ))}
            {canRemove && (
              <th scope="col" className={cn(HEAD, 'w-10')}>
                <span className="sr-only">Remove</span>
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {lines.map((line) => (
            <BillSheetRow
              key={line.id}
              line={line}
              groupLineIds={groups.get(line.id) ?? [line.id]}
              banded={line.sl % 2 === 0}
              canRemove={canRemove}
              onRemove={onRemove}
            />
          ))}
        </tbody>

        <tfoot>
          <tr>
            <td colSpan={10} className={cn(FOOT, 'pr-4 text-right tracking-wide uppercase')}>
              Total
            </td>
            <td className={cn(FOOT, 'text-[13px]')}>{bill.totalQty.toLocaleString()}</td>
            <td className={FOOT} />
            <td className={cn(FOOT, 'text-[13px] whitespace-nowrap')}>{formatAmount(bill.totalAmount)}</td>
            <td colSpan={canRemove ? 5 : 4} className={FOOT} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
