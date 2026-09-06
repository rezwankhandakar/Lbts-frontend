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
import type { LocationRecord } from '../types'

interface DeleteLocationDialogProps {
  record: LocationRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Removing a master location.
 *
 * The confirmation says what will actually happen rather than promising a
 * deletion the server may not perform: a row challans reference is
 * **deactivated** instead, and those records keep the district, thana and type
 * they read through it. That is not a compromise — deleting it would leave a
 * year of challans pointing at nothing and unable to say where they went.
 *
 * The client cannot know which of the two it will be without a count it has
 * not been given, so it does not pretend to. It states the rule, and the toast
 * afterwards says which one happened.
 */
export function DeleteLocationDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteLocationDialogProps) {
  if (!record) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Remove {record.district} / {record.thana}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            If no challan references this location it is deleted outright. If some do, it is
            deactivated instead and kept: those records read their district, thana and location
            type through it, and deleting it would leave them unable to say where they went. Either
            way it stops being offered in selectors and stops being matched to new challans.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Keep it</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? 'Removing…' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
