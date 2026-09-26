import { BellOff, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { dayHeading, groupByDay } from '../lib/notification-meta'
import type { NotificationRecord } from '../types'
import { NotificationItem } from './notification-item'

interface NotificationListProps {
  records: NotificationRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  onRetry: () => void
  onReset: () => void
  onToggleRead: (record: NotificationRecord) => void
  onDismiss: (record: NotificationRecord) => void
}

/**
 * The messages, grouped by day.
 *
 * **Grouped rather than given a date column**, which is the decision the
 * activity timeline makes and the reason is the same: the first question anybody
 * asks of a list like this is *when*, and a sticky heading answers it
 * continuously while a date repeated on twenty rows answers it twenty times and
 * is read none of them.
 *
 * The day is computed in the **viewer's own calendar**, or a Dhaka evening would
 * file under yesterday — the arithmetic is in `@/lib/day-grouping`, shared with
 * the journal so the two lists in this shell can never disagree about which day
 * an evening belongs to.
 *
 * A day split across a page boundary is correct rather than a bug: the next page
 * opens with the rest of that day under its own heading.
 */
export function NotificationList({
  records,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  onRetry,
  onReset,
  onToggleRead,
  onDismiss,
}: NotificationListProps) {
  const t = useT()

  if (isLoading) {
    return (
      <div className="space-y-4 p-4" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="px-6 py-14 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive ring-1 ring-destructive/15">
          <BellOff className="size-5" aria-hidden />
        </div>
        <h2 className="mt-4 text-base font-semibold">{t('notification.list.loadFailed')}</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
          {errorMessage}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Inbox className="size-5" aria-hidden />
        </div>

        {/**
         * Two different emptinesses, and only one of them may claim to be good
         * news — the distinction `asked` draws on the dashboard's attention list.
         * A filter that matches nothing is a filter to clear; an empty inbox is
         * genuinely an empty inbox, because the audience was decided when each
         * message was written and there is no set of messages this account
         * "cannot see".
         */}
        {isFiltered ? (
          <>
            <h2 className="mt-4 text-base font-semibold">{t('notification.list.noMatches')}</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
              {t('notification.panel.outsideFilters')}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
              {t('common.actions.clearFilters')}
            </Button>
          </>
        ) : (
          <>
            <h2 className="mt-4 text-base font-semibold">{t('notification.list.upToDate')}</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
              Accounts waiting for approval, gate pass verdicts, certificates about
              to lapse, goods back at the depot and money movements arrive here as
              they happen. Nothing is waiting for you right now.
            </p>
          </>
        )}
      </div>
    )
  }

  const groups = groupByDay(records)

  return (
    <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
      {groups.map((group) => (
        <section key={group.day} aria-label={dayHeading(group.rows[0]?.createdAt ?? group.day, t)}>
          <h2 className="sticky top-0 z-10 flex items-center gap-2 border-y bg-card/95 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase backdrop-blur-sm">
            {dayHeading(group.rows[0]?.createdAt ?? group.day, t)}
            <span className="font-normal normal-case tracking-normal text-muted-foreground/70">
              · {group.rows.length} {group.rows.length === 1 ? 'notification' : 'notifications'}
            </span>
          </h2>

          <ul className="divide-y">
            {group.rows.map((record) => (
              <NotificationItem
                key={record.id}
                record={record}
                onToggleRead={onToggleRead}
                onDismiss={onDismiss}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
