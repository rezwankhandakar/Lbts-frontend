import { Layers, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { ChallanBatchRecord } from '../types'
import { BatchTable } from './batch-table'

interface BatchDirectoryProps {
  records: ChallanBatchRecord[]
  isLoading: boolean
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  canWrite: boolean
  onRetry: () => void
  onReset: () => void
}

/**
 * Which of the four states the list is in: loading, failed, empty, or rows.
 *
 * Kept apart from the page so the page reads as composition and each state can
 * be given the wording it deserves — "nothing matched your filters" and "no
 * source PDF has been processed yet" have different fixes, and the second one
 * is a genuine blank slate rather than a fault.
 */
export function BatchDirectory({
  records,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  canWrite,
  onRetry,
  onReset,
}: BatchDirectoryProps) {
  if (isLoading) {
    return (
      <div className="divide-y" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading source PDFs</span>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3.5">
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-64 max-w-full" />
              <Skeleton className="h-3 w-44" />
            </div>
            <Skeleton className="hidden h-1.5 w-28 rounded-full sm:block" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">Could not load source PDFs</h3>
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
          {errorMessage}
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={onRetry}
          disabled={isFetching}
        >
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {isFetching ? 'Retrying…' : 'Try again'}
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return <EmptyState isFiltered={isFiltered} canWrite={canWrite} onReset={onReset} />
  }

  return <BatchTable records={records} />
}

interface EmptyProps {
  isFiltered: boolean
  canWrite: boolean
  onReset: () => void
}

/**
 * "Nothing matched" and "nothing here yet" are separated because the fix is
 * different: one is a filter to clear, the other is a file to open.
 *
 * The blank slate is worth saying plainly rather than apologising for. A batch
 * is created by the *first challan filed out of a file*, never by opening one
 * — so an empty list means nobody has filed anything yet, not that something
 * failed to record.
 */
function EmptyState({ isFiltered, canWrite, onReset }: EmptyProps) {
  const Icon = isFiltered ? SearchX : Layers

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-5" aria-hidden />
      </div>

      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {isFiltered ? 'No source PDFs found' : 'No source PDFs yet'}
      </h3>

      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
        {isFiltered
          ? 'No source file matches your current filters.'
          : 'A source PDF appears here as soon as the first challan is filed out of it. Opening a file records nothing on its own — the file itself is never stored.'}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {isFiltered && (
          <Button variant="outline" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        )}
        {!isFiltered && canWrite && (
          <Button size="sm" render={<Link to="/challan/new" />}>
            Open a challan PDF
          </Button>
        )}
      </div>
    </div>
  )
}
