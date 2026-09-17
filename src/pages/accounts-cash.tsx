import { ArrowDownLeft, ArrowUpRight, CalendarRange, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Panel, StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { CashSummaryTable } from '@/features/accounts/components/cash-summary-table'
import { PlRangePicker } from '@/features/accounts/components/pl-range-picker'
import { useCashSummary } from '@/features/accounts/hooks/use-accounts'
import { comparePeriods, currentPeriod, defaultReportRange, periodParam, signedTaka, taka } from '@/features/accounts/lib/accounts-meta'
import type { PeriodRange } from '@/features/accounts/lib/accounts-meta'
import type { CashGroup } from '@/features/accounts/types'
import { cn } from '@/lib/utils'

const YEAR_SPANS = [1, 3, 5] as const

/**
 * Cash, and nothing else: its balance, every taka that has gone in and out of
 * it until today, and the same broken down by month or by year over a range.
 */
export function AccountsCashPage() {
  const [group, setGroup] = useState<CashGroup>('month')
  const [range, setRange] = useState<PeriodRange>(defaultReportRange)
  const backwards = comparePeriods(range.from, range.to) > 0
  const query = useCashSummary(periodParam(range.from), periodParam(range.to), group)
  const summary = query.data

  const chooseYears = (years: number) => {
    const now = currentPeriod()
    setRange({ from: { year: now.year - years + 1, month: 1 }, to: now })
  }

  return (
    <AccountsShell
      title="Cash"
      description="Your cash balance, how much cash has come in and gone out until today, and the same month by month or year by year. Every transaction in Accounts runs through cash."
    >
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile label="Cash balance" value={summary ? signedTaka(summary.balance) : ''} hint={summary && `${summary.wallets.length} cash ${summary.wallets.length === 1 ? 'wallet' : 'wallets'}`} icon={Wallet} tone="indigo" isLoading={!summary} />
          <StatTile label="Total cash in, until today" value={summary ? taka(summary.allTime.moneyIn) : ''} hint={summary && `Deposits ${taka(summary.allTime.deposits)}`} icon={ArrowDownLeft} tone="emerald" isLoading={!summary} />
          <StatTile label="Total cash out, until today" value={summary ? taka(summary.allTime.moneyOut) : ''} hint={summary && `Vendors ${taka(summary.allTime.vendorPayments + summary.allTime.tripAdvances)} · Expenses ${taka(summary.allTime.expenses)}`} icon={ArrowUpRight} tone="rose" isLoading={!summary} />
          <StatTile label="Cash in, this range" value={summary ? taka(summary.range.totals.moneyIn) : ''} hint={summary && `${summary.range.from.label} – ${summary.range.to.label}`} icon={CalendarRange} tone="violet" isLoading={!summary} />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label="Group by" className="inline-flex rounded-lg border bg-card p-0.5">
              {(['month', 'year'] as const).map((option) => (
                <button key={option} type="button" role="radio" aria-checked={group === option} onClick={() => setGroup(option)} className={cn('rounded-md px-3 py-1 text-xs font-medium transition', group === option ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
                  {option === 'month' ? 'Month by month' : 'Year by year'}
                </button>
              ))}
            </div>
            {group === 'year' && (
              <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-0.5" aria-label="Year range">
                {YEAR_SPANS.map((years) => (
                  <button key={years} type="button" onClick={() => chooseYears(years)} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
                    {years === 1 ? 'This year' : `Last ${years} years`}
                  </button>
                ))}
              </div>
            )}
          </div>
          <PlRangePicker value={range} onChange={setRange} />
        </div>

        <Panel
          title={group === 'month' ? 'Cash in and out by month' : 'Cash in and out by year'}
          description="Cash in is deposits, Walton payments received into cash included. Cash out is every vendor payment, trip advance and expense, and advances less the cash returned against them."
        >
          {backwards ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">The range has to end on or after the month it starts.</p>
          ) : query.isError ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">{query.error.message}</p>
          ) : !summary ? (
            <Skeleton className="m-4 h-64" />
          ) : (
            <div className={query.isFetching ? 'opacity-70 transition-opacity' : 'transition-opacity'}>
              <CashSummaryTable rows={summary.range.rows} totals={summary.range.totals} />
            </div>
          )}
        </Panel>
      </div>
    </AccountsShell>
  )
}
