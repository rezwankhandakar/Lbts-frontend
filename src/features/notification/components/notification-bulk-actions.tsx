import { CheckCheck, Settings2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationBulkActionsProps {
  /** What the current filters add up to, alongside the inbox-wide unread count. */
  summary?: string
  hasUnread: boolean
  hasRead: boolean
  isBusy: boolean
  onMarkAllRead: () => void
  onClearRead: () => void
  onOpenPreferences: () => void
}

/**
 * The strip under the filters: what the list adds up to, and the two things you
 * can do to all of it at once.
 *
 * **Both clearing actions are drawn only when they would do something.** A
 * disabled control beside an empty list is a promise of nothing — the rule the
 * Challan backlog chips follow, where a chip with nothing behind it is not drawn
 * at all.
 *
 * *Clear read* takes only what has been read, and says so in its own label. "Clear
 * all" on an inbox with unread messages in it would be a button that throws away
 * exactly what somebody came to the page for; an unread message is dismissed one
 * at a time, where the decision is visible.
 *
 * Settings is always drawn, because it is the one control here that is never a
 * no-op — and because the moment somebody wants it is the moment the bell has
 * annoyed them.
 */
export function NotificationBulkActions({
  summary,
  hasUnread,
  hasRead,
  isBusy,
  onMarkAllRead,
  onClearRead,
  onOpenPreferences,
}: NotificationBulkActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {summary && (
        <p className="flex-1 text-xs text-muted-foreground" aria-live="polite">
          {summary}
        </p>
      )}

      {hasUnread && (
        <Button
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={onMarkAllRead}
          className="shrink-0"
        >
          <CheckCheck data-icon="inline-start" aria-hidden />
          Mark all read
        </Button>
      )}

      {hasRead && (
        <Button
          variant="ghost"
          size="sm"
          disabled={isBusy}
          onClick={onClearRead}
          className="shrink-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 data-icon="inline-start" aria-hidden />
          Clear read
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onOpenPreferences}
        className="shrink-0 text-muted-foreground"
      >
        <Settings2 data-icon="inline-start" aria-hidden />
        Settings
      </Button>
    </div>
  )
}
