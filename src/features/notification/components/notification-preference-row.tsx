import { Lock } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { NOTIFICATION_CATEGORY_META } from '../lib/notification-meta'
import type { NotificationCategory } from '../types'

interface NotificationPreferenceRowProps {
  category: NotificationCategory
  /** True while this kind still reaches the bell. */
  receiving: boolean
  /** A category the server says may not be switched off. */
  locked: boolean
  onChange: (receive: boolean) => void
}

/**
 * One switch on the preferences dialog.
 *
 * Written as **what you hear** rather than as what you mute. A page of unchecked
 * boxes labelled "Compliance" cannot be read without first working out which way
 * round it is, and a preference somebody misreads is worse than none. The stored
 * value is the inverse — `mutedCategories` — so a category added to the system
 * next year arrives *on* rather than silently excluded by a preference set this
 * year.
 *
 * A locked row is **drawn and disabled rather than hidden**, with a padlock and
 * the reason beside it. Hiding it would leave somebody wondering why account
 * messages keep arriving; this answers the question where it is asked.
 *
 * The whole row is the label, so the text and the icon are both hit targets — on
 * a phone a 16px checkbox is the only thing you could otherwise press.
 */
export function NotificationPreferenceRow({
  category,
  receiving,
  locked,
  onChange,
}: NotificationPreferenceRowProps) {
  const meta = NOTIFICATION_CATEGORY_META[category]
  const Icon = meta.icon

  return (
    <label
      className={cn(
        'group/field flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors',
        locked ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
          receiving
            ? 'bg-primary/10 text-primary ring-primary/15'
            : 'bg-muted text-muted-foreground ring-border',
        )}
        aria-hidden
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] leading-none font-medium">{meta.label}</span>
          {locked && (
            <span className="flex items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] leading-none font-semibold text-muted-foreground">
              <Lock className="size-2.5" aria-hidden />
              Always on
            </span>
          )}
        </span>
        <span className="mt-1 block text-[11.5px] leading-relaxed text-pretty text-muted-foreground">
          {meta.description}
        </span>
      </span>

      <Checkbox
        className="mt-1.5 shrink-0"
        checked={receiving}
        disabled={locked}
        onCheckedChange={(checked) => onChange(checked === true)}
        aria-label={`Receive ${meta.label} notifications`}
      />
    </label>
  )
}
