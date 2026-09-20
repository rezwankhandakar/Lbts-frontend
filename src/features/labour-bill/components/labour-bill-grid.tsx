import { HardHat, Plus, RefreshCcw, SearchX, TriangleAlert } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { LabourBillRecord } from '../types'
import { LabourBillCard } from './labour-bill-card'

interface LabourBillGridProps {
  records: LabourBillRecord[]
  isLoading: boolean
  isFetching: boolean
  errorMessage: string | null
  isFiltered: boolean
  canCreate: boolean
  onRetry: () => void
  onReset: () => void
  onCreate: () => void
}

const GRID = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'

/**
 * Which of the four states the list is in. "Nothing matched" and "nothing yet"
 * are told apart because their fixes differ: one is a filter to clear, the
 * other is a bill to open.
 */
export function LabourBillGrid({
  records,
  isLoading,
  isFetching,
  errorMessage,
  isFiltered,
  canCreate,
  onRetry,
  onReset,
  onCreate,
}: LabourBillGridProps) {
  if (isLoading) {
    return (
      <div className={GRID} aria-busy="true">
        <span className="sr-only">Loading labour bills</span>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-[15.5rem] rounded-xl" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center" role="alert">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">Could not load labour bills</h3>
        <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isFetching}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {isFetching ? 'Retrying…' : 'Try again'}
        </Button>
      </div>
    )
  }

  if (records.length === 0 && isFiltered) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <SearchX className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">No labour bills match</h3>
        <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">
          No labour bill matches the current search, status, CSD, month or year.
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
          Clear filters
        </Button>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <EmptyState
        icon={HardHat}
        title="No labour bills yet"
        description="A labour bill is one CSD's month of handling charges: open a slot, scan the challans in, and type what the van, the pulling and the stairs cost against each model. A month of deliveries is as many bills as there were CSDs in it. It charges nothing the Excel bill charges — that one carries the rate card's transport, this one the labour beside it."
        className="min-h-[22rem] border-dashed shadow-none"
        action={
          canCreate ? (
            <Button onClick={onCreate}>
              <Plus data-icon="inline-start" aria-hidden />
              Open the first labour bill
            </Button>
          ) : undefined
        }
      />
    )
  }

  return (
    <div className={GRID}>
      {records.map((bill) => (
        <LabourBillCard key={bill.id} bill={bill} />
      ))}
    </div>
  )
}
