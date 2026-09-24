import { ArrowUpRight, Check, Undo2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  notificationCategoryMeta,
  notificationLinkLabel,
  notificationModuleMeta,
  notificationPath,
  notificationPriorityMeta,
} from '../lib/notification-meta'
import type { NotificationRecord } from '../types'
import { NotificationItemMeta } from './notification-item-meta'

interface NotificationItemProps {
  record: NotificationRecord
  /** Tighter, and without the meta line, inside the header panel. */
  compact?: boolean
  onOpen?: (record: NotificationRecord) => void
  onToggleRead: (record: NotificationRecord) => void
  onDismiss?: (record: NotificationRecord) => void
}

/**
 * One message.
 *
 * The **opposite** shape to an activity row, and the difference is worth stating
 * because the two sit in the same shell. A journal row is one button, because
 * there is exactly one thing to do with it — look closer. A notification has
 * three: go to the thing, say you have dealt with it, and get rid of it. So this
 * is a container with controls in it rather than a click target, and nothing is
 * nested inside anything clickable.
 *
 * What it draws, in the order somebody takes it in:
 *
 * - **An unread marker**, which is the only thing a reader is actually scanning
 *   for. A dot plus weight plus a tinted ground, because a single cue is one a
 *   colour-blind reader or a bright screen can lose.
 * - **The module chip**, tinted the colour the sidebar gives that destination and
 *   carrying the category's icon — so what kind of message this is reads before
 *   the sentence does.
 * - **The title**, never truncated to one line. The sentence *is* the message; a
 *   clipped one would have somebody opening rows to find out what they say.
 * - **The body**, which is where the reason lives — why a gate pass was sent
 *   back, why a copy is missing.
 * - **The time**, relative, because "2 hours ago" is the question being asked of
 *   a notification and an exact clock time is not.
 *
 * An `urgent` or `attention` message gets a hairline down its leading edge and
 * nothing else. A list where everything is highlighted is a list where nothing
 * is — the rule `ACTIVITY_SEVERITIES` follows, and `attention.ts` on the
 * dashboard.
 */
export function NotificationItem({
  record,
  compact = false,
  onOpen,
  onToggleRead,
  onDismiss,
}: NotificationItemProps) {
  const module = notificationModuleMeta(record.module)
  const category = notificationCategoryMeta(record.category)
  const priority = notificationPriorityMeta(record.priority)
  const CategoryIcon = category.icon

  const unread = record.readAt === null
  const path = notificationPath(record)

  return (
    <li
      className={cn(
        'relative flex gap-3 px-3 py-3 transition-colors hover:bg-muted/60 sm:gap-3.5 sm:px-4',
        unread ? 'bg-primary/[0.035]' : 'bg-transparent',
      )}
    >
      {priority.emphasis && (
        <span
          className={cn('absolute inset-y-2 left-0 w-0.5 rounded-full', priority.emphasis)}
          aria-hidden
        />
      )}

      <span
        className={cn(
          'relative mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 sm:size-9',
          module.chip,
        )}
        aria-hidden
      >
        <CategoryIcon className="size-4" />
        {/* The unread dot rides the chip rather than sitting in the text column,
            so a reader scanning the left edge gets one signal in one place. */}
        {unread && (
          <span
            className={cn(
              'absolute -top-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-card',
              priority.dot,
            )}
          />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p
            className={cn(
              'min-w-0 flex-1 text-[13px] leading-snug text-pretty',
              unread ? 'font-semibold text-foreground' : 'font-medium text-foreground/85',
            )}
          >
            {record.title}
          </p>

          <span className="mt-0.5 shrink-0 text-[10.5px] whitespace-nowrap text-muted-foreground">
            {formatRelative(record.createdAt)}
          </span>
        </div>

        {record.body && (
          <p className="mt-1 text-[12px] leading-relaxed text-pretty text-muted-foreground">
            {record.body}
          </p>
        )}

        {!compact && <NotificationItemMeta record={record} />}

        <div className="mt-2 flex flex-wrap items-center gap-1">
          {path && (
            <Button
              variant="ghost"
              size="xs"
              className="text-primary hover:bg-primary/10 hover:text-primary"
              render={<Link to={path} />}
              onClick={() => onOpen?.(record)}
            >
              {notificationLinkLabel(record)}
              <ArrowUpRight aria-hidden />
            </Button>
          )}

          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={() => onToggleRead(record)}
          >
            {unread ? <Check aria-hidden /> : <Undo2 aria-hidden />}
            {unread ? 'Mark read' : 'Unread'}
          </Button>

          {onDismiss && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="ml-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onDismiss(record)}
              aria-label={`Dismiss: ${record.title}`}
            >
              <X aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </li>
  )
}
