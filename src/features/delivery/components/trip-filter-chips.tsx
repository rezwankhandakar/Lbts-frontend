import { CircleDashed } from 'lucide-react'
import { useFormatters, useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { localToday, monthRange } from '../lib/delivery-meta'
import type { TripBillFilter, TripFilterPatch, TripListParams } from '../types'

interface TripFilterChipsProps {
  params: TripListParams
  onChange: (patch: TripFilterPatch) => void
  /** How many matching trips have each bill still blank; absent while loading. */
  backlog?: { blankRent: number; blankLabour: number }
}

/**
 * The date ranges somebody actually asks about. Last month is the whole closed
 * calendar month, because that is what a vendor's bill is run over. Computed
 * on every render rather than once, so a page left open past midnight moves.
 */
const DATE_CHIPS: { labelKey: TranslationKey; range: () => { from: string; to: string } }[] = [
  { labelKey: 'time.anyDate', range: () => ({ from: '', to: '' }) },
  { labelKey: 'time.today', range: () => ({ from: localToday(), to: localToday() }) },
  { labelKey: 'time.thisMonth', range: () => monthRange(0) },
  { labelKey: 'time.lastMonth', range: () => monthRange(-1) },
]

/**
 * The trip bill backlog. Pressing one lists only the trips still missing that
 * amount; pressing it again lets go. Counts answer the other filters, so
 * "Last month" plus "No trip rent" is the list of trips a month-end bill is
 * still waiting on.
 */
const BILL_CHIPS: { value: Exclude<TripBillFilter, 'all'>; labelKey: TranslationKey }[] = [
  { value: 'no-rent', labelKey: 'delivery.filters.noRent' },
  { value: 'no-labour', labelKey: 'delivery.filters.noLabour' },
]

/**
 * The row under the toolbar: the quick date ranges as one segmented switch —
 * exactly one of them, or none when a custom range is typed, is ever in force,
 * which is what a switch says and a row of loose pills did not — and, at the
 * far end, the bill backlog.
 */
export function TripFilterChips({ params, onChange, backlog }: TripFilterChipsProps) {
  const t = useT()
  const format = useFormatters()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Four equal columns across a phone, so the switch never breaks onto a
          second line inside itself; its natural width from `sm`. */}
      <div className="grid w-full grid-cols-4 rounded-lg bg-muted p-0.5 sm:inline-flex sm:w-auto" role="group">
        {DATE_CHIPS.map((chip) => {
          const range = chip.range()
          const active = params.from === range.from && params.to === range.to

          return (
            <button
              key={chip.labelKey}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(range)}
              className={cn(
                'truncate rounded-md px-1.5 py-1.5 text-xs font-medium transition outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3 sm:py-1 sm:text-[13px]',
                active
                  ? 'bg-background text-foreground shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t(chip.labelKey)}
            </button>
          )
        })}
      </div>

      {backlog && (
        <div className="flex flex-wrap items-center gap-1.5 sm:ms-auto">
          {BILL_CHIPS.map((chip) => {
            const count = chip.value === 'no-rent' ? backlog.blankRent : backlog.blankLabour
            const active = params.bill === chip.value

            // A backlog chip with nothing behind it is not drawn — unless it is
            // the filter in force, or clearing the last one would remove the
            // only thing saying why the list is empty.
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
                  'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active
                    ? 'border-tone-rose/45 bg-tone-rose/15 text-tone-rose'
                    : 'border-tone-rose/25 text-tone-rose hover:bg-tone-rose/10',
                )}
              >
                <CircleDashed className="size-3.5" aria-hidden />
                {t(chip.labelKey)}
                <span className="rounded-md bg-tone-rose/15 px-1.5 text-xs font-bold tabular-nums">
                  {format.number(count)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
