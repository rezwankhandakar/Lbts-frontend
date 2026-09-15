import { Ban, Check, Receipt } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { RowStatusBadge, KindTag } from '@/features/trip-do/components/trip-do-badges'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import { shortBillNumber } from '../lib/bill-meta'
import type { BillCandidateRow } from '../types'

interface CandidateRowItemProps {
  row: BillCandidateRow
  billId: string
  addable: boolean
  /** Its Trip DO is another unit's — a different reason from being billed, with a different mark. */
  blockedByUnit: boolean
  selected: boolean
  onToggle: (row: BillCandidateRow) => void
}

/**
 * One Trip DO sheet row under its Trip DO. A row that cannot be added says why
 * in place of its tick box — already on this bill, or on which other one.
 */
export function CandidateRowItem({ row, billId, addable, blockedByUnit, selected, onToggle }: CandidateRowItemProps) {
  const onThisBill = row.bill?.billId === billId

  return (
    <li
      className={cn(
        'flex items-center gap-3 px-3.5 py-2.5 text-[12.5px] transition-colors',
        addable && 'cursor-pointer hover:bg-accent/60',
        selected && 'bg-primary/5',
      )}
      onClick={addable ? () => onToggle(row) : undefined}
    >
      <span className="flex w-4 shrink-0 justify-center" onClick={(event) => event.stopPropagation()}>
        {addable ? (
          <Checkbox
            checked={selected}
            onCheckedChange={() => onToggle(row)}
            aria-label={`Add ${row.challanNumber} ${row.model || row.productName}`}
          />
        ) : onThisBill ? (
          <Check className="size-4 text-tone-emerald" aria-label="Already on this bill" />
        ) : blockedByUnit && !row.bill ? (
          <Ban className="size-3.5 text-tone-amber" aria-label="Another unit's Trip DO" />
        ) : (
          <Receipt className="size-3.5 text-muted-foreground" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="truncate font-medium">{row.customerName || '—'}</span>
          <KindTag kind={row.kind} />
        </span>
        <span className="mt-0.5 block truncate text-[11.5px] text-muted-foreground">
          SL {row.challanSlNumber} · {[row.thana, row.district].filter(Boolean).join(', ') || 'No location'}
          {row.locationType ? ` · ${row.locationType}` : ''}
        </span>
      </span>

      <span className="hidden min-w-0 flex-col items-end sm:flex">
        <span className="max-w-[11rem] truncate font-mono text-[12px]">{row.model || row.productName}</span>
        <span className="max-w-[11rem] truncate text-[11px] text-muted-foreground">{row.productName}</span>
      </span>

      <span className="w-20 shrink-0 text-right">
        <span className="block font-semibold tabular-nums">{row.qty} pcs</span>
        <span className="block text-[11px] text-muted-foreground tabular-nums">{formatTaka(row.amount)}</span>
      </span>

      <span className="hidden w-28 shrink-0 justify-end md:flex">
        {row.bill ? (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-semibold',
              onThisBill
                ? 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald'
                : 'border-border bg-muted text-muted-foreground',
            )}
            title={onThisBill ? 'Already on this bill' : `On ${row.bill.billNumber}`}
          >
            {onThisBill ? 'On this bill' : shortBillNumber(row.bill.billNumber)}
          </span>
        ) : (
          <RowStatusBadge status={row.deliveryStatus} />
        )}
      </span>
    </li>
  )
}
