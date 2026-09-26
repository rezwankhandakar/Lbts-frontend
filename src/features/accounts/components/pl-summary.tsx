import { FileClock, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { formatPercent } from '@/lib/format'
import { countOf } from '@/lib/i18n'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { ProfitLossReport } from '../types'

/**
 * The report's answer, as a statement: income, each cost under it, and the
 * line at the bottom. Months whose Excel bill has no final bill yet are named
 * above it, because they are costs with no income against them.
 */
export function PlSummary({ report }: { report: ProfitLossReport }) {
  const t = useT()

  const { summary } = report
  const isProfit = summary.profit >= 0
  const Trend = isProfit ? TrendingUp : TrendingDown
  const costShare = (value: number) => (summary.totalCost > 0 ? Math.round((value / summary.totalCost) * 100) : 0)

  const costs = [
    { label: t('accounts.profit.tripRent'), value: summary.tripRent },
    { label: t('accounts.profit.labourBill'), value: summary.labourBill },
    { label: t('accounts.profit.officeExpenses'), value: summary.officeExpense },
  ]

  return (
    <div className="grid gap-4">
      {summary.pendingSlots > 0 && (
        <Link
          to="/accounts/final-bills"
          className="flex items-start gap-3 rounded-xl border border-tone-amber/30 bg-tone-amber/10 px-4 py-3 text-sm text-tone-amber transition hover:bg-tone-amber/15"
        >
          <FileClock className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>
            <span className="font-medium">
              {summary.pendingSlots} unit-{summary.pendingSlots === 1 ? 'month has' : 'months have'} an Excel bill but no final bill.
            </span>{' '}
            {taka(summary.pendingSubmitted)} was asked for and is not counted as income until the audited figure is entered.
          </span>
        </Link>
      )}

      <section className="grid overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-[1fr_1fr_1.1fr]">
        <div className="border-b p-5 lg:border-r lg:border-b-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('accounts.profit.income')}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{taka(summary.income)}</p>
          {/* The two claims on their own lines: neither stands for the other, and
              a single figure would hide which half a month is missing. */}
          <dl className="mt-3 grid gap-1.5 text-sm">
            <div className="grid grid-cols-[1fr_auto] gap-x-3">
              <dt className="text-muted-foreground">
                Walton final {summary.finalBillCount === 1 ? 'bill' : 'bills'}
                <span className="ml-1 text-xs">({summary.finalBillCount})</span>
              </dt>
              <dd className="tabular-nums">{taka(summary.finalBillIncome)}</dd>
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-x-3">
              <dt className="text-muted-foreground">
                Walton labour {summary.labourBillCount === 1 ? 'bill' : 'bills'}
                <span className="ml-1 text-xs">({summary.labourBillCount})</span>
              </dt>
              <dd className="tabular-nums">{taka(summary.waltonLabourIncome)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            {report.from.label}
            {report.months.length > 1 && ` – ${report.to.label}`}
          </p>
        </div>

        <div className="border-b p-5 lg:border-r lg:border-b-0">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t('accounts.profit.operationalCost')}
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{taka(summary.totalCost)}</p>
          <dl className="mt-3 grid gap-1.5 text-sm">
            {costs.map((cost) => (
              <div key={cost.label} className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1">
                <dt className="text-muted-foreground">{cost.label}</dt>
                <dd className="tabular-nums">{taka(cost.value)}</dd>
                <div className="col-span-2 h-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-viz-2" style={{ width: `${costShare(cost.value)}%` }} />
                </div>
              </div>
            ))}
          </dl>
        </div>

        <div className={cn('flex flex-col justify-between p-5', isProfit ? 'bg-tone-emerald/5' : 'bg-tone-rose/5')}>
          <p className={cn('flex items-center gap-2 text-xs font-medium tracking-wide uppercase', isProfit ? 'text-tone-emerald' : 'text-tone-rose')}>
            <Trend className="size-4" aria-hidden />
            {isProfit ? t('accounts.profit.netProfit') : t('accounts.profit.netLoss')}
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums">{signedTaka(summary.profit)}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('accounts.profit.marginAndTrips', {
              margin:
                summary.margin === null
                  ? t('accounts.profit.noMargin')
                  : t('accounts.profit.marginOf', { margin: formatPercent(summary.margin) }),
              trips: countOf(summary.tripCount, 'nouns.trip', t),
            })}
            {summary.blankBills > 0 && <span className="text-tone-amber"> · {summary.blankBills} with no bill entered</span>}
          </p>
        </div>
      </section>
    </div>
  )
}
