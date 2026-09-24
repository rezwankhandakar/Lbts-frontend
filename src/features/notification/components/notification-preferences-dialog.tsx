import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  useNotificationPreferences,
  useSaveNotificationPreferences,
} from '../hooks/use-notifications'
import { NOTIFICATION_CATEGORIES } from '../types'
import type { NotificationCategory } from '../types'
import { NotificationPreferenceRow } from './notification-preference-row'

interface NotificationPreferencesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * What somebody wants to hear about.
 *
 * **Six switches, by category, and not one per event.** Muting is a decision about
 * a kind of interruption — "stop telling me about compliance" — and never about
 * one particular sentence; a switch per event would be a preferences page nobody
 * finishes reading, and the first thing anybody would do with it is switch off the
 * one message that mattered by accident.
 *
 * The categories that may be switched off come from the **server's own answer**
 * rather than from a list here, so the rule that an account message cannot be
 * muted lives in one place. See `NotificationPreferenceRow` for why a locked row
 * is drawn rather than hidden.
 *
 * **What this deliberately does not have: email, and a per-channel matrix.** This
 * application has no mail transport and no push service, so a channel column
 * would be three columns of switches that all do the same thing — and the one
 * thing worse than a missing preference is one that claims to send an email
 * nobody receives.
 */
export function NotificationPreferencesDialog({
  open,
  onOpenChange,
}: NotificationPreferencesDialogProps) {
  const preferences = useNotificationPreferences()
  const save = useSaveNotificationPreferences()

  /**
   * A local draft, so ticking six boxes is one request rather than six — the rule
   * the Trip DO column filters follow, where ticks are a draft until Apply.
   */
  const [draft, setDraft] = useState<NotificationCategory[]>([])

  /**
   * Seeded **during render** rather than in an effect, which is the pattern
   * `app-layout.tsx` uses to close the mobile drawer on a route change: calling
   * `setState` inside an effect schedules a second render whose only job is to
   * apply what was already known, and React's own lint rule says so.
   *
   * The signature is what makes it safe to leave a half-edited draft alone. A
   * refetch returning the same stored value changes nothing, so somebody ticking
   * boxes while a background poll lands does not watch their work reset; only a
   * genuinely different stored value, or a fresh opening, reseeds.
   */
  const stored = preferences.data?.mutedCategories
  const signature = stored ? [...stored].sort().join(',') : null
  const [syncedTo, setSyncedTo] = useState<string | null>(null)

  if (open && stored && syncedTo !== signature) {
    setSyncedTo(signature)
    setDraft(stored)
  }
  if (!open && syncedTo !== null) {
    // Forgotten on close, so the next opening reads the server's answer again.
    setSyncedTo(null)
  }

  const mutable = preferences.data?.mutable ?? []

  const toggle = (category: NotificationCategory, receive: boolean) => {
    setDraft((current) =>
      receive
        ? current.filter((value) => value !== category)
        : [...new Set([...current, category])],
    )
  }

  const dirty =
    preferences.data !== undefined &&
    (draft.length !== preferences.data.mutedCategories.length ||
      draft.some((category) => !preferences.data?.mutedCategories.includes(category)))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification settings</DialogTitle>
          <DialogDescription>
            Choose what reaches the bell. This changes what arrives from now on —
            anything already in your list stays where it is.
          </DialogDescription>
        </DialogHeader>

        {preferences.isPending && (
          <div className="space-y-3 py-2" aria-busy="true">
            {[0, 1, 2, 3].map((row) => (
              <div key={row} className="h-11 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {preferences.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5">
            <p className="text-[13px] font-medium text-destructive">Could not load your settings</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {preferences.error?.message ?? 'Something went wrong.'}
            </p>
          </div>
        )}

        {preferences.data && (
          <ul className="-mx-1 max-h-[min(24rem,55svh)] space-y-0.5 overflow-y-auto px-1">
            {NOTIFICATION_CATEGORIES.map((category) => {
              const locked = !mutable.includes(category)

              return (
                <li key={category}>
                  <NotificationPreferenceRow
                    category={category}
                    receiving={locked || !draft.includes(category)}
                    locked={locked}
                    onChange={(receive) => toggle(category, receive)}
                  />
                </li>
              )
            })}
          </ul>
        )}

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!dirty || save.isPending}
            onClick={() => save.mutate(draft, { onSuccess: () => onOpenChange(false) })}
          >
            {save.isPending ? 'Saving…' : 'Save settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
