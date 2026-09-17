import { ArrowDownLeft, ArrowRight, ArrowUpRight, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { AccountsOverview } from '../types'

/**
 * Cash, first — and only cash. Vendor bills, advances and expenses are paid
 * from cash alone, so the cash balance is the figure somebody keeping the
 * books acts on; a bank or bKash balance is not added in here and is read on
 * the Cash Book instead.
 *
 * A surface that is dark in both themes — the auth panel's gradient — so it
 * reads as the page's headline in either.
 */
export function BalanceHero({ overview }: { overview: AccountsOverview | undefined }) {
  if (!overview) {
    return <Skeleton className="h-60 rounded-2xl" />
  }

  const { cash } = overview
  const figures = [
    { label: 'Cash in so far', value: taka(cash.allTime.moneyIn), icon: ArrowDownLeft },
    { label: 'Cash out so far', value: taka(cash.allTime.moneyOut), icon: ArrowUpRight },
    { label: `In · ${overview.period.label}`, value: taka(cash.thisMonth.moneyIn), icon: ArrowDownLeft },
    { label: `Out · ${overview.period.label}`, value: taka(cash.thisMonth.moneyOut), icon: ArrowUpRight },
  ]

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-from to-brand-to p-5 text-primary-foreground shadow-lg sm:p-6">
      <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-medium tracking-wide text-primary-foreground/70 uppercase">
            <Wallet className="size-3.5" aria-hidden />
            Cash Balance
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">{signedTaka(cash.balance)}</p>
          <p className="mt-1 text-sm text-primary-foreground/75">
            {cash.wallets.length <= 1
              ? (cash.wallets[0]?.name ?? 'No cash wallet yet')
              : cash.wallets.map((wallet) => `${wallet.name} ${signedTaka(wallet.balance)}`).join(' · ')}
          </p>
          <Link
            to="/accounts/cash"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-primary-foreground/15 px-3 py-1.5 text-xs font-medium ring-1 ring-primary-foreground/20 transition outline-none hover:bg-primary-foreground/25 focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
          >
            Cash in & out by month and year
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <dl className="grid grid-cols-2 gap-3 lg:min-w-[26rem]">
          {figures.map((figure) => (
            <div key={figure.label} className="rounded-xl bg-primary-foreground/10 px-3.5 py-3 ring-1 ring-primary-foreground/15">
              <dt className="flex items-center gap-1.5 truncate text-xs text-primary-foreground/75">
                <figure.icon className="size-3.5 shrink-0" aria-hidden />
                {figure.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{figure.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
