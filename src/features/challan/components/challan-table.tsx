import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/lib/format'
import { itemSummary, shortChallanNumber } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'
import { ChallanActionMenu } from './challan-action-menu'
import type { ChallanActions } from './challan-action-menu'
import { DeliveryStatusCell, RecordStatusCell } from './challan-table-cells'

interface ChallanTableProps {
  records: ChallanRecord[]
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

const HEAD =
  'h-10 px-4 text-[11px] font-medium tracking-wider text-muted-foreground uppercase first:pl-5 last:pr-5'
const CELL = 'px-4 py-3.5 align-top first:pl-5 last:pr-5'

/**
 * The desktop view (md and up); below that the directory swaps to cards.
 *
 * The SL is the row's identifier, with the tail of the challan number beneath
 * it for somebody reading one off a back page. District / Thana, product, qty
 * and amount drop out below lg; the product folds into the customer cell there.
 */
export function ChallanTable({ records, actions, onOpen }: ChallanTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30 hover:bg-muted/30">
          <TableHead className={HEAD}>SL</TableHead>
          <TableHead className={HEAD}>Customer</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell')}>Location</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell')}>Product</TableHead>
          <TableHead className={cn(HEAD, 'hidden text-right lg:table-cell')}>Qty</TableHead>
          <TableHead className={cn(HEAD, 'hidden text-right lg:table-cell')}>Amount</TableHead>
          <TableHead className={HEAD}>Delivery</TableHead>
          <TableHead className={HEAD}>Status</TableHead>
          <TableHead className={cn(HEAD, 'w-12 text-right')}>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {records.map((record) => (
          <TableRow
            key={record.id}
            onClick={() => onOpen(record)}
            className="cursor-pointer transition-colors duration-150 hover:bg-muted/40"
          >
            <TableCell className={CELL}>
              {/* The button is what makes the row reachable by keyboard; the
                  row-level click is a mouse convenience on top of it. */}
              <button
                type="button"
                title={record.challanNumber}
                className="rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={(event) => {
                  event.stopPropagation()
                  onOpen(record)
                }}
              >
                <span className="block text-sm font-semibold tabular-nums">{record.slNumber}</span>
                <span className="mt-0.5 block font-mono text-[11px] whitespace-nowrap text-muted-foreground">
                  {shortChallanNumber(record.challanNumber)}
                </span>
              </button>
            </TableCell>

            <TableCell className={cn(CELL, 'max-w-[15rem]')}>
              <span className="block truncate text-sm font-medium">{record.customerName}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground tabular-nums">
                {record.receiverMobile || '—'}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground lg:hidden">
                {itemSummary(record)} × {record.totalQty}
              </span>
            </TableCell>

            {/* The resolved location where there is one, the transcribed text
                otherwise: the resolved one is what a report groups by. */}
            <TableCell className={cn(CELL, 'hidden max-w-[11rem] lg:table-cell')}>
              <span className="block truncate text-sm">
                {record.resolvedLocation?.district || record.district || '—'}
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {record.resolvedLocation?.thana || record.thana || '—'}
              </span>
            </TableCell>

            <TableCell className={cn(CELL, 'hidden max-w-[14rem] lg:table-cell')}>
              <span className="block truncate text-sm">{record.items[0]?.productName ?? '—'}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                {record.items[0]?.model ?? ''}
                {record.items.length > 1 && (
                  <span className="ml-1 rounded bg-muted px-1 py-px text-[10px] font-medium">
                    +{record.items.length - 1}
                  </span>
                )}
              </span>
            </TableCell>

            <TableCell className={cn(CELL, 'hidden text-right text-sm tabular-nums lg:table-cell')}>
              {record.totalQty}
            </TableCell>

            {/* A charge that does not cover every line is marked: a partial
                total looks exactly like a complete one. */}
            <TableCell
              className={cn(CELL, 'hidden text-right text-sm tabular-nums lg:table-cell')}
              title={
                record.unpricedItems > 0
                  ? `${record.unpricedItems} of ${record.items.length} lines are not on the rate card for this location.`
                  : undefined
              }
            >
              {record.totalAmount === null ? (
                <span className="text-muted-foreground">—</span>
              ) : (
                <span className="font-medium">
                  <span className="mr-0.5 text-xs font-normal text-muted-foreground">৳</span>
                  {formatAmount(record.totalAmount)}
                  {record.unpricedItems > 0 && (
                    <span className="ml-0.5 text-tone-amber" aria-hidden>
                      *
                    </span>
                  )}
                </span>
              )}
            </TableCell>

            <TableCell className={CELL}>
              <DeliveryStatusCell record={record} />
            </TableCell>

            <TableCell className={CELL}>
              <RecordStatusCell record={record} />
            </TableCell>

            <TableCell
              className={cn(CELL, 'text-right')}
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
