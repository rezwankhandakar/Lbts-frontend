import { Plus, RefreshCcw, Route, SearchX, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripCards } from './trip-cards'
import { TripTable } from './trip-table'

interface TripDirectoryProps {
  records: TripRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  canWrite: boolean
  actions: TripActions
  onRetry: () => void
  onReset: () => void
}

/**
 * The list body, in each of its states. A cold Render instance can take most
 * of a minute to answer, so the first load is a skeleton that looks like the
 * table it becomes rather than a spinner that looks like a fault.
 */
export function TripDirectory({
  records,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  canWrite,
  actions,
  onRetry,
  onReset,
}: TripDirectoryProps) {
  const t = useT()

  if (isLoading) {
    return (
      <div className="space-y-2 p-4" aria-busy="true">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <TriangleAlert className="size-6 text-destructive" aria-hidden />
        <p className="mt-3 text-sm font-medium">{t('delivery.list.loadFailed')}</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {t('common.actions.retry')}
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          {isFiltered ? <SearchX className="size-5" aria-hidden /> : <Route className="size-5" aria-hidden />}
        </span>
        <p className="mt-3 text-sm font-semibold">
          {isFiltered ? t('delivery.list.noMatches') : t('delivery.list.empty')}
        </p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          {isFiltered
            ? t('delivery.list.filteredHint')
            : t('delivery.list.emptyHint')}
        </p>
        {isFiltered ? (
          <Button variant="outline" size="sm" className="mt-4" onClick={onReset}>
            {t('common.actions.clearFilters')}
          </Button>
        ) : (
          canWrite && (
            <Button size="sm" className="mt-4" render={<Link to="/delivery/new" />}>
              <Plus data-icon="inline-start" aria-hidden />
              {t('delivery.list.createFirst')}
            </Button>
          )
        )}
      </div>
    )
  }

  return (
    <div className={cn('transition-opacity', isFetching && 'opacity-60')} aria-busy={isFetching}>
      <TripTable records={records} actions={actions} />
      <TripCards records={records} actions={actions} />
    </div>
  )
}
