import { Paperclip } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatTripDate, itemSummary } from '../lib/gate-pass-meta'
import type { GatePassRecord } from '../types'
import { GatePassActionMenu } from './gate-pass-action-menu'
import type { GatePassActions } from './gate-pass-action-menu'
import { GatePassStatusBadge } from './gate-pass-status-badge'

interface GatePassTableProps {
  records: GatePassRecord[]
  actions: GatePassActions
  onOpen: (record: GatePassRecord) => void
}

const HEAD = 'h-10 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase'

/**
 * The desktop view (md and up); below that the directory swaps to cards rather
 * than squashing eleven columns into a phone.
 *
 * Columns drop out as the viewport narrows instead of the table scrolling by
 * default: the product and model fold into the gate pass cell below xl, the
 * creator and quantity go below lg. The container still scrolls horizontally
 * as a last resort.
 */
export function GatePassTable({ records, actions, onOpen }: GatePassTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className={HEAD}>Gate pass</TableHead>
          <TableHead className={HEAD}>Trip date</TableHead>
          <TableHead className={HEAD}>Customer</TableHead>
          <TableHead className={cn(HEAD, 'hidden xl:table-cell')}>Vehicle</TableHead>
          <TableHead className={cn(HEAD, 'hidden xl:table-cell')}>Product</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell text-right')}>Qty</TableHead>
          <TableHead className={HEAD}>Status</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell')}>Created by</TableHead>
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
                <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                  {record.gatePassId}
                  {record.document && (
                    <Paperclip
                      className="size-3 text-muted-foreground"
                      aria-label="Has a scanned document"
                    />
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  DO {record.tripDo} · {record.csd} · {record.unit}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground xl:hidden">
                  {itemSummary(record)}
                </span>
              </button>
            </TableCell>

            <TableCell className="px-4 py-3 text-[13px] whitespace-nowrap">
              {formatTripDate(record.tripDate)}
            </TableCell>

            <TableCell className="max-w-[14rem] truncate px-4 py-3 text-[13px]">
              {record.customerName}
            </TableCell>

            <TableCell className="hidden max-w-[12rem] truncate px-4 py-3 text-[13px] text-muted-foreground xl:table-cell">
              {record.vehicleNo}
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
              <GatePassStatusBadge status={record.status} />
            </TableCell>

            <TableCell className="hidden max-w-[10rem] truncate px-4 py-3 text-[13px] text-muted-foreground lg:table-cell">
              {record.createdBy?.name ?? '—'}
            </TableCell>

            <TableCell className="px-4 py-3 text-right" onClick={(event) => event.stopPropagation()}>
              <GatePassActionMenu record={record} actions={actions} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
