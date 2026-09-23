import { roleMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'
import { actorInitials } from '../lib/activity-meta'
import type { ActivityActorRef } from '../types'

interface ActivityActorProps {
  actor: ActivityActorRef | null
  /** `full` adds the role beside the name; `compact` is initials plus name. */
  variant?: 'compact' | 'full'
  className?: string
}

/**
 * Who did it.
 *
 * Initials rather than a photo, and that is a property of the journal rather
 * than a shortcut: a row stores the actor's **name and role as copies** so it
 * still reads after the account is deleted, and a photo would have to be
 * fetched from a profile that may no longer exist. Initials are derived from
 * the copy, so they are as durable as the row.
 *
 * The chip is tinted by the role the actor held **at the time**, not the one
 * they hold now — the whole reason the role is copied onto the row. Somebody
 * reading "Suspended a colleague · Manager" in August is reading what was true
 * in August.
 */
export function ActivityActor({ actor, variant = 'compact', className }: ActivityActorProps) {
  if (!actor) {
    /**
     * A row with no actor. Nothing invents a name here: a made-up "System" in
     * an audit log is the one thing this collection must never contain.
     */
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-muted-foreground', className)}>
        <span
          className="flex size-5 items-center justify-center rounded-full bg-muted text-[9px] font-semibold ring-1 ring-border"
          aria-hidden
        >
          —
        </span>
        <span className="text-xs">No actor recorded</span>
      </span>
    )
  }

  const meta = roleMeta(actor.role)

  return (
    <span className={cn('inline-flex min-w-0 items-center gap-1.5', className)}>
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ring-1',
          meta.chip,
        )}
        aria-hidden
      >
        {actorInitials(actor.name)}
      </span>
      <span className="truncate text-xs font-medium">{actor.name}</span>
      {variant === 'full' && actor.role && (
        <span className={cn('shrink-0 rounded-full border px-1.5 py-px text-[10px] font-semibold', meta.badge)}>
          {meta.label}
        </span>
      )}
    </span>
  )
}
