import { FileStack, Plus, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'

/**
 * Shaped like a populated list so the swap to real rows does not jolt the
 * layout. Deliberately not fake gate passes — a skeleton reads as "loading",
 * invented records read as data.
 */
export function GatePassDirectorySkeleton({ rows = 6 }: { rows?: number }) {
  const t = useT()

  return (
    <div className="divide-y" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('gatePass.list.loading')}</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-32 max-w-full" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="hidden h-3 w-24 sm:block" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="size-7 shrink-0 rounded-lg" />
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
 * different: one is a filter to clear, the other is a gate pass to file.
 */
export function GatePassDirectoryEmpty({ isFiltered, canCreate, onReset }: EmptyProps) {
  const t = useT()

  const Icon = isFiltered ? SearchX : FileStack

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-5" aria-hidden />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {isFiltered ? t('gatePass.list.noneFound') : t('gatePass.list.noneYet')}
      </h3>

      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {isFiltered
          ? t('gatePass.list.filteredHint')
          : t('gatePass.list.emptyHint')}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onReset}>
            {t('common.actions.clearFilters')}
          </Button>
        )}
        {canCreate && (
          <Button size="sm" render={<Link to="/gate-pass/new" />}>
            <Plus data-icon="inline-start" aria-hidden />
            {t('gatePass.newGatePass')}
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

export function GatePassDirectoryError({ message, onRetry, isRetrying }: ErrorProps) {
  const t = useT()

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {t('gatePass.list.loadFailed')}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isRetrying}>
        <RefreshCcw data-icon="inline-start" aria-hidden />
        {isRetrying ? t('gatePass.list.retrying') : t('common.actions.retry')}
      </Button>
    </div>
  )
}
