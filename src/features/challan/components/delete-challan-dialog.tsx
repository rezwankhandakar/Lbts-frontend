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
  if (!record) {
    return null
  }

  const range = formatRange({
    startPage: record.sourcePageStart,
    endPage: record.sourcePageEnd,
  })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {record.challanNumber}?</AlertDialogTitle>
          <AlertDialogDescription>
            This challan and its generated PDF are removed permanently, and SL {record.slNumber} is
            not reissued. {range} of {record.sourceFileName} become unassigned again, so the batch
            they came from re-opens and can no longer be downloaded as a finished set. This cannot
            be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? 'Deleting…' : 'Delete challan'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
