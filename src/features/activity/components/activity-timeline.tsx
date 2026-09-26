import { History, SearchX, ServerCrash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { dayHeading, groupByDay } from '../lib/activity-meta'
import type { ActivityRecord } from '../types'
import { ActivityRow } from './activity-row'

interface ActivityTimelineProps {
  records: ActivityRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  onRetry: () => void
  onReset: () => void
  onOpen: (record: ActivityRecord) => void
}

function TimelineSkeleton() {
  return (
    <div className="space-y-2 p-3 sm:p-4" aria-busy="true">
      <Skeleton className="h-4 w-28" />
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="flex items-start gap-3 py-2">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-2/5" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The journal, grouped by the day each event happened.
 *
 * Grouped rather than flat because the first question anybody asks of a
 * journal is "when", and a sticky day heading answers it continuously while
 * somebody scrolls — a date column repeated on every row answers it twenty-five
 * times and is read none of them. The day is computed in the **viewer's own
 * calendar** (`dayKeyOf`), so a Dhaka evening does not appear under yesterday.
 *
 * Grouping is done over the page as it arrives rather than by asking the
 * server for groups: the rows are already newest-first, so a group is a run of
 * neighbours and nothing has to be sorted twice.
 *
 * `isFetching` dims the list instead of replacing it, because the query keeps
 * the previous page while the next loads — paging through a journal should
 * never flash an empty panel.
 */
export function ActivityTimeline({
  records,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  onRetry,
  onReset,
  onOpen,
}: ActivityTimelineProps) {
  const t = useT()

  if (isLoading) {
    return <TimelineSkeleton />
  }

  if (isError) {
    return (
      <EmptyState
        icon={ServerCrash}
        title={t('activity.timeline.loadFailed')}
        description={errorMessage}
        className="min-h-[22rem] rounded-none border-0 shadow-none"
        action={
          <Button size="sm" onClick={onRetry}>
            {t('common.actions.retry')}
          </Button>
        }
      />
    )
  }

  if (records.length === 0) {
    /**
     * Two empty states, because they mean different things. A filtered list
     * with nothing in it is a question that came back empty and the answer is
     * to widen it; an unfiltered one means the journal itself is empty, which
     * on a system that has been running is worth saying plainly rather than
     * offering a Clear button that would do nothing.
     */
    return isFiltered ? (
      <EmptyState
        icon={SearchX}
        title={t('activity.timeline.noMatchesTitle')}
        description={t('activity.timeline.noMatchesBody')}
        className="min-h-[22rem] rounded-none border-0 shadow-none"
        action={
          <Button size="sm" variant="outline" onClick={onReset}>
            {t('common.actions.clearFilters')}
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={History}
        title={t('activity.timeline.emptyTitle')}
        description={t('activity.timeline.emptyBody')}
        className="min-h-[22rem] rounded-none border-0 shadow-none"
        footnote={t('activity.timeline.emptyFootnote')}
      />
    )
  }

  const groups = groupByDay(records)

  return (
    <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
      {groups.map((group) => (
        <section key={group.day} aria-label={dayHeading(group.rows[0]?.createdAt ?? group.day, t)}>
          <h3 className="sticky top-0 z-20 flex items-center gap-2 border-b bg-card/95 px-3 py-2 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase backdrop-blur sm:px-4">
            {dayHeading(group.rows[0]?.createdAt ?? group.day, t)}
            <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-semibold tabular-nums">
              {group.rows.length}
            </span>
          </h3>

          <ul className="px-1 py-1 sm:px-2">
            {group.rows.map((record, index) => (
              <ActivityRow
                key={record.id}
                record={record}
                showConnector={index < group.rows.length - 1}
                onOpen={onOpen}
              />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
