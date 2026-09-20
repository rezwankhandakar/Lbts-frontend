import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { comparePeriods, currentPeriod, fiscalYearOf, parsePeriodParam, periodParam, shiftPeriod } from '../lib/accounts-meta'
import type { PeriodRange } from '../lib/accounts-meta'

interface Preset {
  key: string
  label: string
  range: () => PeriodRange
}

const PRESETS: Preset[] = [
  { key: 'this-month', label: 'This month', range: () => ({ from: currentPeriod(), to: currentPeriod() }) },
  {
    key: 'last-month',
    label: 'Last month',
    range: () => {
      const last = shiftPeriod(currentPeriod(), -1)
      return { from: last, to: last }
    },
  },
  { key: 'last-3', label: 'Last 3 months', range: () => ({ from: shiftPeriod(currentPeriod(), -2), to: currentPeriod() }) },
  { key: 'last-6', label: 'Last 6 months', range: () => ({ from: shiftPeriod(currentPeriod(), -5), to: currentPeriod() }) },
  {
    key: 'fiscal',
    label: 'This fiscal year',
    range: () => {
      const year = fiscalYearOf(currentPeriod())
      return { from: year.from, to: currentPeriod() }
    },
  },
  {
    key: 'last-fiscal',
    label: 'Last fiscal year',
    range: () => {
      const year = fiscalYearOf(shiftPeriod(fiscalYearOf(currentPeriod()).from, -1))
      return { from: year.from, to: year.to }
    },
  },
  {
    key: 'calendar',
    label: 'This year',
    range: () => ({ from: { year: currentPeriod().year, month: 1 }, to: currentPeriod() }),
  },
]

function sameRange(a: PeriodRange, b: PeriodRange): boolean {
  return comparePeriods(a.from, b.from) === 0 && comparePeriods(a.to, b.to) === 0
}

/**
 * The months a report covers: presets for the questions asked most — this
 * month, last month, the Bangladesh fiscal year — and two month boxes for
 * anything else.
 */
export function PlRangePicker({ value, onChange }: { value: PeriodRange; onChange: (range: PeriodRange) => void }) {
  return (
    <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
      <div role="radiogroup" aria-label="Report period" className="flex w-fit flex-wrap gap-1 rounded-lg border bg-card p-0.5">
        {PRESETS.map((preset) => {
          const active = sameRange(preset.range(), value)
          return (
            <button
              key={preset.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(preset.range())}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition',
                active ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {preset.label}
            </button>
          )
        })}
      </div>
      <div className="flex min-w-0 items-center gap-1.5 xl:ml-auto">
        <Input
          type="month"
          aria-label="From month"
          value={periodParam(value.from)}
          max={periodParam(value.to)}
          onChange={(event) => {
            const from = parsePeriodParam(event.target.value)
            if (from) onChange({ ...value, from })
          }}
          className="h-8 w-full min-w-0 xl:w-[9.5rem]"
        />
        <span className="shrink-0 text-xs text-muted-foreground">to</span>
        <Input
          type="month"
          aria-label="To month"
          value={periodParam(value.to)}
          min={periodParam(value.from)}
          onChange={(event) => {
            const to = parsePeriodParam(event.target.value)
            if (to) onChange({ ...value, to })
          }}
          className="h-8 w-full min-w-0 xl:w-[9.5rem]"
        />
      </div>
    </div>
  )
}
