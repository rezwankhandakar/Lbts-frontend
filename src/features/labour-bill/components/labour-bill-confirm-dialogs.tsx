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
import { rowsAndChallans } from '../lib/labour-bill-meta'
import type { LabourBillRecord } from '../types'
import type { LabourRemoveTarget } from './labour-bill-sheet-row'

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

interface LabourBillDialogProps {
  bill: LabourBillRecord
  open: boolean
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Signing a labour bill off. Reads back the figure being claimed, and what is still blank. */
export function FinalizeLabourBillDialog({
  bill,
  pendingLines,
  sections,
  ...props
}: LabourBillDialogProps & { pendingLines: number; sections: number }) {
  return (
    <Confirm
      {...props}
      title={`Finalize ${bill.billNumber}?`}
      confirmLabel="Finalize labour bill"
      pendingLabel="Finalizing…"
      description={
        <>
          {formatTaka(bill.totalAmount)} for {rowsAndChallans(bill.lineCount, bill.challanCount)}{' '}
          across {sections} {sections === 1 ? 'CSD' : 'CSDs'} in {bill.periodLabel} —{' '}
          {formatTaka(bill.labourTotal)} Ven/Pulling/Labour and {formatTaka(bill.floorTotal)} floor.
          Once finalized, challans cannot be scanned in and amounts cannot be typed until an Admin
          or Manager reopens it.
          {bill.unpricedLines > 0 &&
            ` ${bill.unpricedLines} ${bill.unpricedLines === 1 ? 'row has' : 'rows have'} no amount at all, so this will be refused until each says what it cost — 0 where a delivery needed no help.`}
          {pendingLines > 0 &&
            ` ${pendingLines} ${pendingLines === 1 ? 'row is' : 'rows are'} still waiting for a Trip DO, so ${pendingLines === 1 ? 'it belongs' : 'they belong'} to no CSD and would be charged to nobody — this will be refused until ${pendingLines === 1 ? 'it is' : 'they are'} matched or taken off.`}
        </>
      }
    />
  )
}

export function ReopenLabourBillDialog({ bill, ...props }: LabourBillDialogProps) {
  return (
    <Confirm
      {...props}
      title={`Reopen ${bill.billNumber}?`}
      confirmLabel="Reopen as draft"
      pendingLabel="Reopening…"
      description="It becomes a draft again, so challans can be scanned in and amounts corrected. If the finalized file has already been sent, whoever received it will need the corrected one."
    />
  )
}

export function DeleteLabourBillDialog({ bill, ...props }: LabourBillDialogProps) {
  return (
    <Confirm
      {...props}
      destructive
      title={`Delete ${bill.billNumber}?`}
      confirmLabel="Delete labour bill"
      pendingLabel="Deleting…"
      description={`Its ${bill.lineCount} ${bill.lineCount === 1 ? 'row and the amount' : 'rows and the amounts'} typed into them are gone for good. Nothing on the Trip DO sheet, the challans or the gate passes changes — a labour bill claims none of them. The bill number is not reused.`}
    />
  )
}

interface RemoveLabourLinesDialogProps {
  target: LabourRemoveTarget | null
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function RemoveLabourLinesDialog({ target, ...props }: RemoveLabourLinesDialogProps) {
  const count = target?.lineIds.length ?? 0
  return (
    <Confirm
      {...props}
      open={target !== null}
      destructive
      title={`Take ${target?.label ?? 'these rows'} off the labour bill?`}
      confirmLabel={count === 1 ? 'Take row off' : `Take ${count} rows off`}
      pendingLabel="Taking off…"
      description={`${count} ${count === 1 ? 'row goes' : 'rows go'}, and any amount typed into ${count === 1 ? 'it goes' : 'them goes'} with ${count === 1 ? 'it' : 'them'}. Scanning the challan again brings the ${count === 1 ? 'row' : 'rows'} back, empty.`}
    />
  )
}
