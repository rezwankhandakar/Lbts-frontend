import { Loader2, Search, Truck } from 'lucide-react'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'
import { useTripOptions } from '../hooks/use-accounts'
import { formatDay, taka } from '../lib/accounts-meta'
import type { TripOption } from '../types'
import { LockedValue } from './entry-field'
import type { KindFieldsProps } from './entry-kind-fields'

function billLine(trip: TripOption): string {
  const bill = trip.tripRent === null && trip.labourBill === null ? 'bill not entered' : `bill ${taka(trip.bill)}`
  return trip.advance > 0 ? `${bill} · ${taka(trip.advance)} advanced` : bill
}

/**
 * The trip an advance is paid against. Searched by trip number, vendor, driver
 * or the last digits of the plate — the way somebody at the counter knows a
 * lorry — and the newest trips are offered before anything is typed.
 */
export function TripField({ draft, set, errors, request }: KindFieldsProps) {
  const [q, setQ] = useState('')
  const debounced = useDebouncedValue(q.trim(), 300)
  const locked = request.locked?.includes('tripId')
  const options = useTripOptions(debounced, !locked)
  const [chosen, setChosen] = useState<TripOption | null>(null)

  const existing = request.entry?.trip
  const selected = chosen?.id === draft.tripId ? chosen : (options.data?.find((trip) => trip.id === draft.tripId) ?? null)

  if (locked) {
    return (
      <LockedValue
        label="Trip"
        value={request.tripSummary?.label ?? existing?.tripNumber ?? 'Selected trip'}
        detail={request.tripSummary?.detail}
      />
    )
  }

  return (
    <div className="grid gap-2">
      <Label htmlFor="entry-trip-search">Trip</Label>
      {(selected || existing) && draft.tripId && (
        <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2.5">
          <Truck className="size-4 shrink-0 text-primary" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {selected?.tripNumber ?? existing?.tripNumber} · {selected?.vendor.name ?? ''}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {selected
                ? `${selected.registrationNo} · ${formatDay(selected.tripDate)} · ${billLine(selected)}`
                : `${existing?.registrationNo} · ${formatDay(existing?.tripDate ?? null)}`}
            </p>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          id="entry-trip-search"
          type="search"
          value={q}
          autoComplete="off"
          aria-describedby="entry-trip-hint"
          aria-invalid={Boolean(errors.tripId)}
          onChange={(event) => setQ(event.target.value)}
          className="pl-8.5"
        />
        {options.isFetching && (
          <Loader2 className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        )}
      </div>
      <p id="entry-trip-hint" className={cn('text-xs', errors.tripId ? 'text-destructive' : 'text-muted-foreground')}>
        {errors.tripId ?? 'Search by trip number, vendor, driver or plate digits.'}
      </p>

      <ul className="grid max-h-56 gap-1 overflow-y-auto rounded-lg border p-1" aria-label="Trips">
        {(options.data ?? []).map((trip) => (
          <li key={trip.id}>
            <button
              type="button"
              aria-pressed={trip.id === draft.tripId}
              onClick={() => {
                setChosen(trip)
                set({ tripId: trip.id })
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                trip.id === draft.tripId ? 'bg-primary/10' : 'hover:bg-muted',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {trip.tripNumber} <span className="font-normal text-muted-foreground">· {trip.vendor.name}</span>
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {trip.registrationNo} · {trip.driverName} · {formatDay(trip.tripDate)}
                </span>
              </span>
              <span className="shrink-0 text-right text-xs text-muted-foreground tabular-nums">{billLine(trip)}</span>
            </button>
          </li>
        ))}
        {options.data?.length === 0 && <li className="px-2.5 py-3 text-xs text-muted-foreground">No trip matches.</li>}
        {options.isPending && <li className="px-2.5 py-3 text-xs text-muted-foreground">Loading trips…</li>}
      </ul>
    </div>
  )
}
