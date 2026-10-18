import { ArrowRight, CalendarRange, ListFilter, Search, Store, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useT } from '@/lib/i18n'
import { tripStatusMeta } from '../lib/delivery-meta'
import { TRIP_STATUSES } from '../types'
import type { TripFilterPatch, TripListParams, TripStatusFilter } from '../types'

interface TripFiltersProps {
  params: TripListParams
  onChange: (patch: TripFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
}

const TRIGGER = 'h-9 w-full text-[13px] sm:w-[11.5rem]'

/** A date box inside the range control: the control draws the border, not the box. */
const DAY =
  'h-8 w-full min-w-0 border-0 bg-transparent px-1.5 shadow-none md:text-[13px] focus-visible:ring-0 sm:w-[8.75rem] dark:bg-transparent'

/**
 * The trips toolbar: one row of controls at the size they are read at.
 *
 * The search covers what somebody has in hand: a trip number off a manifest,
 * the last digits of a plate, a driver, a vendor, or any challan on the trip
 * by number or customer. The vendor filter is the one a month-end bill is run
 * over, which is why it sits on the toolbar rather than behind a disclosure.
 *
 * The two dates are **one control** — a range is one question, and two loose
 * boxes with an English "to" between them were two questions and a word that
 * did not translate. The quick ranges and the bill backlog sit on the row
 * beneath (`TripFilterChips`).
 */
export function TripFilters({ params, onChange, onReset, isFiltered }: TripFiltersProps) {
  const t = useT()

  const vendors = useVendorOptions()

  return (
    <div className="flex flex-col gap-2.5 lg:flex-row lg:flex-wrap lg:items-center">
      <div className="relative min-w-0 flex-1 lg:min-w-64">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          type="search"
          value={params.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder={t('delivery.filters.searchPlaceholder')}
          aria-label={t('delivery.filters.searchAria')}
          className="h-9 pl-9 md:text-[13px]"
        />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Select value={params.status} onValueChange={(value) => onChange({ status: value as TripStatusFilter })}>
          <SelectTrigger className={TRIGGER} aria-label={t('delivery.filters.statusAria')}>
            <ListFilter className="size-3.5 text-muted-foreground" aria-hidden />
            <SelectValue>
              {(value) =>
                value && value !== 'all' ? tripStatusMeta(String(value), t).label : t('delivery.filters.anyStatus')
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('delivery.filters.anyStatus')}</SelectItem>
              {TRIP_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {tripStatusMeta(status, t).label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          value={params.vendorId || 'all'}
          onValueChange={(value) => onChange({ vendorId: value === 'all' ? '' : String(value) })}
        >
          <SelectTrigger className={TRIGGER} aria-label={t('delivery.filters.vendorAria')}>
            <Store className="size-3.5 text-muted-foreground" aria-hidden />
            <SelectValue>
              {(value) =>
                value && value !== 'all'
                  ? (vendors.data?.find((vendor) => vendor.id === value)?.name ?? t('common.labels.vendor'))
                  : t('delivery.filters.everyVendor')
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="all">{t('delivery.filters.everyVendor')}</SelectItem>
              {(vendors.data ?? []).map((vendor) => (
                <SelectItem key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        <div className="flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-2 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30">
          <CalendarRange className="hidden size-4 shrink-0 text-muted-foreground sm:block" aria-hidden />
          <Input
            type="date"
            value={params.from}
            max={params.to || undefined}
            onChange={(event) => onChange({ from: event.target.value })}
            aria-label={t('delivery.filters.fromAria')}
            className={DAY}
          />
          <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <Input
            type="date"
            value={params.to}
            min={params.from || undefined}
            onChange={(event) => onChange({ to: event.target.value })}
            aria-label={t('delivery.filters.untilAria')}
            className={DAY}
          />
        </div>

        {isFiltered && (
          <Button variant="ghost" className="h-9 text-[13px] text-muted-foreground" onClick={onReset}>
            <X data-icon="inline-start" aria-hidden />
            {t('common.actions.clear')}
          </Button>
        )}
      </div>
    </div>
  )
}
