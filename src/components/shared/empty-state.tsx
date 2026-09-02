import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  badge?: string
  footnote?: string
  action?: ReactNode
  className?: string
}

/**
 * The shared "nothing here yet" surface. A deliberate, centred panel rather
 * than a small card adrift in the canvas — an unfinished area should still
 * read as a designed state.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
  footnote,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'relative flex min-h-[26rem] items-center justify-center overflow-hidden rounded-xl border bg-card px-6 py-14 shadow-sm',
        className,
      )}
    >
      {/* Faint dot field, fading out downward, for depth without decoration. */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-size:22px_22px] text-border opacity-70"
        aria-hidden
      />

      <div className="relative flex max-w-sm flex-col items-center text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-6" aria-hidden />
        </div>

        {badge && (
          <Badge variant="secondary" className="mt-5">
            {badge}
          </Badge>
        )}

        <h2 className="mt-4 text-lg font-semibold tracking-tight text-balance">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {description}
        </p>

        {action && <div className="mt-6">{action}</div>}

        {footnote && (
          <p className="mt-6 text-xs tracking-wide text-muted-foreground/70">{footnote}</p>
        )}
      </div>
    </div>
  )
}
