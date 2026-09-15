import { Ban, Truck } from 'lucide-react'
import type { VehicleSearchResult } from '../types'
import { VehicleResultItem } from './vehicle-result-item'

export interface VehicleSearchResultsProps {
  listId: string
  /** The query the results answer — what the plates are highlighted against. */
  query: string
  /** What is in the box right now, which may be ahead of `query`. */
  typed: string
  data: VehicleSearchResult | undefined
  isError: boolean
  errorMessage?: string
  waiting: boolean
  highlighted: number
  onHover: (index: number) => void
  onChoose: (index: number) => void
}

/**
 * What the vehicle box shows under itself: a hint before anything is typed, the
 * matches, and the matches that cannot take a trip with the reason for each.
 */
export function VehicleSearchResults({
  listId,
  query,
  typed,
  data,
  isError,
  errorMessage,
  waiting,
  highlighted,
  onHover,
  onChoose,
}: VehicleSearchResultsProps) {
  if (typed.length < 2) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
        <Truck className="size-5 shrink-0 text-primary/70" aria-hidden />
        The vehicle&apos;s vendor and its assigned driver fill in as soon as you choose it.
      </div>
    )
  }

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        {errorMessage ?? 'The vehicle search failed.'}
      </p>
    )
  }

  const results = data?.results ?? []

  return (
    <div className="space-y-2" aria-busy={waiting}>
      {results.length > 0 ? (
        <ul id={listId} role="listbox" aria-label="Matching vehicles" className="space-y-1">
          {results.map((option, index) => (
            <VehicleResultItem
              key={option.vehicle.id}
              id={`${listId}-${index}`}
              option={option}
              query={query}
              active={index === highlighted}
              onHover={() => onHover(index)}
              onSelect={() => onChoose(index)}
            />
          ))}
        </ul>
      ) : (
        !waiting &&
        data && (
          <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            No vehicle that can take a trip matches{' '}
            <span className="font-mono font-medium text-foreground">{query}</span>.
          </p>
        )
      )}

      {data && data.unavailableCount > 0 && (
        <div className="rounded-lg border bg-muted/30 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Ban className="size-3.5" aria-hidden />
            {data.unavailableCount === 1
              ? '1 matching vehicle cannot take a trip'
              : `${data.unavailableCount} matching vehicles cannot take a trip`}
          </p>
          <ul className="mt-1.5 space-y-1">
            {data.unavailable.map((vehicle) => (
              <li key={vehicle.id} className="text-xs text-muted-foreground">
                <span className="font-mono font-medium text-foreground">
                  {vehicle.registrationNo}
                </span>{' '}
                · {vehicle.vendorName} · {vehicle.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
