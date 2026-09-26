import { MapPinned, Plus, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'

/**
 * Shaped like a populated list so the swap to real rows does not jolt the
 * layout. Deliberately not fake locations — a skeleton reads as "loading",
 * invented districts read as data.
 */
export function LocationDirectorySkeleton({ rows = 8 }: { rows?: number }) {
  const t = useT()

  return (
    <div className="divide-y" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('location.directory.loading')}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-44 max-w-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="size-7 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

interface EmptyProps {
  isFiltered: boolean
  canManage: boolean
  onReset: () => void
  onAdd: () => void
}

/**
 * "Nothing matched" and "nothing exists yet" are separated because the fix is
 * different: one is a filter to clear, the other is a row to add. The second
 * should be rare — the supplied master list is seeded on first connection —
 * so it says so, since an empty collection is far more likely to be a database
 * that has not connected than a genuine blank slate.
 */
export function LocationDirectoryEmpty({ isFiltered, canManage, onReset, onAdd }: EmptyProps) {
  const t = useT()

  const Icon = isFiltered ? SearchX : MapPinned

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-5" aria-hidden />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {isFiltered ? t('location.directory.noneFound') : t('location.directory.empty')}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {isFiltered
          ? t('location.directory.filteredHint')
          : t('location.directory.emptyHint')}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onReset}>
            {t('common.actions.clearFilters')}
          </Button>
        )}
        {canManage && (
          <Button size="sm" onClick={onAdd}>
            <Plus data-icon="inline-start" aria-hidden />
            {t('location.addFirst')}
          </Button>
        )}
      </div>
    </div>
  )
}

interface ErrorProps {
  message: string
  onRetry: () => void
  isRetrying: boolean
}

export function LocationDirectoryError({ message, onRetry, isRetrying }: ErrorProps) {
  const t = useT()

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {t('location.directory.loadFailed')}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isRetrying}>
        <RefreshCcw data-icon="inline-start" aria-hidden />
        {isRetrying ? t('location.directory.retrying') : t('common.actions.retry')}
      </Button>
    </div>
  )
}
