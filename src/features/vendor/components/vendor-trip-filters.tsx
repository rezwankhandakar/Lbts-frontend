import type { ReactNode } from 'react'
import { CircleDashed, Search, Truck, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { localToday, monthRange, plural, taka } from '@/features/delivery/lib/delivery-meta'
import { cn } from '@/lib/utils'
import type { VendorTripFilterPatch, VendorTripListParams, VendorTripPageMeta } from '../types'

interface VendorTripFiltersProps {
  params: VendorTripListParams
  onChange: (patch: VendorTripFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  /** Totals and backlog counts for the matching trips, once they have loaded. */
  meta?: VendorTripPageMeta
}

const DATE_CHIPS: { label: string; range: () => { from: string; to: string } }[] = [
  { label: 'Any date', range: () => ({ from: '', to: '' }) },
  { label: 'Today', range: () => ({ from: localToday(), to: localToday() }) },
  { label: 'This month', range: () => monthRange(0) },
  { label: 'Last month', range: () => monthRange(-1) },
]

const STATUS_CHIPS: { value: VendorTripListParams['status']; label: string }[] = [
  { value: 'all', label: 'Any status' },
  { value: 'Open', label: 'Awaiting copy' },
  { value: 'Completed', label: 'Completed' },
]

const BILL_CHIPS: { value: Exclude<VendorTripListParams['bill'], 'all'>; label: string }[] = [
  { value: 'no-rent', label: 'No trip rent' },
  { value: 'no-labour', label: 'No labour bill' },
]

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
        active
          ? 'border-primary/40 bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

/**
 * The Trips tab's toolbar: a search, a custom date range with the common ranges
 * as chips beside it, the status, the bill backlog, and the totals for whatever
 * all of that matches.
 *
 * The date boxes and the chips write the same two values, so picking "Last
 * month" fills the boxes and typing that month's first and last day lights the
 * chip. The bill chips are the Delivery list's: hidden when nothing is missing,
 * kept while pressed, and pressed again to let go.
 */
export function VendorTripFilters({ params, onChange, onReset, isFiltered, meta }: VendorTripFiltersProps) {
  return (
    <div className="space-y-3 border-b p-3 sm:p-4">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <div className="relative flex-1 xl:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={params.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Trip number, plate or driver"
            aria-label="Search trips"
            className="pl-8.5"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            value={params.from}
            max={params.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
            aria-label="Trips from"
            className="h-8 w-full sm:w-38"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={params.to}
            min={params.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
            aria-label="Trips until"
            className="h-8 w-full sm:w-38"
          />
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X data-icon="inline-start" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {DATE_CHIPS.map((chip) => {
          const range = chip.range()
          return (
            <Chip
              key={chip.label}
              active={params.from === range.from && params.to === range.to}
              onClick={() => onChange(range)}
            >
              {chip.label}
            </Chip>
          )
        })}
        <span className="mx-1 h-4 w-px bg-border" aria-hidden />
        {STATUS_CHIPS.map((chip) => (
          <Chip key={chip.value} active={params.status === chip.value} onClick={() => onChange({ status: chip.value })}>
            {chip.label}
          </Chip>
        ))}

        {meta &&
          BILL_CHIPS.map((chip) => {
            const count = chip.value === 'no-rent' ? meta.blankRent : meta.blankLabour
            const active = params.bill === chip.value
            if (count === 0 && !active) {
              return null
            }

            return (
              <button
                key={chip.value}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ bill: active ? 'all' : chip.value })}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-tone-rose/40 bg-tone-rose/15 text-tone-rose'
                    : 'border-tone-rose/25 text-tone-rose hover:bg-tone-rose/10',
                )}
              >
                <CircleDashed className="size-3" aria-hidden />
                {chip.label}
                <span className="rounded-full bg-tone-rose/15 px-1.5 font-bold tabular-nums">{count}</span>
              </button>
            )
          })}
      </div>

      {meta && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <p className="text-xs text-muted-foreground">
            {plural(meta.total, 'trip')} · {plural(meta.totalQty, 'piece')}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full border border-tone-amber/25 bg-tone-amber/10 px-2 py-0.5 text-[11px] font-medium text-tone-amber">
            <Truck className="size-3" aria-hidden />
            Trip rent <span className="font-bold tabular-nums">{taka(meta.totalRent)}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-tone-violet/25 bg-tone-violet/10 px-2 py-0.5 text-[11px] font-medium text-tone-violet">
            <Users className="size-3" aria-hidden />
            Labour bill <span className="font-bold tabular-nums">{taka(meta.totalLabour)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
