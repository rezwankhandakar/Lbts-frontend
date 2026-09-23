import { useState } from 'react'
import { History } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import { categoryMeta, moduleMeta, timeOf } from '../lib/activity-meta'
import type { ActivityRecord } from '../types'
import { ActivityActor } from './activity-actor'
import { ActivityDetailSheet } from './activity-detail-sheet'

interface ActivityFeedProps {
  records: ActivityRecord[]
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  /** What the empty state should say in this context. */
  emptyTitle?: string
  emptyDescription?: string
  className?: string
}

/**
 * A compact journal, for somewhere that is not the journal page.
 *
 * Composed by import rather than copied, the rule CLAUDE.md sets for a piece a
 * second feature wants: the vendor workspace draws its own Activity tab from
 * this, so what a row means, what it is coloured, and what the detail sheet
 * shows are decided once. A second rendering of an activity row is exactly the
 * kind of thing that quietly comes to disagree with the first about whether a
 * deletion is red.
 *
 * It is narrower than the timeline deliberately. No day grouping — a panel
 * beside other panels is read as "the last few things", and sticky headings
 * inside a tab fight the page's own scroll — and no filters, because a feed
 * scoped to one subject is already the filter.
 */
export function ActivityFeed({
  records,
  isLoading,
  isError,
  errorMessage,
  emptyTitle = 'Nothing recorded yet',
  emptyDescription = 'Changes appear here as people make them.',
  className,
}: ActivityFeedProps) {
  const [open, setOpen] = useState<ActivityRecord | null>(null)

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)} aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={History}
        title="The journal could not be read"
        description={errorMessage ?? 'Something went wrong.'}
        className={cn('min-h-[16rem]', className)}
      />
    )
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={emptyTitle}
        description={emptyDescription}
        className={cn('min-h-[16rem]', className)}
      />
    )
  }

  return (
    <>
      <ul className={cn('relative space-y-0.5', className)}>
        {records.map((record, index) => {
          const module = moduleMeta(record.module)
          const CategoryIcon = categoryMeta(record.category).icon

          return (
            <li key={record.id} className="relative">
              {index < records.length - 1 && (
                <span
                  className="absolute top-9 bottom-0 left-[1.1875rem] w-px bg-border"
                  aria-hidden
                />
              )}

              <button
                type="button"
                onClick={() => setOpen(record)}
                className="flex w-full items-start gap-2.5 rounded-lg p-2 text-left transition outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                <span
                  className={cn(
                    'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-1',
                    module.chip,
                  )}
                  aria-hidden
                >
                  <CategoryIcon className="size-3.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] leading-snug text-pretty">
                    {record.summary}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <ActivityActor actor={record.actor} />
                    <span className="text-[11px] text-muted-foreground">
                      {formatRelative(record.createdAt)} · {timeOf(record.createdAt)}
                    </span>
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <ActivityDetailSheet record={open} onClose={() => setOpen(null)} />
    </>
  )
}
