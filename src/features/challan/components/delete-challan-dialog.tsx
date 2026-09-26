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
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { formatRange } from '../lib/challan-meta'
import type { ChallanRecord } from '../types'

interface DeleteChallanDialogProps {
  record: ChallanRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * The one destructive action in the module.
 *
 * Every challan here is a filed record with a serial, a challan number, a
 * barcode and a stored PDF that may already be printed and travelling with a
 * delivery — so this confirmation is protecting something rather than reading
 * a figure back, and it says exactly what leaves.
 *
 * The second sentence is the part operators need: deleting re-opens the batch
 * the challan came out of, because its pages become unassigned again. A batch
 * that was complete stops being downloadable as a finished set, and that is a
 * consequence somebody should meet before pressing the button rather than
 * after.
 */
export function DeleteChallanDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteChallanDialogProps) {
  const t = useT()

  if (!record) {
    return null
  }

  const range = formatRange(
    {
      startPage: record.sourcePageStart,
      endPage: record.sourcePageEnd,
    },
    t,
  )

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('challan.remove.title', { challan: record.challanNumber })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t('challan.remove.body', {
              sl: formatNumber(record.slNumber),
              range,
              file: record.sourceFileName,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('challan.remove.keepIt')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? t('challan.remove.deleting') : t('challan.remove.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
