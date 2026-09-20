import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { MONTH_NAMES, labourBillYearOptions } from '../types'

interface LabourBillPeriodPickerProps {
  month: number
  year: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
}

const OPTION =
  'rounded-md text-center font-medium transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

/**
 * The billing month as twelve buttons and the year as a segmented control —
 * one press each, rather than two dropdowns somebody has to open and read.
 * Choosing the month is the whole of opening a labour bill slot, so it is the
 * thing the form is built around rather than a field on it.
 */
export function LabourBillPeriodPicker({
  month,
  year,
  onMonthChange,
  onYearChange,
}: LabourBillPeriodPickerProps) {
  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label id="labour-period-label">Billing month</Label>
        <div role="radiogroup" aria-label="Year" className="inline-flex rounded-lg border bg-muted/50 p-0.5">
          {labourBillYearOptions(year).map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={option === year}
              onClick={() => onYearChange(option)}
              className={cn(
                OPTION,
                'px-2.5 py-1 text-xs tabular-nums',
                option === year
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div role="radiogroup" aria-labelledby="labour-period-label" className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
        {MONTH_NAMES.map((name, index) => {
          const value = index + 1
          const active = value === month
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={name}
              onClick={() => onMonthChange(value)}
              className={cn(
                OPTION,
                'border px-2 py-2 text-[13px]',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card hover:border-primary/40 hover:bg-primary/5',
              )}
            >
              {name.slice(0, 3)}
            </button>
          )
        })}
      </div>
    </div>
  )
}
