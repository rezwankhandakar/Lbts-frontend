import { useId, useState } from 'react'
import { Loader2, ScanBarcode, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useChallanSearch } from '../hooks/use-trip-lookups'
import type { ScanOutcome } from '../hooks/use-challan-scan'
import { isChallanCode } from '@/lib/barcode-wedge'
import { hasChallan } from '../lib/cart'
import type { CartState, ChallanCandidate } from '../types'
import { ChallanCandidateItem } from './challan-candidate-item'
import { ScannerStatus } from './scanner-status'
import { useT } from '@/lib/i18n'

interface ChallanFinderProps {
  cart: CartState
  onAdd: (candidate: ChallanCandidate) => void
  onScan: (code: string) => void
  scanPending: boolean
  lastScan: ScanOutcome | null
  /** Whether a barcode read anywhere on the page is being listened for. */
  listening: boolean
  excludeTripId?: string
}

/**
 * Putting challans on the trip: by search, or by scanning the printed barcode.
 *
 * One box for both, because a keyboard-wedge scanner *is* a keyboard — if this
 * box has focus when a barcode is read, the number lands here followed by
 * Enter, and Enter on anything shaped like a challan number is an exact lookup
 * rather than a search. With no field focused, the page listens for the
 * scanner by itself; see `useBarcodeWedge`.
 *
 * The search reads the challan number, the SL, the customer and the receiver's
 * number — the identifiers somebody at a gate actually has.
 */
export function ChallanFinder({
  cart,
  onAdd,
  onScan,
  scanPending,
  lastScan,
  listening,
  excludeTripId,
}: ChallanFinderProps) {
  const t = useT()

  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const listId = useId()
  const search = useChallanSearch(query, excludeTripId)

  const typed = query.trim()
  const results = typed.length >= 3 ? (search.data ?? []) : []
  const highlighted = Math.min(active, Math.max(0, results.length - 1))
  const waiting = typed.length >= 3 && (search.debounced !== typed || search.isFetching)

  const add = (candidate: ChallanCandidate | undefined) => {
    if (candidate && !hasChallan(cart, candidate.id)) {
      onAdd(candidate)
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor={`${listId}-input`}>{t('delivery.finder.label')}</Label>
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
            autoComplete="off"
            spellCheck={false}
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
                if (isChallanCode(typed)) {
                  onScan(typed)
                  setQuery('')
                } else {
                  add(results[highlighted])
                }
              } else if (event.key === 'Escape') {
                setQuery('')
              }
            }}
            className="h-11 pr-10 pl-9"
          />
          {waiting || scanPending ? (
            <Loader2
              className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          ) : (
            <ScanBarcode
              className="absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
        <p className="text-xs leading-snug text-muted-foreground">
          {t('delivery.finder.hint')}
        </p>
      </div>

      <ScannerStatus listening={listening} pending={scanPending} last={lastScan} />

      {typed.length >= 3 && search.isError && (
        <p role="alert" className="text-sm text-destructive">
          {search.error.message}
        </p>
      )}

      {results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('delivery.finder.matchesAria')}
          className="max-h-[26rem] space-y-1 overflow-y-auto rounded-lg border bg-background p-1"
        >
          {results.map((candidate, index) => (
            <ChallanCandidateItem
              key={candidate.id}
              id={`${listId}-${index}`}
              candidate={candidate}
              inCart={hasChallan(cart, candidate.id)}
              active={index === highlighted}
              onHover={() => setActive(index)}
              onAdd={() => add(candidate)}
            />
          ))}
        </ul>
      )}

      {typed.length >= 3 && !waiting && search.data && results.length === 0 && (
        <p className="rounded-lg border border-dashed px-4 py-4 text-center text-sm text-muted-foreground">
          {t('delivery.noChallanMatches', { query: typed })}
        </p>
      )}
    </div>
  )
}
