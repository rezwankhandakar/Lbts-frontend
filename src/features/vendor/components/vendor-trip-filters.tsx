import type { ReactNode } from 'react'
import { CircleDashed, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { localToday, monthRange, plural, taka } from '@/features/delivery/lib/delivery-meta'
import { cn } from '@/lib/utils'
import type { VendorTripFilterPatch, VendorTripListParams, VendorTripPageMeta } from '../types'
import { MonthlyBill } from './vendor-trip-monthly-bill'

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

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
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
export function VendorTripFilters({
  params,
  onChange,
  onReset,
  isFiltered,
  meta,
}: VendorTripFiltersProps) {
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

        {/* The two dates share one line even on a phone, each taking half; the Clear button wraps under them. */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <Input
              type="date"
              value={params.from}
              max={params.to || undefined}
              onChange={(event) => onChange({ from: event.target.value })}
              aria-label="Trips from"
              className="h-8 min-w-0 flex-1 sm:w-38 sm:flex-none"
            />
            <span className="shrink-0 text-xs text-muted-foreground">to</span>
            <Input
              type="date"
              value={params.to}
              min={params.from || undefined}
              onChange={(event) => onChange({ to: event.target.value })}
              aria-label="Trips until"
              className="h-8 min-w-0 flex-1 sm:w-38 sm:flex-none"
            />
          </div>
          {isFiltered && (
            <Button variant="ghost" size="sm" onClick={onReset}>
              <X data-icon="inline-start" aria-hidden />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Dates and status are two rows on a phone, one row with a divider once there is room. */}
      <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center">
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
        </div>
        <span className="mx-1 hidden h-4 w-px bg-border sm:block" aria-hidden />
        <div className="flex flex-wrap items-center gap-1.5">
          {STATUS_CHIPS.map((chip) => (
            <Chip
              key={chip.value}
              active={params.status === chip.value}
              onClick={() => onChange({ status: chip.value })}
            >
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
                  <span className="rounded-full bg-tone-rose/15 px-1.5 font-bold tabular-nums">
                    {count}
                  </span>
                </button>
              )
            })}
        </div>
      </div>

      {meta && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {plural(meta.total, 'trip')} · {plural(meta.totalQty, 'piece')} · Trip rent{' '}
            {taka(meta.totalRent)} · Labour bill {taka(meta.totalLabour)}
          </p>
          <MonthlyBill bill={meta.monthlyBill} />
        </div>
      )}
    </div>
  )
}
