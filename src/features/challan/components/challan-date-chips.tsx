import { CalendarDays } from 'lucide-react'
import { QUICK_RANGE_KEYS, quickRangeFor, rangeFor } from '@/lib/date-ranges'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ChallanFilterPatch, ChallanListParams } from '../types'

const OPTIONS = ['all', 'month', 'lastMonth'] as const

/**
 * The filing-date shortcuts, on the toolbar even though the dates themselves
 * live behind "More filters" — the operating rhythm here is monthly, and a
 * month-end reconciliation should be one press rather than two date pickers.
 *
 * Drawn as one segmented control: the three are mutually exclusive, and a
 * row of loose buttons does not say so.
 *
 * Last month is the whole closed calendar month, whatever length it had. A
 * range typed by hand that matches neither is shown as the dates themselves.
 */
export function ChallanDateChips({
  params,
  onChange,
}: {
  params: Pick<ChallanListParams, 'from' | 'to'>
  onChange: (patch: ChallanFilterPatch) => void
}) {
  const t = useT()

  const quick = quickRangeFor({ from: params.from, to: params.to })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label={t('challan.filters.dateAria')}
        className="inline-flex items-center rounded-lg bg-muted/70 p-0.5"
      >
        {OPTIONS.map((option) => {
          const active = quick === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option === 'all' ? { from: '', to: '' } : rangeFor(option))}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                active && 'bg-background text-foreground shadow-xs',
              )}
            >
              {option === 'all' && <CalendarDays className="size-3.5" aria-hidden />}
              {t(QUICK_RANGE_KEYS[option] as TranslationKey)}
            </button>
          )
        })}
      </div>
      {(quick === 'custom' || quick === 'today') && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {params.from || '…'} to {params.to || '…'}
        </span>
      )}
    </div>
  )
}
