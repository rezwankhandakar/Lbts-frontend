import { cn } from '@/lib/utils'
import { notificationModuleMeta } from '../lib/notification-meta'
import type { NotificationRecord } from '../types'

/**
 * The line under a message: which module, what kind of event, and who caused it.
 *
 * Drawn on the page and dropped in the header panel, where the chip and the
 * sentence are the whole of what there is room to say.
 *
 * **An absent actor is not an absence to be filled in.** A certificate expiring is
 * the calendar rather than a person, and inventing "System" beside a message
 * somebody is about to act on would be a small lie in the one place this feature
 * cannot afford one. So the sentence says what actually found it.
 */
export function NotificationItemMeta({ record }: { record: NotificationRecord }) {
  const module = notificationModuleMeta(record.module)

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
      <span
        className={cn(
          'rounded-full border px-1.5 py-0.5 text-[10px] leading-none font-semibold',
          module.badge,
        )}
      >
        {module.label}
      </span>

      <span className="text-muted-foreground/60" aria-hidden>
        ·
      </span>
      <span>{record.eventLabel}</span>

      <span className="text-muted-foreground/60" aria-hidden>
        ·
      </span>
      {record.actor ? (
        <span className="truncate">
          {record.actor.name}
          {record.actor.role ? ` (${record.actor.role})` : ''}
        </span>
      ) : (
        <span>Found by the compliance check</span>
      )}
    </div>
  )
}
