import { Lock, PencilLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InfoRowProps {
  icon: LucideIcon
  label: string
  /** The value. Pass `null` to render the "not provided" placeholder. */
  children: ReactNode
  /** Shown under the value — context, never a second value. */
  hint?: string
  /** Trailing control, e.g. a copy button. */
  action?: ReactNode
  /**
   * How the field is governed. `editable` marks what this page can change,
   * `locked` what only the system or an administrator can. Anything else is
   * plain information and gets no marker at all.
   */
  control?: 'editable' | 'locked'
  /** Explains the lock, e.g. who does own the field. */
  controlHint?: string
}

/**
 * One field in a profile panel.
 *
 * The marker on the right is the point: a profile page is half things you may
 * change and half things you may not, and a user who cannot tell them apart
 * will try to edit their own role. The distinction is carried by an icon and
 * its label, never by colour alone.
 */
export function InfoRow({
  icon: Icon,
  label,
  children,
  hint,
  action,
  control,
  controlHint,
}: InfoRowProps) {
  const markerLabel = control === 'editable' ? 'You can change this' : (controlHint ?? 'Read-only')

  return (
    <div className="flex items-start gap-3 border-b border-border/60 py-3.5 last:border-0">
      <span
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        aria-hidden
      >
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-1 text-[13.5px] leading-snug break-words">
          {children ?? <span className="text-muted-foreground/70 italic">Not provided</span>}
        </dd>
        {hint ? (
          <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{hint}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {action}
        {control ? (
          /**
           * Deliberately not focusable. A panel has up to six of these, and
           * making each a tab stop would bury the page's real controls behind
           * a row of decorations. The meaning is carried by the always-present
           * label for assistive technology and by the title on hover — the
           * icon alone never has to be understood.
           */
          <span
            title={markerLabel}
            className={cn(
              'flex size-6 items-center justify-center rounded-md',
              control === 'editable' ? 'text-tone-emerald/70' : 'text-muted-foreground/60',
            )}
          >
            <span className="sr-only">{markerLabel}</span>
            {control === 'editable' ? (
              <PencilLine className="size-3.5" aria-hidden />
            ) : (
              <Lock className="size-3.5" aria-hidden />
            )}
          </span>
        ) : null}
      </div>
    </div>
  )
}
