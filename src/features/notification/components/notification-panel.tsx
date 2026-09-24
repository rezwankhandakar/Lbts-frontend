import { CheckCheck, Settings2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useDismissNotification,
  useMarkAllRead,
  useSetNotificationRead,
} from '../hooks/use-notifications'
import { notificationPriorityMeta } from '../lib/notification-meta'
import type { NotificationRecord, NotificationSummary } from '../types'
import { NotificationItem } from './notification-item'
import {
  NotificationPanelEmpty,
  NotificationPanelError,
  NotificationPanelSkeleton,
} from './notification-panel-states'

interface NotificationPanelProps {
  summary: NotificationSummary | undefined
  isLoading: boolean
  isError: boolean
  errorMessage: string
  onRetry: () => void
  /** Closes the popover — every navigation out of it has to. */
  onClose: () => void
  onOpenPreferences: () => void
}

/** The strip under the header: what is waiting, by how loudly it is asking. */
const PRIORITY_ORDER = ['urgent', 'attention', 'info'] as const

/**
 * What is behind the bell.
 *
 * **A glance, not a page.** It holds the newest eight messages and nothing else:
 * no filters, no paging, no date range. The page is where a backlog is worked,
 * and a panel that scrolls is a page somebody has put in a box — so everything
 * needing a decision has a way out of here into the real list rather than a
 * smaller version of it in a 380px column.
 *
 * Three things it does do, because each is one press and belongs where the badge
 * is: mark the lot read, go to what is unread, and turn a category off. That last
 * one is here rather than only on the page because the moment somebody wants it
 * is the moment they are annoyed by the bell.
 *
 * The priority strip is one row rather than six category counts: the question at
 * the bell is "is any of this urgent", and the breakdown by kind is a filter on
 * the page.
 */
export function NotificationPanel({
  summary,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onClose,
  onOpenPreferences,
}: NotificationPanelProps) {
  const setRead = useSetNotificationRead()
  const dismiss = useDismissNotification()
  const markAll = useMarkAllRead()

  const records = summary?.recent ?? []
  const unread = summary?.unread ?? 0

  /**
   * The newest message actually on screen, so "mark all read" cannot clear
   * something that arrived while the panel was open. The list is newest-first, so
   * that is the first row — see `markAllNotificationsRead`.
   */
  const newestShown = records[0]?.createdAt

  const toggleRead = (record: NotificationRecord) => {
    setRead.mutate({ id: record.id, read: record.readAt === null })
  }

  return (
    <div className="flex max-h-[min(30rem,calc(100svh-5rem))] w-[calc(100vw-2rem)] flex-col sm:w-96">
      <header className="flex items-center gap-2 border-b px-3 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] leading-none font-semibold">Notifications</p>
          <p className="mt-1 text-[11px] leading-none text-muted-foreground">
            {isLoading ? 'Checking…' : unread === 0 ? 'Nothing waiting' : `${unread} unread`}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground"
          aria-label="Notification settings"
          onClick={() => {
            onClose()
            onOpenPreferences()
          }}
        >
          <Settings2 aria-hidden />
        </Button>

        {/* Drawn only when there is something to do. A disabled "mark all read"
            beside an empty list is a promise of nothing. */}
        {unread > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="text-primary hover:bg-primary/10 hover:text-primary"
            disabled={markAll.isPending}
            onClick={() => markAll.mutate(newestShown)}
          >
            <CheckCheck aria-hidden />
            Mark all
          </Button>
        )}
      </header>

      {summary && unread > 0 && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b bg-muted/40 px-3 py-2">
          {PRIORITY_ORDER.map((priority) => {
            const count = summary.byPriority[priority]
            if (count === 0) {
              return null
            }
            const meta = notificationPriorityMeta(priority)
            return (
              <span
                key={priority}
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
              >
                <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden />
                <span className="font-medium text-foreground">{count}</span>
                {meta.label.toLowerCase()}
              </span>
            )
          })}
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading && <NotificationPanelSkeleton />}

        {isError && !isLoading && (
          <NotificationPanelError message={errorMessage} onRetry={onRetry} />
        )}

        {!isLoading && !isError && records.length === 0 && <NotificationPanelEmpty />}

        {!isLoading && !isError && records.length > 0 && (
          <ul className="divide-y">
            {records.map((record) => (
              <NotificationItem
                key={record.id}
                record={record}
                compact
                onOpen={onClose}
                onToggleRead={toggleRead}
                onDismiss={(target) => dismiss.mutate(target.id)}
              />
            ))}
          </ul>
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t px-3 py-2">
        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          render={<Link to="/notifications" state={{ state: 'unread' }} />}
          onClick={onClose}
        >
          See unread
        </Button>
        <Button
          variant="ghost"
          size="xs"
          className="text-primary hover:bg-primary/10 hover:text-primary"
          render={<Link to="/notifications" />}
          onClick={onClose}
        >
          All notifications
        </Button>
      </footer>
    </div>
  )
}
