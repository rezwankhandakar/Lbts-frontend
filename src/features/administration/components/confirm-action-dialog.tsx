import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { USER_ACTIONS } from '../administration-actions'
import type { UserActionId } from '../administration-actions'
import type { AdminUser } from '../types'

interface ConfirmActionDialogProps {
  user: AdminUser | null
  action: UserActionId | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (note: string) => void
}

/**
 * One dialog for every lifecycle action. Each says what will happen, to whom,
 * and what it costs — the three things an operator needs before an action that
 * takes someone's access away.
 *
 * Only delete gets the destructive button. Painting every confirmation red
 * teaches people to click through red buttons.
 */
export function ConfirmActionDialog({
  user,
  action,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: ConfirmActionDialogProps) {
  const [note, setNote] = useState('')

  // Reset between openings so a reason typed for one account cannot follow the
  // operator to the next one. Adjusted during render rather than in an effect —
  // the same pattern as app-layout.tsx.
  const [session, setSession] = useState<string | null>(null)
  const currentSession = open ? `${user?.id ?? ''}:${action ?? ''}` : null
  if (currentSession !== session) {
    setSession(currentSession)
    setNote('')
  }

  if (!user || !action) {
    return null
  }

  const definition = USER_ACTIONS[action]
  const Icon = definition.icon

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogMedia
            className={cn(
              definition.destructive ? 'bg-destructive/10 text-destructive' : 'bg-muted',
            )}
          >
            <Icon
              className={definition.destructive ? undefined : 'text-muted-foreground'}
              aria-hidden
            />
          </AlertDialogMedia>
          <AlertDialogTitle>{definition.title}</AlertDialogTitle>
          <AlertDialogDescription>{definition.body(user.name)}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2 text-[13px]">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>

        {definition.notable && (
          <div className="space-y-1.5">
            <Label htmlFor="action-note" className="text-xs text-muted-foreground">
              Reason (optional)
            </Label>
            <Textarea
              id="action-note"
              value={note}
              maxLength={240}
              rows={2}
              placeholder="Recorded on the account, visible to administrators."
              onChange={(event) => setNote(event.target.value)}
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={definition.destructive ? 'destructive' : 'default'}
            disabled={isPending}
            onClick={() => onConfirm(note.trim())}
          >
            {isPending ? 'Working…' : definition.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
