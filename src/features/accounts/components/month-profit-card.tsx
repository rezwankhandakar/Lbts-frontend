import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { ProfitLossMonth } from '../types'
import { Panel } from './account-atoms'

/**
 * One month's profit, as the lines that make it. When no final bill is in yet
 * it says so above the figure, because a month of costs and no income reads as
 * a loss that has not happened.
 */
export function MonthProfitCard({ month }: { month: ProfitLossMonth | undefined }) {
  if (!month) {
    return <Skeleton className="h-72 rounded-xl" />
  }

  const lines = [
    { label: 'Walton final bill', value: month.income, strong: true },
    { label: 'Trip rent', value: -month.tripRent },
    { label: 'Labour bill', value: -month.labourBill },
    { label: 'Office expenses', value: -month.officeExpense },
  ]
  const isProfit = month.profit >= 0
  const Trend = isProfit ? TrendingUp : TrendingDown

  return (
    <Panel
      title={`Profit & loss · ${month.label}`}
      description="Final bill against every operational cost."
      action={
        <Button variant="ghost" size="sm" render={<Link to="/accounts/profit-loss" />}>
          Full report
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      }
    >
      <div className="grid gap-4 p-4 sm:p-5">
        {month.finalBillCount === 0 && (
          <p className="rounded-lg bg-tone-amber/10 px-3 py-2 text-xs text-tone-amber">
            No Walton final bill is entered for this month yet
            {month.pendingSubmitted > 0 && ` — Excel bills ask for ${taka(month.pendingSubmitted)}`}.
          </p>
        )}

        <dl className="grid gap-2 text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-3">
              <dt className={cn('text-muted-foreground', line.strong && 'font-medium text-foreground')}>{line.label}</dt>
              <dd className={cn('tabular-nums', line.strong && 'font-semibold')}>{signedTaka(line.value)}</dd>
            </div>
          ))}
        </dl>

        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1',
            isProfit ? 'bg-tone-emerald/10 ring-tone-emerald/20' : 'bg-tone-rose/10 ring-tone-rose/20',
          )}
        >
          <span className={cn('flex items-center gap-2 text-sm font-medium', isProfit ? 'text-tone-emerald' : 'text-tone-rose')}>
            <Trend className="size-4" aria-hidden />
            {isProfit ? 'Profit' : 'Loss'}
            {month.margin !== null && <span className="text-xs font-normal">({month.margin}% margin)</span>}
          </span>
          <span className="text-xl font-semibold tracking-tight tabular-nums">{signedTaka(month.profit)}</span>
        </div>
      </div>
    </Panel>
  )
}
