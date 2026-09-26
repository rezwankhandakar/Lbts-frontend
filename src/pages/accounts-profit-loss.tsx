import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { PlBreakdowns } from '@/features/accounts/components/pl-breakdowns'
import { PlMonthTable } from '@/features/accounts/components/pl-month-table'
import { PlRangePicker } from '@/features/accounts/components/pl-range-picker'
import { PlSummary } from '@/features/accounts/components/pl-summary'
import { TrendChart } from '@/features/accounts/components/trend-chart'
import { useProfitLoss } from '@/features/accounts/hooks/use-accounts'
import { comparePeriods, defaultReportRange, periodParam } from '@/features/accounts/lib/accounts-meta'
import type { PeriodRange } from '@/features/accounts/lib/accounts-meta'
import { useT } from '@/lib/i18n'

/**
 * Profit and loss over any run of months: Walton's final bills against trip
 * rent, labour bills and office expenses.
 */
export function AccountsProfitLossPage() {
  const t = useT()

  const [range, setRange] = useState<PeriodRange>(defaultReportRange)
  const from = periodParam(range.from)
  const to = periodParam(range.to)
  const query = useProfitLoss(from, to)
  const report = query.data
  const backwards = comparePeriods(range.from, range.to) > 0

  return (
    <AccountsShell
      title={t('accounts.pages.profitLoss.title')}
      description="Walton's audited final bills are the income; trip rent, labour bills and every office expense are the cost. A month without its final bill carries costs and no income until one is entered."
    >
      <div className="grid gap-5">
        <PlRangePicker value={range} onChange={setRange} />

        {backwards ? (
          <p className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            {t('accounts.pages.profitLoss.rangeBackwards')}
          </p>
        ) : query.isError ? (
          <p className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">{query.error.message}</p>
        ) : !report ? (
          <div className="grid gap-5">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-72 rounded-xl" />
          </div>
        ) : (
          <div className={query.isFetching ? 'grid gap-5 opacity-70 transition-opacity' : 'grid gap-5 transition-opacity'}>
            <PlSummary report={report} />

            {report.months.length > 1 && (
              <Panel
                title={t('accounts.pages.profitLoss.incomeAgainstCost')}
                description={t('accounts.pages.profitLoss.incomeAgainstCostHint')}
              >
                <div className="p-4 sm:p-5">
                  <TrendChart months={report.months} />
                </div>
              </Panel>
            )}

            <Panel title={t('accounts.pages.profitLoss.statementByMonth')}>
              <PlMonthTable report={report} />
            </Panel>

            <PlBreakdowns report={report} fromParam={to} />
          </div>
        )}
      </div>
    </AccountsShell>
  )
}
