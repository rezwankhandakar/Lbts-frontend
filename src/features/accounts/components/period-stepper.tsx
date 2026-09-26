import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { comparePeriods, currentPeriod, periodLabel, shiftPeriod } from '../lib/accounts-meta'
import type { Period } from '../types'
import { useT } from '@/lib/i18n'

interface PeriodStepperProps {
  period: Period
  onChange: (period: Period) => void
}

/** A month, and the two next to it one press away. "This month" appears once you have left it. */
export function PeriodStepper({ period, onChange }: PeriodStepperProps) {
  const t = useT()

  const now = currentPeriod()
  const atNow = comparePeriods(period, now) === 0

  return (
    <div className="flex items-center gap-1.5">
      <div className="inline-flex items-center rounded-lg border bg-card p-0.5 shadow-xs">
        <Button variant="ghost" size="icon-sm" onClick={() => onChange(shiftPeriod(period, -1))} aria-label={t('accounts.period.previousMonth')}>
          <ChevronLeft aria-hidden />
        </Button>
        <span className="min-w-[8.5rem] px-2 text-center text-sm font-medium tabular-nums" aria-live="polite">
          {periodLabel(period)}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onChange(shiftPeriod(period, 1))}
          disabled={comparePeriods(period, now) >= 0}
          aria-label={t('accounts.period.nextMonth')}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
      {!atNow && (
        <Button variant="outline" size="sm" onClick={() => onChange(now)}>
          {t('accounts.period.thisMonth')}
        </Button>
      )}
    </div>
  )
}
