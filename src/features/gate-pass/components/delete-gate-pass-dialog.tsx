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
import type { GatePassRecord } from '../types'

interface DeleteGatePassDialogProps {
  record: GatePassRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * The one destructive action in the module.
 *
 * Deleting is how a gate pass is withdrawn — there is no cancelled status to
 * park a mistake in. That makes this the only place a gate pass really
 * disappears, and the only place a confirmation is protecting something rather
 * than reading it back, as the export one does.
 *
 * A draft is unfinished work, and removing one costs nobody anything. A record
 * that has been submitted is already part of what the operation reports on, so
 * it is named as such rather than swept away under the same sentence.
 */
export function DeleteGatePassDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteGatePassDialogProps) {
  if (!record) {
    return null
  }

  const isDraft = record.status === 'Draft'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {record.gatePassId}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isDraft
              ? 'This draft and its scanned document are removed permanently. Nothing that has been submitted is affected.'
              : `This ${record.status.toLowerCase()} gate pass and its scanned document are removed permanently, and it leaves every list and count it appears in. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? 'Deleting…' : isDraft ? 'Delete draft' : 'Delete gate pass'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
