import { Info, PackageSearch, TriangleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { CandidateSelection } from '../hooks/use-candidate-selection'
import type { BillCandidates, BillRecord } from '../types'
import { CandidateGroupCard } from './candidate-group-card'

interface CandidateResultsProps {
  bill: BillRecord
  data: BillCandidates | undefined
  isLoading: boolean
  errorMessage: string | null
  searched: string
  selection: CandidateSelection
  isAdding: boolean
  onAddRows: (rowIds: string[]) => void
}

/** The search's answer, in each of its states. */
export function CandidateResults({
  bill,
  data,
  isLoading,
  errorMessage,
  searched,
  selection,
  isAdding,
  onAddRows,
}: CandidateResultsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3" aria-busy="true">
        <span className="sr-only">Searching the Trip DO sheet</span>
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <TriangleAlert className="mt-px size-4 shrink-0 text-destructive" aria-hidden />
        {errorMessage}
      </div>
    )
  }

  const groups = data?.groups ?? []

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-14 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
          <PackageSearch className="size-5" aria-hidden />
        </div>
        <h3 className="mt-4 text-base font-semibold tracking-tight">
          {searched ? `No Trip DO matches “${searched}”` : 'Nothing left to bill this month'}
        </h3>
        <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">
          {searched
            ? 'Only rows that have a Trip DO set on the Trip DO sheet can be billed. Check the number, or set its Trip DO there first.'
            : `Every ${bill.unit} Trip DO dated ${bill.periodLabel} is already on a bill. Search by Trip DO to add one from another month.`}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-3">
      {data?.truncated && (
        <p className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Info className="size-3.5 shrink-0" aria-hidden />
          More rows match than one search shows. Type more of the Trip DO to narrow it.
        </p>
      )}
      {groups.map((group) => (
        <CandidateGroupCard
          key={group.tripDoKey}
          group={group}
          bill={bill}
          selection={selection}
          isAdding={isAdding}
          onAddRows={onAddRows}
        />
      ))}
    </div>
  )
}
