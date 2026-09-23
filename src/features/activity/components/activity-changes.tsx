import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { changeValueText } from '../lib/activity-meta'
import type { ActivityChange } from '../types'

interface ActivityChangesProps {
  changes: ActivityChange[]
}

function Value({ value, tone }: { value: string | null; tone: 'from' | 'to' }) {
  const isBlank = value === null || value === ''

  return (
    <span
      className={cn(
        'min-w-0 rounded-md px-1.5 py-0.5 text-[12px] break-words',
        isBlank && 'text-muted-foreground italic',
        tone === 'from' && !isBlank && 'bg-tone-rose/10 text-tone-rose line-through decoration-1',
        tone === 'to' && !isBlank && 'bg-tone-emerald/10 text-tone-emerald',
      )}
    >
      {changeValueText(value)}
    </span>
  )
}

/**
 * What moved, field by field.
 *
 * The one thing on this page that could not be reconstructed from the records
 * themselves: every module in this system keeps the *current* state and, at
 * best, who touched it last. What a rate said before somebody corrected it,
 * what a cash entry was for before it was rewritten, which role an account
 * held in March — those exist here and nowhere else.
 *
 * Three decisions in how it is drawn.
 *
 * **An absent value and an empty one are told apart**, because they are
 * different facts: a note nobody ever wrote and a note somebody cleared read
 * the same on a form and do not mean the same in an audit trail. The diff
 * stores them apart and this draws them apart — "not set" against "blank".
 *
 * **The old value is struck through and the new one is not.** Colour alone
 * never carries it: the strike says which is gone to anybody who cannot use
 * the hue, and the arrow says which way it went.
 *
 * **Values wrap rather than truncate.** A delivery address or a goods list is
 * long, and a diff that hides the half that changed is a diff nobody can act
 * on. The sheet scrolls; the value does not clip.
 */
export function ActivityChanges({ changes }: ActivityChangesProps) {
  if (changes.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No field-level detail was recorded for this event — the summary above is the whole of it.
      </p>
    )
  }

  return (
    <ul className="divide-y rounded-lg border">
      {changes.map((change) => (
        <li key={change.field} className="space-y-1.5 p-2.5">
          <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
            {change.label}
          </p>
          <div className="flex flex-wrap items-start gap-1.5">
            <Value value={change.from} tone="from" />
            <ArrowRight className="mt-1 size-3 shrink-0 text-muted-foreground/60" aria-hidden />
            <Value value={change.to} tone="to" />
          </div>
        </li>
      ))}
    </ul>
  )
}
