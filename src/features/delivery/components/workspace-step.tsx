import type { ReactNode } from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface WorkspaceStepProps {
  step: number
  title: string
  description: string
  done: boolean
  /** Controls drawn at the right of the heading. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/**
 * One numbered stage of building a trip.
 *
 * Two stages, not a wizard: an operator often scans the challans first and
 * reads the plate off the lorry second, so both are open at once and the
 * numbers are a reading order, never a gate. The tick is the only state — it
 * says a stage has what Confirm needs, without hiding anything.
 */
export function WorkspaceStep({
  step,
  title,
  description,
  done,
  action,
  children,
  className,
}: WorkspaceStepProps) {
  return (
    <section
      aria-labelledby={`step-${step}-title`}
      className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}
    >
      <header className="flex flex-wrap items-start gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ring-1 transition-colors',
            done
              ? 'bg-success text-success-foreground ring-success/30'
              : 'bg-primary/10 text-primary ring-primary/20',
          )}
          aria-hidden
        >
          {done ? <Check className="size-3.5" /> : step}
        </span>

        <div className="min-w-0 flex-1">
          <h2 id={`step-${step}-title`} className="text-sm font-semibold tracking-tight">
            {title}
          </h2>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
        </div>

        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>

      <div className="p-4 sm:p-5">{children}</div>
    </section>
  )
}
