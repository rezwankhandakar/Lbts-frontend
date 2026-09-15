import { CircleDashed, ListFilter, Search, Truck, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useVendorOptions } from '@/features/vendor/hooks/use-vendors'
import { TRIP_STATUS_META, localToday, monthRange, taka } from '../lib/delivery-meta'
import { TRIP_STATUSES } from '../types'
import type { TripBillFilter, TripFilterPatch, TripListParams, TripStatusFilter } from '../types'

interface TripFiltersProps {
  params: TripListParams
  onChange: (patch: TripFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  summary?: string
  /**
   * Rent and labour across every trip the filters match, not just this page,
   * and how many of those trips have each one still blank.
   */
  totals?: { rent: number; labour: number; blankRent: number; blankLabour: number }
}

const TRIGGER = 'h-8 w-full sm:w-[11rem]'

/**
 * The date ranges somebody actually asks about. Last month is the whole closed
 * calendar month, because that is what a vendor's bill is run over. Computed
 * on every render rather than once, so a page left open past midnight moves.
 */
const DATE_CHIPS: { label: string; range: () => { from: string; to: string } }[] = [
  { label: 'Any date', range: () => ({ from: '', to: '' }) },
  { label: 'Today', range: () => ({ from: localToday(), to: localToday() }) },
  { label: 'This month', range: () => monthRange(0) },
  { label: 'Last month', range: () => monthRange(-1) },
]

/**
 * The trip bill backlog. Pressing one lists only the trips still missing that
 * amount; pressing it again lets go. Counts answer the other filters, so
 * "Last month" plus "No trip rent" is the list of trips a month-end bill is
 * still waiting on.
 */
const BILL_CHIPS: { value: Exclude<TripBillFilter, 'all'>; label: string }[] = [
  { value: 'no-rent', label: 'No trip rent' },
  { value: 'no-labour', label: 'No labour bill' },
]

/**
 * The trips toolbar.
 *
 * The search covers what somebody has in hand: a trip number off a manifest,
 * the last digits of a plate, a driver, a vendor, or any challan on the trip
 * by number or customer. The vendor filter is the one a month-end bill is run
 * over, which is why it sits on the toolbar rather than behind a disclosure.
 */
export function TripFilters({ params, onChange, onReset, isFiltered, summary, totals }: TripFiltersProps) {
  const vendors = useVendorOptions()

  return (
    <div className="border-b">
      <div className="flex flex-col gap-3 p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative flex-1 xl:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              value={params.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Trip, plate, driver, vendor or challan"
              aria-label="Search trips"
              className="pl-8.5"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Select
              value={params.status}
              onValueChange={(value) => onChange({ status: value as TripStatusFilter })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by status">
                <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
                <SelectValue>
                  {(value) =>
                    value && value !== 'all' ? TRIP_STATUS_META[value as keyof typeof TRIP_STATUS_META].label : 'Any status'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Any status</SelectItem>
                  {TRIP_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {TRIP_STATUS_META[status].label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Select
              value={params.vendorId || 'all'}
              onValueChange={(value) => onChange({ vendorId: value === 'all' ? '' : String(value) })}
            >
              <SelectTrigger className={TRIGGER} aria-label="Filter by vendor">
                <SelectValue>
                  {(value) =>
                    value && value !== 'all'
                      ? (vendors.data?.find((vendor) => vendor.id === value)?.name ?? 'Vendor')
                      : 'Every vendor'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">Every vendor</SelectItem>
                  {(vendors.data ?? []).map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={params.from}
                max={params.to || undefined}
                onChange={(event) => onChange({ from: event.target.value })}
                aria-label="Trips from"
                className="h-8 w-full sm:w-[9.5rem]"
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                value={params.to}
                min={params.from || undefined}
                onChange={(event) => onChange({ to: event.target.value })}
                aria-label="Trips until"
                className="h-8 w-full sm:w-[9.5rem]"
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

        <div className="flex flex-wrap items-center gap-1.5">
          {DATE_CHIPS.map((chip) => {
            const range = chip.range()
            const active = params.from === range.from && params.to === range.to

            return (
              <button
                key={chip.label}
                type="button"
                aria-pressed={active}
                onClick={() => onChange(range)}
                className={cn(
                  'rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary/40 bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                {chip.label}
              </button>
            )
          })}

          {totals && (
            <>
              <span className="mx-1 h-4 w-px bg-border" aria-hidden />
              {BILL_CHIPS.map((chip) => {
                const count = chip.value === 'no-rent' ? totals.blankRent : totals.blankLabour
                const active = params.bill === chip.value

                // A backlog chip with nothing behind it is not drawn — unless it
                // is the filter in force, or clearing the last one would remove
                // the only thing saying why the list is empty.
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
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          {summary && <p className="text-xs text-muted-foreground">{summary}</p>}
          {totals && (
            <>
              <span className="inline-flex items-center gap-1 rounded-full border border-tone-amber/25 bg-tone-amber/10 px-2 py-0.5 text-[11px] font-medium text-tone-amber">
                <Truck className="size-3" aria-hidden />
                Trip rent <span className="font-bold tabular-nums">{taka(totals.rent)}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-tone-violet/25 bg-tone-violet/10 px-2 py-0.5 text-[11px] font-medium text-tone-violet">
                <Users className="size-3" aria-hidden />
                Labour bill <span className="font-bold tabular-nums">{taka(totals.labour)}</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-tone-emerald/25 bg-tone-emerald/10 px-2 py-0.5 text-[11px] font-medium text-tone-emerald">
                Total <span className="font-bold tabular-nums">{taka(totals.rent + totals.labour)}</span>
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
