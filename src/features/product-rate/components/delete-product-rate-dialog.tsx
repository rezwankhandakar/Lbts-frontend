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
import { productRateLabel } from '../hooks/use-product-rates'
import type { ProductRateRecord } from '../types'

interface DeleteProductRateDialogProps {
  record: ProductRateRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Removing a rate card row.
 *
 * The confirmation says what will actually happen rather than promising a
 * deletion the server may not perform: a row challans were charged from is
 * **deactivated** instead and kept.
 *
 * The reason is worth stating, because it is not the one people expect.
 * Deleting the row would not change a single figure on a single challan —
 * those were copied onto the records when they were charged. What it would
 * delete is the answer to "where did this figure come from", which is the only
 * question anybody asks about a charge they disagree with.
 *
 * The client cannot know which of the two it will be without a count it has
 * not been given, so it does not pretend to. It states the rule, and the toast
 * afterwards says which one happened.
 */
export function DeleteProductRateDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: DeleteProductRateDialogProps) {
  if (!record) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {productRateLabel(record)}?</AlertDialogTitle>
          <AlertDialogDescription>
            If no challan was ever charged from this row it is deleted outright. If some were, it is
            deactivated instead and kept: their figures do not change either way, but the row is
            what says where those figures came from. Either way it stops pricing new challans and
            stops being offered as a product suggestion.
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
