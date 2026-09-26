import { useId, useState } from 'react'
import { Loader2, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVehicleSearch } from '../hooks/use-trip-lookups'
import type { TripVehicleOption } from '../types'
import { VehicleSearchResults } from './vehicle-search-results'
import { useT } from '@/lib/i18n'

/** What the hint points at: the tail somebody types, and the plate it finds. */
const EXAMPLE_DIGITS = '1234'
const EXAMPLE_PLATE = 'DHAKA METRO-TA-11-1234'

interface VehicleSearchProps {
  onSelect: (option: TripVehicleOption) => void
  autoFocus?: boolean
}

/**
 * Finding the lorry by the digits on its back.
 *
 * An operator standing at a gate reads the last four digits off the plate and
 * types them; that is the whole design. The search is server-side, debounced,
 * and ranks a plate that *ends* with the digits above one that merely contains
 * them. Full plates, spacing, hyphens, case and Bangla digits all work, because
 * the server matches on the same key the fleet is stored under.
 *
 * Only vehicles that can take a trip are offered — the server decides that,
 * not this list. Ones that matched and cannot are named underneath with the
 * reason, so a lorry that is missing is explained rather than mysterious.
 *
 * A combobox in the ARIA sense: arrows move, Enter chooses, Escape clears.
 */
export function VehicleSearch({ onSelect, autoFocus }: VehicleSearchProps) {
  const t = useT()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const search = useVehicleSearch(query)

  const typed = query.trim()
  const results = search.data?.results ?? []
  const waiting = typed.length >= 2 && (search.debounced !== typed || search.isFetching)
  const highlighted = Math.min(active, Math.max(0, results.length - 1))

  const choose = (option: TripVehicleOption | undefined) => {
    if (option) {
      onSelect(option)
      setQuery('')
      setActive(0)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${listId}-input`}>{t('delivery.vehicle.registrationNumber')}</Label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            id={`${listId}-input`}
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls={listId}
            aria-activedescendant={results.length > 0 ? `${listId}-${highlighted}` : undefined}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            autoFocus={autoFocus}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActive((current) => Math.min(current + 1, results.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActive((current) => Math.max(current - 1, 0))
              } else if (event.key === 'Enter') {
                event.preventDefault()
                choose(results[highlighted])
              } else if (event.key === 'Escape') {
                setQuery('')
              }
            }}
            className="h-11 pl-9 font-mono text-base tracking-tight"
          />
          {waiting && (
            <Loader2
              className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
        <p className="text-xs leading-snug text-muted-foreground">
          {/* The two examples are data rather than copy, so they stay out of
              the dictionary and read the same in every language. */}
          {t('delivery.vehicle.searchHint', {
            digits: EXAMPLE_DIGITS,
            plate: EXAMPLE_PLATE,
          })}
        </p>
      </div>

      <VehicleSearchResults
        listId={listId}
        query={search.debounced}
        typed={typed}
        data={search.data}
        isError={search.isError}
        errorMessage={search.error?.message}
        waiting={waiting}
        highlighted={highlighted}
        onHover={setActive}
        onChoose={(index) => choose(results[index])}
      />
    </div>
  )
}
