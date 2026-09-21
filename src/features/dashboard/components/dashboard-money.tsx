import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Landmark,
  RefreshCcw,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendChart } from '@/features/accounts/components/trend-chart'
import { signedTaka, taka } from '@/features/accounts/lib/accounts-meta'
import { cn } from '@/lib/utils'
import type { DashboardData } from '../types'

/**
 * The office's money, for the roles that keep it.
 *
 * Drawn only for `Admin`, `Manager` and `CEO` — `OpEx` enters trip bills on
 * trips and has no need of the office's balances, and a `Vendor` never reaches
 * this page at all. The panel is **read-only** whatever the role: even a
 * Manager, who is the one role that may write in Accounts, does it on the
 * Accounts pages rather than from an overview. Every figure here is a link to
 * where it can be acted on.
 *
 * **The chart is Accounts' own `TrendChart`, composed by import.** It renders
 * that module's entity from that module's data, so it stays where it is and is
 * used from here — the rule the Delivery module follows for the vendor badges
 * and the Challan type-ahead it borrows. A second chart drawn here would be a
 * second place for "what did August come to" to be worked out, and the two
 * would eventually disagree on a page whose whole job is to be trusted.
 *
 * Every figure comes from `GET /accounts/overview`, the same one request the
 * Accounts page itself reads — so this panel can never quote a number that
 * page would contradict, and opening Accounts from here finds it already warm.
 */
export function DashboardMoney({ dashboard }: { dashboard: DashboardData }) {
  const query = dashboard.accounts
  const overview = query.data

  return (
    <section
      aria-labelledby="money-heading"
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-violet/10 text-tone-violet ring-1 ring-tone-violet/20"
          aria-hidden
        >
          <Landmark className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="money-heading" className="text-[13px] font-semibold tracking-tight">
            Money
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cash in hand, what is owed either way, and how the months are running.
          </p>
        </div>
        <Button variant="ghost" size="sm" render={<Link to="/accounts" />} className="shrink-0">
          Open
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {query.isError ? (
        <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <TriangleAlert className="mt-px size-4 shrink-0 text-destructive" aria-hidden />
            The money summary could not be loaded.
          </p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            {/*
             * Cash on its own, never a bank balance added in — the rule the
             * Accounts overview's headline follows. The year and the month are
             * the two windows the office actually closes against; an all-time
             * total only grows and stops being a figure anybody acts on.
             */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Cash balance
              </p>
              {overview === undefined ? (
                <Skeleton className="mt-2 h-9 w-36" />
              ) : (
                <p className="mt-1 text-3xl leading-none font-semibold tracking-tight tabular-nums sm:text-4xl">
                  {signedTaka(overview.cash.balance)}
                </p>
              )}
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {overview
                  ? `Across ${overview.cash.wallets.length === 1 ? 'one cash wallet' : `${overview.cash.wallets.length} cash wallets`} — bank and mobile are not added in.`
                  : 'Cash wallets only.'}
              </p>

              {overview && (
                <dl className="mt-3.5 grid grid-cols-2 gap-3 border-t pt-3">
                  <Flow
                    icon={ArrowDownLeft}
                    label={`In · ${overview.period.label}`}
                    value={taka(overview.cash.thisMonth.moneyIn)}
                    className="text-tone-emerald"
                  />
                  <Flow
                    icon={ArrowUpRight}
                    label={`Out · ${overview.period.label}`}
                    value={taka(overview.cash.thisMonth.moneyOut)}
                    className="text-tone-rose"
                  />
                </dl>
              )}
            </div>

            <div className="grid gap-2">
              <MoneyLink
                to="/accounts/profit-loss"
                label={`Profit · ${overview?.period.label ?? 'this month'}`}
                value={overview && signedTaka(overview.profitLoss.profit)}
                className={
                  overview && overview.profitLoss.profit < 0 ? 'text-tone-rose' : 'text-tone-emerald'
                }
                note={
                  overview
                    ? overview.profitLoss.margin === null
                      ? 'No income booked for this month yet'
                      : `${overview.profitLoss.margin}% margin on what has been billed`
                    : undefined
                }
              />
              <MoneyLink
                to="/accounts/vendor-bills"
                label="Owed to vendors"
                value={overview && taka(overview.vendorDue.total)}
                className="text-tone-amber"
                note={
                  overview
                    ? overview.vendorDue.vendors === 0
                      ? 'Every vendor month is settled'
                      : `Across ${overview.vendorDue.vendors === 1 ? 'one vendor' : `${overview.vendorDue.vendors} vendors`}`
                    : undefined
                }
              />
              <MoneyLink
                to="/accounts/final-bills"
                label="To come in from Walton"
                value={overview && taka(overview.receivable.outstanding)}
                note={
                  overview
                    ? `${overview.receivable.finalBills} final ${overview.receivable.finalBills === 1 ? 'bill' : 'bills'} · ${overview.receivable.labourCsds} labour ${overview.receivable.labourCsds === 1 ? 'CSD' : 'CSDs'}`
                    : undefined
                }
              />
            </div>
          </div>

          <div className="min-w-0 lg:col-span-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <h3 className="text-[13px] font-semibold tracking-tight">Income against cost</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Costs are accrued by trip month, not by when a vendor was paid. A month whose final
              bill has not been audited is not counted.
            </p>

            <div className="mt-4">
              {overview === undefined ? (
                <Skeleton className="h-64 rounded-lg" />
              ) : (
                <TrendChart months={overview.trend} />
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

function Flow({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: LucideIcon
  label: string
  value: string
  className: string
}) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center gap-1.5 truncate text-[11px] text-muted-foreground">
        <Icon className={cn('size-3.5 shrink-0', className)} aria-hidden />
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-base font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

/**
 * One figure and the page that answers it. A number on a dashboard that cannot
 * be pressed is a number somebody has to go and look for a second time.
 */
function MoneyLink({
  to,
  label,
  value,
  note,
  className,
}: {
  to: string
  label: string
  value: string | undefined
  note: string | undefined
  className?: string
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-3 rounded-xl border bg-card px-3.5 py-3 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="min-w-0">
        <p className="truncate text-xs font-medium">{label}</p>
        {note === undefined ? (
          <Skeleton className="mt-1 h-3 w-32" />
        ) : (
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{note}</p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {value === undefined ? (
          <Skeleton className="h-5 w-20" />
        ) : (
          <span className={cn('text-base font-semibold tabular-nums', className)}>{value}</span>
        )}
        <ArrowRight
          className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>
    </Link>
  )
}
