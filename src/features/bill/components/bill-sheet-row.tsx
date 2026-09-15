import { CircleOff, TriangleAlert, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { rateDescription, rateLabel } from '@/features/product-rate/lib/rate-format'
import { KindTag } from '@/features/trip-do/components/trip-do-badges'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { formatAmount } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BillLineRecord } from '../types'

export interface RemoveTarget {
  lineIds: string[]
  label: string
}

interface BillSheetRowProps {
  line: BillLineRecord
  /** Every line of this row's Trip DO, for the SL cell's remove button. */
  groupLineIds: string[]
  banded: boolean
  canRemove: boolean
  onRemove: (target: RemoveTarget) => void
}

export const CELL = 'border-r border-b border-border/60 px-2.5 py-2 text-center align-middle'

function Dash() {
  return <span className="text-muted-foreground/60">—</span>
}

/** A row whose sheet row moved, or is gone, carries a mark beside its customer. */
function DriftMark({ drift }: { drift: BillLineRecord['drift'] }) {
  if (drift === 'none') {
    return null
  }
  return drift === 'changed' ? (
    <TriangleAlert className="size-3.5 shrink-0 text-tone-amber" aria-label="Changed on the Trip DO sheet since it was added" />
  ) : (
    <CircleOff className="size-3.5 shrink-0 text-tone-rose" aria-label="No longer on the Trip DO sheet" />
  )
}

/**
 * One row of the bill, column for column as the Excel file prints it. The SL
 * cell is drawn once per Trip DO and spans its rows, so the screen and the file
 * can never disagree about which rows share a number.
 */
export function BillSheetRow({ line, groupLineIds, banded, canRemove, onRemove }: BillSheetRowProps) {
  return (
    <tr
      className={cn(
        'transition-colors hover:bg-accent/50',
        banded ? 'bg-[color-mix(in_oklch,var(--card),var(--muted)_50%)]' : 'bg-card',
        line.drift !== 'none' && 'shadow-[inset_3px_0_0_var(--tone-amber)]',
      )}
    >
      {line.slRowSpan > 0 && (
        <td
          rowSpan={line.slRowSpan}
          className={cn(CELL, 'group/sl relative w-14 bg-inherit text-[15px] font-semibold tabular-nums')}
        >
          {line.sl}
          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove({ lineIds: groupLineIds, label: `Trip DO ${line.tripDo}` })}
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-md text-muted-foreground opacity-0 transition group-hover/sl:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
              aria-label={`Take Trip DO ${line.tripDo} off the bill`}
              title={`Take Trip DO ${line.tripDo} off the bill`}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </td>
      )}

      <td className={cn(CELL, 'min-w-[10rem] font-medium')}>
        <span className="inline-flex items-center justify-center gap-1.5">
          <DriftMark drift={line.drift} />
          {line.customerName || <Dash />}
        </span>
      </td>
      <td className={cn(CELL, 'font-mono text-[12px] whitespace-nowrap')}>{line.csd || <Dash />}</td>
      <td className={cn(CELL, 'font-mono whitespace-nowrap tabular-nums')}>{line.receiverMobile || <Dash />}</td>
      <td className={cn(CELL, 'min-w-[16rem] max-w-[22rem] leading-snug text-pretty text-muted-foreground')}>
        {line.deliveryAddress || <Dash />}
      </td>
      <td className={cn(CELL, 'whitespace-nowrap')}>{line.district || <Dash />}</td>
      <td className={cn(CELL, 'whitespace-nowrap')}>{line.thana || <Dash />}</td>
      <td className={cn(CELL, 'whitespace-nowrap')}>
        {line.locationType ? (
          <span className="rounded-md border bg-background px-1.5 py-px font-mono text-[11px]">{line.locationType}</span>
        ) : (
          <span className="text-[11px] font-medium text-tone-amber">Pending</span>
        )}
      </td>
      <td className={cn(CELL, 'font-mono text-[12px]')}>{line.unit || <Dash />}</td>
      <td className={cn(CELL, 'font-mono text-[12px] whitespace-nowrap')}>{line.model || <Dash />}</td>
      <td className={cn(CELL, 'text-[13px] font-semibold tabular-nums')}>{line.qty}</td>
      <td className={cn(CELL, 'whitespace-nowrap tabular-nums')} title={rateDescription(line.rate)}>
        {line.rate ? rateLabel(line.rate) : <Dash />}
      </td>
      <td className={cn(CELL, 'font-semibold whitespace-nowrap tabular-nums')}>
        {line.amount === null ? (
          <span className="text-tone-amber" title="No rate on the card for this line, so it adds nothing">
            —
          </span>
        ) : (
          formatAmount(line.amount)
        )}
      </td>
      <td className={cn(CELL, 'whitespace-nowrap')}>{line.productName}</td>
      <td className={cn(CELL, 'font-mono text-[12px] font-semibold whitespace-nowrap')}>
        <Link
          to={`/trip-do?q=${encodeURIComponent(line.tripDo)}`}
          className="hover:text-primary hover:underline"
          title={`${line.gatePassNumber} · ${formatTripDate(line.tripDate)} · ${line.challanNumber}`}
        >
          {line.tripDo}
        </Link>
      </td>
      <td className={cn(CELL, 'min-w-[9rem] text-muted-foreground')}>{line.capacity || <Dash />}</td>
      <td className={cn(CELL, 'whitespace-nowrap')}>
        {line.kind === 'Order' ? <span className="sr-only">None</span> : <KindTag kind={line.kind} />}
      </td>

      {canRemove && (
        <td className={cn(CELL, 'px-1')}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove({ lineIds: [line.id], label: `${line.challanNumber} · ${line.model || line.productName}` })}
            aria-label={`Take ${line.challanNumber} ${line.model} off the bill`}
            className="text-muted-foreground hover:text-destructive"
          >
            <X aria-hidden />
          </Button>
        </td>
      )}
    </tr>
  )
}
