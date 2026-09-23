import { ChevronRight } from 'lucide-react'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import { categoryMeta, entityLabel, moduleMeta, severityMeta, timeOf } from '../lib/activity-meta'
import type { ActivityRecord } from '../types'
import { ActivityActor } from './activity-actor'

interface ActivityRowProps {
  record: ActivityRecord
  /** False on the last row of a day, so the rail stops rather than dangling. */
  showConnector: boolean
  onOpen: (record: ActivityRecord) => void
}

/**
 * One event on the timeline.
 *
 * The whole row is one button. There is exactly one thing to do with a journal
 * row — look at it more closely — so a row with a menu, or a link inside a
 * click target, would be two affordances for one action.
 *
 * What it draws, in the order a reader takes it in:
 *
 * - **A marker on the rail**, tinted by module and shaped by category. Colour
 *   alone never carries it: the icon says what kind of change this was, and
 *   the module is written out in the badge beneath.
 * - **The summary**, which the service that did the thing wrote as a sentence.
 *   It is never truncated to one line — "LBTS-CH-2026-000123 amended —
 *   customer, goods and 2 more" is the whole point of the row, and clipping it
 *   would leave a reader opening every row to find the one they wanted.
 * - **The meta line**: module, the record it touched, and who did it.
 * - **The time**, relative on the right where the eye lands when scanning down
 *   a day, with the exact clock time under it.
 *
 * A `critical` row gets a hairline down its left edge and nothing else. Every
 * row highlighted is no row highlighted, so the emphasis is spent on the ones
 * that are quietly wrong or hard to undo.
 */
export function ActivityRow({ record, showConnector, onOpen }: ActivityRowProps) {
  const module = moduleMeta(record.module)
  const category = categoryMeta(record.category)
  const severity = severityMeta(record.severity)
  const CategoryIcon = category.icon

  const isCritical = record.severity === 'critical'

  return (
    <li className="relative">
      {/* The rail. Drawn behind the marker and stopped on the last row of a
          day, so a group reads as a group rather than as a line that keeps
          going into the heading below it. */}
      {showConnector && (
        <span
          className="absolute top-9 bottom-0 left-[1.4375rem] w-px bg-border sm:left-[1.6875rem]"
          aria-hidden
        />
      )}

      <button
        type="button"
        onClick={() => onOpen(record)}
        className={cn(
          'group/row relative flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition outline-none sm:gap-3.5 sm:px-3',
          'hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50',
        )}
      >
        {isCritical && (
          <span
            className={cn('absolute inset-y-1.5 left-0 w-0.5 rounded-full', severity.emphasis)}
            aria-hidden
          />
        )}

        <span
          className={cn(
            'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 sm:size-9',
            module.chip,
          )}
          aria-hidden
        >
          <CategoryIcon className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-start justify-between gap-3">
            <span className="min-w-0 text-[13px] leading-snug font-medium text-pretty sm:text-sm">
              {record.summary}
            </span>

            <span className="hidden shrink-0 text-right sm:block">
              <span className="block text-xs whitespace-nowrap text-muted-foreground">
                {formatRelative(record.createdAt)}
              </span>
              <span className="block text-[11px] whitespace-nowrap text-muted-foreground/70 tabular-nums">
                {timeOf(record.createdAt)}
              </span>
            </span>
          </span>

          <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[10px] font-semibold',
                module.badge,
              )}
            >
              {module.label}
            </span>

            {record.entityLabel && (
              <span className="inline-flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                <span className="shrink-0">{entityLabel(record.entityType)}</span>
                <span className="truncate font-mono text-foreground/80">{record.entityLabel}</span>
              </span>
            )}

            <span className="text-muted-foreground/40" aria-hidden>
              ·
            </span>

            <ActivityActor actor={record.actor} />

            {isCritical && (
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-1.5 py-px text-[10px] font-semibold',
                  severity.badge,
                )}
              >
                {severity.label}
              </span>
            )}

            {record.changes.length > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {record.changes.length} {record.changes.length === 1 ? 'field' : 'fields'}
              </span>
            )}

            {/* The phone's version of the timestamp column, which is hidden
                above. A relative time is what somebody scanning wants; the
                clock time is in the detail sheet. */}
            <span className="ml-auto text-[11px] whitespace-nowrap text-muted-foreground sm:hidden">
              {formatRelative(record.createdAt)}
            </span>
          </span>
        </span>

        <ChevronRight
          className="mt-1 hidden size-4 shrink-0 text-muted-foreground/40 transition group-hover/row:translate-x-0.5 group-hover/row:text-muted-foreground lg:block"
          aria-hidden
        />
      </button>
    </li>
  )
}
