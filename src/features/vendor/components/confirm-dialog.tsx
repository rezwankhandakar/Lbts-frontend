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
import { useT } from '@/lib/i18n'

interface ConfirmDialogProps {
  open: boolean
  isPending: boolean
  title: string
  /**
   * What will actually happen — not "are you sure". A confirmation that only
   * asks for reassurance teaches people to press through it; one that states a
   * consequence is one they read.
   */
  description: ReactNode
  confirmLabel: string
  pendingLabel: string
  /** Defaults to "Cancel"; a removal says what happens if you do not. */
  cancelLabel?: string
  /** Destructive by default, since that is what most of these guard. */
  tone?: 'destructive' | 'neutral'
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * The shared confirmation for anything in this module that cannot simply be
 * pressed again.
 *
 * A real dialog rather than `window.confirm`, which cannot be styled, cannot
 * carry a consequence and traps the tab on some platforms — and the same Base
 * UI alert dialog the rest of the app uses, so focus management and the escape
 * key behave the way they do everywhere else.
 */
export function ConfirmDialog({
  open,
  isPending,
  title,
  description,
  confirmLabel,
  pendingLabel,
  cancelLabel,
  tone = 'destructive',
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  const t = useT()

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel ?? t('common.actions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className={
              tone === 'destructive'
                ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                : undefined
            }
          >
            {isPending ? pendingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
