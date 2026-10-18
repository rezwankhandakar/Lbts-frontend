import { ArrowRight, CalendarRange, CircleDashed, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { localToday, monthRange } from '@/features/delivery/lib/delivery-meta'
import { cn } from '@/lib/utils'
import type { VendorTripFilterPatch, VendorTripListParams, VendorTripPageMeta } from '../types'
import { Segmented } from './segmented'
import { useFormatters, useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

interface VendorTripFiltersProps {
  params: VendorTripListParams
  onChange: (patch: VendorTripFilterPatch) => void
  onReset: () => void
  isFiltered: boolean
  /** The bill backlog counts for the matching trips, once they have loaded. */
  meta?: VendorTripPageMeta
}

const DATE_CHIPS: { key: TranslationKey; range: () => { from: string; to: string } }[] = [
  { key: 'time.anyDate', range: () => ({ from: '', to: '' }) },
  { key: 'time.today', range: () => ({ from: localToday(), to: localToday() }) },
  { key: 'time.thisMonth', range: () => monthRange(0) },
  { key: 'time.lastMonth', range: () => monthRange(-1) },
]

const STATUS_CHIPS: { value: VendorTripListParams['status']; key: TranslationKey }[] = [
  { value: 'all', key: 'vendor.filters.anyStatus' },
  { value: 'Open', key: 'vendor.trip.awaitingCopy' },
  { value: 'Completed', key: 'vendor.trip.completed' },
]

const BILL_CHIPS: { value: Exclude<VendorTripListParams['bill'], 'all'>; key: TranslationKey }[] = [
  { value: 'no-rent', key: 'vendor.trip.noRent' },
  { value: 'no-labour', key: 'vendor.trip.noLabour' },
]

/** A date box inside the range control: the control draws the border, not the box. */
const DAY =
  'h-9 w-full min-w-0 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 md:text-sm dark:bg-transparent'

/**
 * The trips toolbar: what somebody has in hand (a trip number, a plate, a
 * driver), the period as one range control, then the quick periods and the
 * status as two switches and the bill backlog at the end.
 *
 * The range boxes and the period switch write the same two values, so pressing
 * *Last month* fills the boxes and typing that month's first and last day
 * lights the switch. The bill chips are the Delivery list's: hidden when
 * nothing is missing, kept while pressed, and pressed again to let go.
 *
 * Every field is 16px below `md` — iOS zooms the page into anything smaller the
 * moment it is tapped — and every control is at least 36px tall.
 */
export function VendorTripFilters({ params, onChange, onReset, isFiltered, meta }: VendorTripFiltersProps) {
  const t = useT()
  const format = useFormatters()

  const preset = DATE_CHIPS.find((chip) => {
    const range = chip.range()
    return params.from === range.from && params.to === range.to
  })

  return (
    <div className="space-y-3 px-4 pb-4 sm:px-5">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={params.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder={t('vendor.trip.searchPlaceholder')}
            aria-label={t('vendor.trip.searchAria')}
            className="h-10 rounded-xl pl-9 md:text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-1 rounded-xl border border-input bg-background px-2.5 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 lg:flex-none dark:bg-input/30">
            <CalendarRange className="size-4 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              type="date"
              value={params.from}
              max={params.to || undefined}
              onChange={(event) => onChange({ from: event.target.value })}
              aria-label={t('vendor.trip.fromAria')}
              className={cn(DAY, 'lg:w-36')}
            />
            <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              type="date"
              value={params.to}
              min={params.from || undefined}
              onChange={(event) => onChange({ to: event.target.value })}
              aria-label={t('vendor.trip.untilAria')}
              className={cn(DAY, 'lg:w-36')}
            />
          </div>

          {isFiltered && (
            <Button
              variant="ghost"
              className="h-10 shrink-0 rounded-xl text-muted-foreground"
              onClick={onReset}
              aria-label={t('common.actions.clearFilters')}
            >
              <X data-icon="inline-start" aria-hidden />
              <span className="hidden sm:inline">{t('common.actions.clear')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* A column on a phone, where each switch is full width; a wrapping row
          from `sm`, where each switch is its natural width — in a column there
          it would stretch into a grey bar wider than its buttons. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Segmented
          label={t('vendor.trip.periodAria')}
          columns="grid-cols-4"
          options={DATE_CHIPS.map((chip) => ({ value: chip.key, label: t(chip.key) }))}
          value={preset?.key ?? null}
          onChange={(key) => {
            const chip = DATE_CHIPS.find((candidate) => candidate.key === key)
            if (chip) {
              onChange(chip.range())
            }
          }}
        />
        <Segmented
          label={t('vendor.trip.statusAria')}
          columns="grid-cols-3"
          options={STATUS_CHIPS.map((chip) => ({ value: chip.value, label: t(chip.key) }))}
          value={params.status}
          onChange={(status) => onChange({ status })}
        />

        {meta && (
          <div className="flex flex-wrap items-center gap-2 sm:ms-auto">
            {BILL_CHIPS.map((chip) => {
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
                    'inline-flex min-h-9 items-center gap-1.5 rounded-xl border px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm',
                    active
                      ? 'border-tone-rose/45 bg-tone-rose/15 text-tone-rose'
                      : 'border-tone-rose/25 text-tone-rose hover:bg-tone-rose/10',
                  )}
                >
                  <CircleDashed className="size-4" aria-hidden />
                  {t(chip.key)}
                  <span className="rounded-md bg-tone-rose/15 px-1.5 text-xs font-bold tabular-nums">
                    {format.number(count)}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
