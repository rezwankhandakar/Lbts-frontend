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
import { formatNumber } from '@/lib/format'
import { countOf, useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

const YEAR_SPANS = [1, 3, 5] as const

/**
 * Cash, and nothing else: its balance, every taka that has gone in and out of
 * it until today, and the same broken down by month or by year over a range.
 */
export function AccountsCashPage() {
  const t = useT()

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
      title={t('accounts.pages.cash.title')}
      description={t('accounts.pages.cash.description')}
    >
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile
            label={t('accounts.pages.cash.balance')}
            value={summary ? signedTaka(summary.balance) : ''}
            hint={summary && countOf(summary.wallets.length, 'nouns.cashWallet', t)}
            icon={Wallet}
            tone="indigo"
            isLoading={!summary}
          />
          <StatTile
            label={t('accounts.pages.cash.inUntilToday')}
            value={summary ? taka(summary.allTime.moneyIn) : ''}
            hint={
              summary &&
              t('accounts.pages.cash.depositsHint', { amount: taka(summary.allTime.deposits) })
            }
            icon={ArrowDownLeft}
            tone="emerald"
            isLoading={!summary}
          />
          <StatTile
            label={t('accounts.pages.cash.outUntilToday')}
            value={summary ? taka(summary.allTime.moneyOut) : ''}
            hint={
              summary &&
              t('accounts.pages.cash.outHint', {
                vendors: taka(summary.allTime.vendorPayments + summary.allTime.tripAdvances),
                expenses: taka(summary.allTime.expenses),
              })
            }
            icon={ArrowUpRight}
            tone="rose"
            isLoading={!summary}
          />
          <StatTile
            label={t('accounts.pages.cash.inThisRange')}
            value={summary ? taka(summary.range.totals.moneyIn) : ''}
            hint={
              summary &&
              t('accounts.pages.cash.rangeHint', {
                from: summary.range.from.label,
                to: summary.range.to.label,
              })
            }
            icon={CalendarRange}
            tone="violet"
            isLoading={!summary}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div role="radiogroup" aria-label={t('accounts.pages.cash.groupByAria')} className="inline-flex rounded-lg border bg-card p-0.5">
              {(['month', 'year'] as const).map((option) => (
                <button key={option} type="button" role="radio" aria-checked={group === option} onClick={() => setGroup(option)} className={cn('rounded-md px-3 py-1 text-xs font-medium transition', group === option ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
                  {option === 'month'
                    ? t('accounts.pages.cash.monthByMonth')
                    : t('accounts.pages.cash.yearByYear')}
                </button>
              ))}
            </div>
            {group === 'year' && (
              <div className="flex flex-wrap gap-1 rounded-lg border bg-card p-0.5" aria-label={t('accounts.pages.cash.yearRangeAria')}>
                {YEAR_SPANS.map((years) => (
                  <button key={years} type="button" onClick={() => chooseYears(years)} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground">
                    {years === 1
                      ? t('accounts.pages.cash.thisYear')
                      : t('accounts.pages.cash.lastYears', { n: formatNumber(years) })}
                  </button>
                ))}
              </div>
            )}
          </div>
          <PlRangePicker value={range} onChange={setRange} />
        </div>

        <Panel
          title={
            group === 'month'
              ? t('accounts.pages.cash.byMonthTitle')
              : t('accounts.pages.cash.byYearTitle')
          }
          description={t('accounts.pages.cash.byRangeDescription')}
        >
          {backwards ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {t('accounts.pages.cash.rangeBackwards')}
            </p>
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
