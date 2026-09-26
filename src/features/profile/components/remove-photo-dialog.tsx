import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useT } from '@/lib/i18n'

interface RemovePhotoDialogProps {
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Removing the photo deletes the stored image for good, so it is confirmed
 * rather than taken on one click — the same treatment administration gives an
 * action that cannot be undone. The dialog closes only once the request has
 * actually succeeded, so a failure leaves the user looking at the error rather
 * than at an avatar that quietly did not change.
 */
export function RemovePhotoDialog({
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: RemovePhotoDialogProps) {
  const t = useT()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive">
            <Trash2 aria-hidden />
          </AlertDialogMedia>
          <AlertDialogTitle>{t('profile.photo.removeTitle')}</AlertDialogTitle>
          <AlertDialogDescription>{t('profile.photo.removeBody')}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending ? t('profile.photo.removing') : t('profile.photo.removeConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
