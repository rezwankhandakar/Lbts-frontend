import { Plus, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * The three states every list in this module can be in besides "rows".
 *
 * Shared rather than written five times, because the wording differs and the
 * shape must not: five hand-rolled empty states drift into five different
 * paddings, and a tab that jumps when it finishes loading is the most visible
 * kind of unpolish there is.
 */

/**
 * Shaped like a populated list so the swap to real rows does not jolt the
 * layout. Deliberately not fake vehicles — a skeleton reads as "loading",
 * invented registration numbers read as data.
 */
export function PanelSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="divide-y" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5">
          <Skeleton className="size-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-48 max-w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="hidden h-5 w-24 rounded-full sm:block" />
          <Skeleton className="size-7 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

interface PanelEmptyProps {
  icon: LucideIcon
  /** "No vehicles added yet" — what is missing, not "no results". */
  title: string
  description: string
  isFiltered: boolean
  onReset?: () => void
  /** The call to action, when the viewer is allowed to take it. */
  action?: { label: string; onClick: () => void }
}

/**
 * "Nothing matched" and "nothing exists yet" are separated because the fix is
 * different: one is a filter to clear, the other is a record to add. A read-only
 * viewer gets the sentence without the button, rather than a button that would
 * be refused.
 */
export function PanelEmpty({
  icon: Icon,
  title,
  description,
  isFiltered,
  onReset,
  action,
}: PanelEmptyProps) {
  const Glyph = isFiltered ? SearchX : Icon

  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Glyph className="size-5" aria-hidden />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {isFiltered ? 'Nothing matches these filters' : title}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {isFiltered ? 'Try widening or clearing them to see the rest.' : description}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && onReset && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        )}
        {!isFiltered && action && (
          <Button size="sm" onClick={action.onClick}>
            <Plus data-icon="inline-start" aria-hidden />
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}

interface PanelErrorProps {
  title: string
  message: string
  onRetry: () => void
  isRetrying: boolean
}

export function PanelError({ title, message, onRetry, isRetrying }: PanelErrorProps) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center" role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isRetrying}>
        <RefreshCcw data-icon="inline-start" aria-hidden />
        {isRetrying ? 'Retrying…' : 'Try again'}
      </Button>
    </div>
  )
}

/**
 * A tab's own frame: a raised panel on the content canvas, matching the three
 * surface levels the shell already uses.
 */
export function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      {children}
    </section>
  )
}
