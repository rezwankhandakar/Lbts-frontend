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

interface DeleteDraftDialogProps {
  record: GatePassRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * The one destructive action in the module, and the only one that gets a
 * confirmation.
 *
 * Only a draft can be deleted — anything submitted is cancelled instead, so it
 * stays on the record. That is why this is the sole place a gate pass really
 * disappears, and the only place a confirmation earns its interruption.
 */
export function DeleteDraftDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteDraftDialogProps) {
  if (!record) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {record.gatePassId}?</AlertDialogTitle>
          <AlertDialogDescription>
            This draft and its scanned document are removed permanently. Nothing that has been
            submitted is affected.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? 'Deleting…' : 'Delete draft'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
