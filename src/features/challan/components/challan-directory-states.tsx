import { FileStack, Plus, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'

/**
 * Shaped like the populated card grid so the swap to real records does not
 * jolt the layout. Deliberately not fake challans — a skeleton reads as
 * "loading", invented records read as data.
 */
export function ChallanDirectorySkeleton({ rows = 4 }: { rows?: number }) {
  const t = useT()

  return (
    <div className="grid gap-3 bg-muted/30 p-3 lg:grid-cols-2" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('challan.list.loading')}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="rounded-xl border bg-card shadow-xs">
          <div className="flex items-start gap-3 border-b px-4 py-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-48 max-w-full" />
              <Skeleton className="h-3.5 w-36 max-w-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-12 shrink-0" />
          </div>

          <div className="space-y-2 px-4 pt-3">
            <Skeleton className="h-3 w-full max-w-[18rem]" />
            <Skeleton className="h-3 w-28" />
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-8 shrink-0" />
          </div>

          <div className="flex items-center gap-3 border-t bg-muted/20 px-4 py-2.5">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="ml-auto h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  )
}

interface EmptyProps {
  isFiltered: boolean
  canCreate: boolean
  onReset: () => void
}

/**
 * "Nothing matched" and "nothing exists yet" are separated because the fix is
 * different: one is a filter to clear, the other is a PDF to open.
 */
export function ChallanDirectoryEmpty({ isFiltered, canCreate, onReset }: EmptyProps) {
  const t = useT()

  const Icon = isFiltered ? SearchX : FileStack

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-5" aria-hidden />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {isFiltered ? t('challan.list.noneFound') : t('challan.list.noneYet')}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {isFiltered
          ? t('challan.list.filteredHint')
          : t('challan.list.emptyHint')}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onReset}>
            {t('common.actions.clearFilters')}
          </Button>
        )}
        {canCreate && (
          <Button size="sm" render={<Link to="/challan/new" />}>
            <Plus data-icon="inline-start" aria-hidden />
            {t('challan.openChallanPdf')}
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

export function ChallanDirectoryError({ message, onRetry, isRetrying }: ErrorProps) {
  const t = useT()

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {t('challan.list.loadFailed')}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isRetrying}>
        <RefreshCcw data-icon="inline-start" aria-hidden />
        {isRetrying ? t('challan.list.retrying') : t('common.actions.retry')}
      </Button>
    </div>
  )
}
