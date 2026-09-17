import { FileSpreadsheet, Loader2, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { FinalBillSlot } from '../types'

interface FinalBillSlotPanelProps {
  slot: FinalBillSlot | undefined
  isFetching: boolean
  finalAmount: number | null
  /** The bill being corrected, which is not a clash with itself. */
  editingId: string | null
}

/**
 * What the office asked Walton for, beside what Walton approved. The Excel
 * bills for the same unit and month are read live, so the difference the
 * audit made is on screen while the final figure is typed.
 */
export function FinalBillSlotPanel({ slot, isFetching, finalAmount, editingId }: FinalBillSlotPanelProps) {
  if (!slot) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-xs text-muted-foreground">
        {isFetching ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <FileSpreadsheet className="size-3.5" aria-hidden />}
        {isFetching ? 'Looking up the Excel bills…' : 'Enter the unit to see its Excel bills for the month.'}
      </div>
    )
  }

  const clash = slot.existing && slot.existing.id !== editingId ? slot.existing : null
  const difference = finalAmount === null ? null : finalAmount - slot.submittedAmount

  return (
    <div className="grid gap-2 rounded-lg border bg-muted/20 p-3">
      {clash && (
        <p className="flex items-start gap-2 rounded-md bg-tone-rose/10 px-2.5 py-2 text-xs text-tone-rose">
          <TriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden />A final bill of {taka(clash.finalAmount)} is already
          entered for this unit and month. Edit that one instead.
        </p>
      )}

      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted-foreground">Excel bills submitted</span>
        <span className="font-semibold tabular-nums">{slot.excelBills.length > 0 ? taka(slot.submittedAmount) : 'None'}</span>
      </div>

      {slot.excelBills.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {slot.excelBills.map((bill) => (
            <li key={bill.id}>
              <Link
                to={`/bills/${bill.id}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2 py-0.5 font-mono text-[11px] hover:border-primary/40"
              >
                {bill.billNumber}
                <span className="font-sans text-muted-foreground">
                  {taka(bill.totalAmount)} · {bill.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {difference !== null && slot.excelBills.length > 0 && (
        <div className="flex items-center justify-between gap-3 border-t pt-2 text-xs">
          <span className="text-muted-foreground">Audit difference</span>
          <span className={cn('font-semibold tabular-nums', difference < 0 ? 'text-tone-rose' : difference > 0 ? 'text-tone-emerald' : '')}>
            {difference === 0 ? 'No change' : signedTaka(difference)}
          </span>
        </div>
      )}
    </div>
  )
}
