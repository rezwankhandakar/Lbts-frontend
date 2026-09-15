import { FileSpreadsheet, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TripDoSheet } from './trip-do-sheet'
import type { TripDoSheetProps } from './trip-do-sheet'

interface TripDoDirectoryProps extends Omit<TripDoSheetProps, 'empty'> {
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  isFiltered: boolean
  onRetry: () => void
  onReset: () => void
}

/**
 * Which of the four states the sheet is in. "Nothing matched" and "nothing yet"
 * are told apart because their fixes differ: one is a filter to clear, the
 * other is a challan to file — the sheet fills itself from challans.
 */
export function TripDoDirectory({
  rows,
  isLoading,
  isFetching,
  errorMessage,
  isFiltered,
  onRetry,
  onReset,
  ...sheet
}: TripDoDirectoryProps) {
  if (isLoading) {
    return (
      <div className="divide-y" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading the Trip DO sheet</span>
        {Array.from({ length: 10 }, (_, index) => (
          <div key={index} className="flex items-center gap-4 px-4 py-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-40 max-w-full flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-10" />
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">Could not load the sheet</h3>
        <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isFetching}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {isFetching ? 'Retrying…' : 'Try again'}
        </Button>
      </div>
    )
  }

  if (rows.length === 0 && isFiltered) {
    // The sheet stays, header and filter row included: the filter that emptied
    // it is in that row, and removing the row would take it out of reach.
    return (
      <TripDoSheet
        rows={rows}
        {...sheet}
        empty={
          <div className="flex flex-col items-center px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <SearchX className="size-5" aria-hidden />
            </div>
            <h3 className="mt-4 text-base font-semibold tracking-tight">No rows match</h3>
            <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">
              No challan product line, return or re-send matches the current filters.
            </p>
            <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
              Clear filters
            </Button>
          </div>
        }
      />
    )
  }

  if (rows.length === 0) {
    const Icon = FileSpreadsheet
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <Icon className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">
          {isFiltered ? 'No rows match' : 'The sheet is empty'}
        </h3>
        <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">
          {isFiltered
            ? 'No challan product line, return or re-send matches the current filters.'
            : 'Every product line of every filed challan appears here on its own. File a challan and its lines arrive on the sheet, ready for a Trip DO.'}
        </p>
        {isFiltered && (
          <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
            Clear filters
          </Button>
        )}
      </div>
    )
  }

  return <TripDoSheet rows={rows} {...sheet} />
}
