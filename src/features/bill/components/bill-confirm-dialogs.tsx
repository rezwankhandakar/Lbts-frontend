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

interface BillDialogProps {
  bill: BillRecord
  open: boolean
  isPending: boolean
  onCancel: () => void
  onConfirm: () => void
}

/** Signing a bill off. Reads back the figure being signed, and what is missing from it. */
export function FinalizeBillDialog({ bill, ...props }: BillDialogProps) {
  const t = useT()

  return (
    <Confirm
      {...props}
      title={t('bill.confirm.finalizeTitle', { bill: bill.billNumber })}
      confirmLabel={t('bill.confirm.finalize')}
      pendingLabel={t('bill.actions.finalizing')}
      description={[
        t('bill.confirm.finalizeBody', {
          amount: formatTaka(bill.totalAmount),
          tripDos: t('bill.stats.tripDoCount', {
            count: bill.tripDoCount,
            n: formatNumber(bill.tripDoCount),
          }),
          rows: t('common.pagination.rows', {
            count: bill.lineCount,
            n: formatNumber(bill.lineCount),
          }),
          pcs: t('bill.stats.piecesCount', {
            count: bill.totalQty,
            n: formatNumber(bill.totalQty),
          }),
          unit: bill.unit,
          period: bill.periodLabel,
        }),
        bill.unpricedLines > 0
          ? t('bill.confirm.unpricedNote', {
              count: bill.unpricedLines,
              n: formatNumber(bill.unpricedLines),
            })
          : '',
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}

export function ReopenBillDialog({ bill, ...props }: BillDialogProps) {
  const t = useT()

  return (
    <Confirm
      {...props}
      title={t('bill.confirm.reopenTitle', { bill: bill.billNumber })}
      confirmLabel={t('bill.confirm.reopen')}
      pendingLabel={t('bill.actions.reopening')}
      description={t('bill.actions.reopenDescription')}
    />
  )
}

export function DeleteBillDialog({ bill, ...props }: BillDialogProps) {
  const t = useT()

  return (
    <Confirm
      {...props}
      destructive
      title={t('bill.confirm.deleteTitle', { bill: bill.billNumber })}
      confirmLabel={t('bill.confirm.deleteBill')}
      pendingLabel={t('bill.actions.deleting')}
      description={t('bill.confirm.deleteDescription', {
        count: bill.lineCount,
        n: formatNumber(bill.lineCount),
      })}
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
  const t = useT()

  const count = target?.lineIds.length ?? 0
  return (
    <Confirm
      {...props}
      open={target !== null}
      destructive
      title={t('bill.confirm.removeTitle', {
        label: target?.label ?? t('bill.confirm.theseRows'),
      })}
      confirmLabel={
        count === 1
          ? t('bill.confirm.takeRowOff')
          : t('bill.confirm.takeRowsOff', { count: formatNumber(count) })
      }
      pendingLabel={t('bill.actions.takingOff')}
      description={t('bill.confirm.removeDescription', { count, n: formatNumber(count) })}
    />
  )
}
