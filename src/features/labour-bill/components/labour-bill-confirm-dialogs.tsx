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
import { formatNumber, formatTaka } from '@/lib/format'
import { useT } from '@/lib/i18n'
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
  const t = useT()

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !isPending && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.actions.cancel')}</AlertDialogCancel>
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

/**
 * Signing a labour bill off. Reads back the figure being claimed, and what is
 * still blank.
 *
 * Each sentence is one message rather than a run of JSX fragments: the order
 * of "for three rows across two CSDs in September" is English's, and a Bangla
 * reader needs the period in front of the count rather than behind it. Nothing
 * here can be stitched together in the component and still come out right.
 */
export function FinalizeLabourBillDialog({
  bill,
  pendingLines,
  sections,
  ...props
}: LabourBillDialogProps & { pendingLines: number; sections: number }) {
  const t = useT()

  const warnings = [
    bill.unpricedLines > 0
      ? t('labourBill.confirm.finalizeUnpriced', {
          count: bill.unpricedLines,
          n: formatNumber(bill.unpricedLines),
        })
      : '',
    pendingLines > 0
      ? t('labourBill.confirm.finalizePending', {
          count: pendingLines,
          n: formatNumber(pendingLines),
        })
      : '',
  ].filter(Boolean)

  return (
    <Confirm
      {...props}
      title={t('labourBill.confirm.finalizeTitle', { bill: bill.billNumber })}
      confirmLabel={t('labourBill.confirm.finalize')}
      pendingLabel={t('labourBill.actions.finalizing')}
      description={[
        t('labourBill.confirm.finalizeBody', {
          amount: formatTaka(bill.totalAmount),
          rows: rowsAndChallans(bill.lineCount, bill.challanCount, t),
          sections: t('labourBill.stats.acrossCsds', {
            count: sections,
            n: formatNumber(sections),
            period: bill.periodLabel,
          }),
          labour: formatTaka(bill.labourTotal),
          floor: formatTaka(bill.floorTotal),
        }),
        ...warnings,
      ].join(' ')}
    />
  )
}

export function ReopenLabourBillDialog({ bill, ...props }: LabourBillDialogProps) {
  const t = useT()

  return (
    <Confirm
      {...props}
      title={t('labourBill.confirm.reopenTitle', { bill: bill.billNumber })}
      confirmLabel={t('labourBill.confirm.reopen')}
      pendingLabel={t('labourBill.actions.reopening')}
      description={t('labourBill.confirm.reopenDescription')}
    />
  )
}

export function DeleteLabourBillDialog({ bill, ...props }: LabourBillDialogProps) {
  const t = useT()

  return (
    <Confirm
      {...props}
      destructive
      title={t('labourBill.confirm.deleteTitle', { bill: bill.billNumber })}
      confirmLabel={t('labourBill.confirm.deleteBill')}
      pendingLabel={t('labourBill.actions.deleting')}
      description={t('labourBill.confirm.deleteDescription', {
        count: bill.lineCount,
        n: formatNumber(bill.lineCount),
      })}
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
  const t = useT()

  const count = target?.lineIds.length ?? 0
  return (
    <Confirm
      {...props}
      open={target !== null}
      destructive
      title={t('labourBill.confirm.removeTitle', {
        label: target?.label ?? t('labourBill.cells.theseRows'),
      })}
      confirmLabel={
        count === 1
          ? t('labourBill.confirm.takeRowOff')
          : t('labourBill.confirm.takeRowsOff', { count: formatNumber(count) })
      }
      pendingLabel={t('labourBill.actions.takingOff')}
      description={t('labourBill.confirm.removeDescription', {
        count,
        n: formatNumber(count),
      })}
    />
  )
}
