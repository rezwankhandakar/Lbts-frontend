import { Paperclip } from 'lucide-react'
import { BillingFlag } from '@/features/bill/components/bill-badges'
import { ProductStatusBadge } from '@/features/trip-do/components/trip-do-badges'
import { cn } from '@/lib/utils'
import { formatTripDate } from '../lib/gate-pass-meta'
import type { GatePassListRecord } from '../types'
import { GatePassActionMenu } from './gate-pass-action-menu'
import type { GatePassActions } from './gate-pass-action-menu'
import type { SheetLine } from './gate-pass-sheet'
import { GatePassStatusBadge } from './gate-pass-status-badge'

interface GatePassSheetRowProps {
  line: SheetLine
  actions: GatePassActions
  onOpen: (record: GatePassListRecord) => void
}

const CELL = 'border-r border-b border-border/50 px-2.5 py-2 align-middle whitespace-nowrap'

/** Opaque, so the pinned cells cover what scrolls under them. */
const BACKGROUND = {
  plain: 'bg-card',
  banded: 'bg-[color-mix(in_oklch,var(--card),var(--muted)_55%)]',
}

function Dash() {
  return <span className="text-muted-foreground/60">—</span>
}

function Truncated({ value, width, strong }: { value: string; width: string; strong?: boolean }) {
  if (!value) {
    return <Dash />
  }
  return (
    <span className={cn('block truncate', width, strong && 'font-medium')} title={value}>
      {value}
    </span>
  )
}

/**
 * One model on one gate pass. The trip's own fields repeat on every line, as
 * they do in a spreadsheet, so the sheet can be read — and scanned — row by
 * row. Pressing the row opens the gate pass; the actions cell does not.
 */
export function GatePassSheetRow({ line, actions, onOpen }: GatePassSheetRowProps) {
  const { record, index, banded } = line
  const item = record.items[index]
  const delivery = record.lineDelivery[index] ?? { linkedQty: 0, deliveredQty: 0, status: 'Unlinked' }

  if (!item) {
    return null
  }

  const delivered = Math.min(delivery.deliveredQty, item.qty)

  return (
    <tr
      onClick={() => onOpen(record)}
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent',
        banded ? BACKGROUND.banded : BACKGROUND.plain,
      )}
    >
      <td className={cn(CELL, 'sticky left-0 z-10 bg-inherit')}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onOpen(record)
          }}
          className="flex flex-col items-start gap-0.5 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <span className="max-w-[11rem] truncate font-mono text-[12.5px] font-semibold" title={record.tripDo}>
            {record.tripDo}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground">
            {record.gatePassId}
            {record.document && <Paperclip className="size-2.5" aria-label="Has a scanned document" />}
          </span>
        </button>
      </td>

      <td className={cn(CELL, 'tabular-nums')}>{formatTripDate(record.tripDate)}</td>

      <td className={CELL}>
        <span className="flex flex-col items-start gap-0.5">
          <ProductStatusBadge status={delivery.status} />
          {delivery.linkedQty > 0 && (
            <span className="text-[10.5px] text-muted-foreground tabular-nums">
              {delivered}/{item.qty} delivered
            </span>
          )}
        </span>
      </td>

      <td className={cn(CELL, 'font-mono text-[12px]')}>{record.csd || <Dash />}</td>
      <td className={cn(CELL, 'font-mono text-[12px]')}>{record.unit || <Dash />}</td>
      <td className={CELL}>
        <Truncated value={record.vehicleNo} width="max-w-[13rem]" />
      </td>
      <td className={CELL}>
        <Truncated value={record.customerName} width="max-w-[14rem]" strong />
      </td>
      <td className={CELL}>
        <Truncated value={item.productName} width="max-w-[12rem]" strong />
      </td>
      <td className={cn(CELL, 'font-mono text-[12px]')}>{item.model || <Dash />}</td>
      <td className={cn(CELL, 'text-right text-[13px] font-semibold tabular-nums')}>{item.qty}</td>
      <td className={CELL}>
        <span className="flex flex-col items-start gap-1">
          <GatePassStatusBadge status={record.status} />
          <BillingFlag status={record.billStatus} billNumbers={record.billNumbers} />
        </span>
      </td>

      <td
        className={cn(
          CELL,
          'sticky right-0 z-10 border-l bg-inherit py-1 text-center shadow-[-10px_0_14px_-14px_var(--foreground)]',
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <GatePassActionMenu record={record} actions={actions} />
      </td>
    </tr>
  )
}
