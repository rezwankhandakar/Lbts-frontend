import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { formatRangeShort, itemSummary } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanActionMenu } from './challan-action-menu'
import type { ChallanActions } from './challan-action-menu'
import { ChallanStatusBadge } from './challan-status-badge'

interface ChallanTableProps {
  records: ChallanRecord[]
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

const HEAD = 'h-10 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase'

/**
 * The desktop view (md and up); below that the directory swaps to cards rather
 * than squashing eleven columns into a phone.
 *
 * Columns drop out as the viewport narrows instead of the table scrolling by
 * default: the product and model fold into the challan cell below xl, the
 * creator and district go below lg. The container still scrolls horizontally
 * as a last resort.
 */
export function ChallanTable({ records, actions, onOpen }: ChallanTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className={cn(HEAD, 'text-right')}>SL</TableHead>
          <TableHead className={HEAD}>Challan</TableHead>
          <TableHead className={HEAD}>Customer</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell')}>District</TableHead>
          <TableHead className={cn(HEAD, 'hidden xl:table-cell')}>Product</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell text-right')}>Qty</TableHead>
          <TableHead className={HEAD}>Status</TableHead>
          <TableHead className={cn(HEAD, 'hidden xl:table-cell')}>Filed</TableHead>
          <TableHead className={cn(HEAD, 'text-right')}>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {records.map((record) => (
          <TableRow
            key={record.id}
            onClick={() => onOpen(record)}
            className="cursor-pointer transition-colors duration-150 hover:bg-primary/[0.035]"
          >
            <TableCell className="px-4 py-3 text-right text-[13px] font-semibold tabular-nums">
              {record.slNumber}
            </TableCell>

            <TableCell className="px-4 py-3">
              {/* The button is what makes the row reachable by keyboard; the
                  row-level click is a mouse convenience on top of it. */}
              <button
                type="button"
                className="block max-w-[18rem] rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpen(record)
                }}
              >
                <span className="block text-[13px] font-semibold">{record.challanNumber}</span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {record.sourceFileName} · p{' '}
                  {formatRangeShort({
                    startPage: record.sourcePageStart,
                    endPage: record.sourcePageEnd,
                  })}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground xl:hidden">
                  {itemSummary(record)} × {record.totalQty}
                </span>
              </button>
            </TableCell>

            <TableCell className="max-w-[15rem] px-4 py-3 text-[13px]">
              <span className="block truncate">{record.customerName}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {record.thana}
                {record.receiverMobile ? ` · ${record.receiverMobile}` : ''}
              </span>
            </TableCell>

            <TableCell className="hidden max-w-[10rem] truncate px-4 py-3 text-[13px] text-muted-foreground lg:table-cell">
              {record.district}
            </TableCell>

            <TableCell className="hidden max-w-[14rem] px-4 py-3 text-[13px] xl:table-cell">
              <span className="block truncate">{record.items[0]?.productName ?? '—'}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {record.items[0]?.model ?? ''}
                {record.items.length > 1 ? ` +${record.items.length - 1} more` : ''}
              </span>
            </TableCell>

            <TableCell className="hidden px-4 py-3 text-right text-[13px] tabular-nums lg:table-cell">
              {record.totalQty}
            </TableCell>

            <TableCell className="px-4 py-3">
              <ChallanStatusBadge status={record.status} />
            </TableCell>

            <TableCell className="hidden px-4 py-3 text-[13px] whitespace-nowrap text-muted-foreground xl:table-cell">
              <span className="block">{formatDate(record.submittedAt)}</span>
              <span className="block truncate text-xs">
                {record.submittedBy?.name ?? record.createdBy?.name ?? '—'}
              </span>
            </TableCell>

            <TableCell
              className="px-4 py-3 text-right"
              onClick={(event) => event.stopPropagation()}
            >
              <ChallanActionMenu record={record} actions={actions} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
