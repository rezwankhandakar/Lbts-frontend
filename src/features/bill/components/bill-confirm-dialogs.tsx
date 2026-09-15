import type { ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { BillRecord } from '../types'
import type { RemoveTarget } from './bill-sheet-row'

interface ConfirmProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel: string
  pendingLabel: string
  isPending: boolean
  destructive?: boolean
  onCancel: () => void
  onConfirm: () => void
}

function Confirm({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  destructive = false,
  onCancel,
  onConfirm,
}: ConfirmProps) {
  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !isPending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={cn(destructive && 'bg-destructive/10 text-destructive hover:bg-destructive/20')}
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface BillDialogProps {
  bill: BillRecord
  open: boolean
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Signing a bill off. Reads back the figure being signed, and what is missing from it. */
export function FinalizeBillDialog({ bill, ...props }: BillDialogProps) {
  return (
    <Confirm
      {...props}
      title={`Finalize ${bill.billNumber}?`}
      confirmLabel="Finalize bill"
      pendingLabel="Finalizing…"
      description={
        <>
          {formatTaka(bill.totalAmount)} for {bill.tripDoCount} Trip DO ({bill.lineCount} rows, {bill.totalQty} pcs),
          unit {bill.unit}, {bill.periodLabel}. Once finalized, rows cannot be added or taken off until an Admin or
          Manager reopens it.
          {bill.unpricedLines > 0 &&
            ` ${bill.unpricedLines} ${bill.unpricedLines === 1 ? 'row has' : 'rows have'} no rate and add nothing to the total.`}
        </>
      }
    />
  )
}

export function ReopenBillDialog({ bill, ...props }: BillDialogProps) {
  return (
    <Confirm
      {...props}
      title={`Reopen ${bill.billNumber}?`}
      confirmLabel="Reopen as draft"
      pendingLabel="Reopening…"
      description="It becomes a draft again, so rows can be added, taken off and refreshed from the Trip DO sheet. If the finalized file has already been sent, whoever received it will need the corrected one."
    />
  )
}

export function DeleteBillDialog({ bill, ...props }: BillDialogProps) {
  return (
    <Confirm
      {...props}
      destructive
      title={`Delete ${bill.billNumber}?`}
      confirmLabel="Delete bill"
      pendingLabel="Deleting…"
      description={`Its ${bill.lineCount} ${bill.lineCount === 1 ? 'row goes' : 'rows go'} back to the Trip DO sheet unbilled, and the challans and gate passes behind them are marked accordingly. The bill number is not reused.`}
    />
  )
}

interface RemoveLinesDialogProps {
  target: RemoveTarget | null
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RemoveLinesDialog({ target, ...props }: RemoveLinesDialogProps) {
  const count = target?.lineIds.length ?? 0
  return (
    <Confirm
      {...props}
      open={target !== null}
      destructive
      title={`Take ${target?.label ?? 'these rows'} off the bill?`}
      confirmLabel={count === 1 ? 'Take row off' : `Take ${count} rows off`}
      pendingLabel="Taking off…"
      description={`${count} ${count === 1 ? 'row goes' : 'rows go'} back to the Trip DO sheet unbilled, free to add to this bill again or to another.`}
    />
  )
}
