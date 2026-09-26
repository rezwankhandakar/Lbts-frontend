import { ArrowDownLeft, ArrowRight, ArrowUpRight, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent } from '@/lib/format'
import { signedTaka, taka } from '../lib/accounts-meta'
import type { AccountsOverview, CashFigures } from '../types'
import { useT } from '@/lib/i18n'

/**
 * Cash, first — and only cash. Vendor bills, advances and expenses are paid
 * from cash alone, so the cash balance is the figure somebody keeping the
 * books acts on; a bank or bKash balance is not added in here and is read on
 * the Cash Book instead.
 *
 * The two flows beside it are the **calendar year to date** and the month
 * inside it, never all time: a running total of every taka since the books
 * were opened only grows, so nobody reads it twice. A year is what the office
 * closes against, and the Cash page is where a longer range is asked for.
 *
 * A surface that is dark in both themes — the auth panel's gradient — so it
 * reads as the page's headline in either.
 */
export function BalanceHero({ overview }: { overview: AccountsOverview | undefined }) {
  const t = useT()

  if (!overview) {
    return <Skeleton className="h-[26rem] rounded-3xl sm:h-72 lg:h-60" />
  }

  const { cash } = overview

  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-from to-brand-to p-5 text-primary-foreground shadow-xl ring-1 ring-primary-foreground/10 sm:p-7">
      <div className="pointer-events-none absolute -top-32 -right-20 size-80 rounded-full bg-primary-foreground/15 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-80 rounded-full bg-primary-foreground/10 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary-foreground/25" aria-hidden />

      <div className="relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-[11px] font-medium tracking-[0.14em] uppercase ring-1 ring-primary-foreground/15">
            <Wallet className="size-3.5" aria-hidden />
            {t('accounts.hero.cashBalance')}
          </span>

          <p className="mt-4 text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl">{signedTaka(cash.balance)}</p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {cash.wallets.length === 0 ? (
              <span className="text-sm text-primary-foreground/75">
                {t('accounts.hero.noCashWallet')}
              </span>
            ) : (
              cash.wallets.map((wallet) => (
                <span
                  key={wallet.id}
                  className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs ring-1 ring-primary-foreground/15"
                >
                  <span className="truncate text-primary-foreground/80">{wallet.name}</span>
                  <span className="font-semibold tabular-nums">{signedTaka(wallet.balance)}</span>
                </span>
              ))
            )}
          </div>

          <Link
            to="/accounts/cash"
            className="group mt-5 inline-flex items-center gap-1.5 rounded-xl bg-primary-foreground/15 px-3.5 py-2 text-xs font-medium ring-1 ring-primary-foreground/20 transition outline-none hover:bg-primary-foreground/25 focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
          >
            {t('accounts.hero.byMonthAndYear')}
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[30rem]">
          <FlowCard label={`${cash.year} · year`} figures={cash.thisYear} />
          <FlowCard label={overview.period.label} figures={cash.thisMonth} />
        </div>
      </div>
    </section>
  )
}

/**
 * One period's cash in, cash out and net. The bar is out as a share of in —
 * a proportion is read down a page without being read, which a pair of
 * figures on their own is not.
 */
function FlowCard({ label, figures }: { label: string; figures: CashFigures }) {
  const t = useT()

  const share =
    figures.moneyIn > 0
      ? Math.min(100, Math.round((figures.moneyOut / figures.moneyIn) * 100))
      : figures.moneyOut > 0
        ? 100
        : 0
  const note =
    figures.moneyIn > 0
      ? t('accounts.cash.shareGoneOut', { share: formatPercent(share) })
      : figures.moneyOut > 0
        ? t('accounts.hero.paidFromHand')
        : t('accounts.hero.nothingMoved')

  return (
    <div className="rounded-2xl bg-primary-foreground/10 p-4 ring-1 ring-primary-foreground/15">
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[11px] font-medium tracking-wider text-primary-foreground/70 uppercase">{label}</p>
        <span className="shrink-0 rounded-full bg-primary-foreground/15 px-2 py-0.5 text-[11px] font-medium tabular-nums">
          {t('accounts.hero.net', { amount: signedTaka(figures.net) })}
        </span>
      </div>

      <dl className="mt-3 grid gap-2">
        <Flow icon={ArrowDownLeft} label={t('accounts.cash.in')} value={figures.moneyIn} />
        <Flow icon={ArrowUpRight} label={t('accounts.cash.out')} value={figures.moneyOut} />
      </dl>

      <div className="mt-3.5 h-1.5 overflow-hidden rounded-full bg-primary-foreground/15" aria-hidden>
        <div className="h-full rounded-full bg-primary-foreground/70 transition-[width]" style={{ width: `${share}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-primary-foreground/65">{note}</p>
    </div>
  )
}

function Flow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ArrowDownLeft
  label: string
  value: number
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="flex items-center gap-1.5 text-xs text-primary-foreground/75">
        <Icon className="size-3.5 shrink-0 self-center" aria-hidden />
        {label}
      </dt>
      <dd className="truncate text-lg font-semibold tabular-nums sm:text-xl">{taka(value)}</dd>
    </div>
  )
}
