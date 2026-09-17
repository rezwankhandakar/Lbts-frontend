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

/**
 * Profit and loss over any run of months: Walton's final bills against trip
 * rent, labour bills and office expenses.
 */
export function AccountsProfitLossPage() {
  const [range, setRange] = useState<PeriodRange>(defaultReportRange)
  const from = periodParam(range.from)
  const to = periodParam(range.to)
  const query = useProfitLoss(from, to)
  const report = query.data
  const backwards = comparePeriods(range.from, range.to) > 0

  return (
    <AccountsShell
      title="Profit & Loss"
      description="Walton's audited final bills are the income; trip rent, labour bills and every office expense are the cost. A month without its final bill carries costs and no income until one is entered."
    >
      <div className="grid gap-5">
        <PlRangePicker value={range} onChange={setRange} />

        {backwards ? (
          <p className="rounded-xl border bg-card px-4 py-10 text-center text-sm text-muted-foreground">
            The report has to end on or after the month it starts.
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
              <Panel title="Income against cost" description="Month by month — hover a month for its profit.">
                <div className="p-4 sm:p-5">
                  <TrendChart months={report.months} />
                </div>
              </Panel>
            )}

            <Panel title="Statement by month">
              <PlMonthTable report={report} />
            </Panel>

            <PlBreakdowns report={report} fromParam={to} />
          </div>
        )}
      </div>
    </AccountsShell>
  )
}
