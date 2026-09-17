import { ArrowRight, Landmark, RefreshCcw, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useCurrentRole } from '@/hooks/use-current-role'
import { cn } from '@/lib/utils'
import { useAccountsOverview } from '../hooks/use-accounts'
import { signedTaka, taka, todayString } from '../lib/accounts-meta'
import { canReadAccounts } from '../types'

/**
 * The dashboard's view of Accounts: four real figures and a way in, from the
 * same overview the Accounts page reads. Nothing for a role that cannot reach
 * the module.
 */
export function AccountsSummaryCard() {
  const role = useCurrentRole()
  const readable = canReadAccounts(role)
  const query = useAccountsOverview(todayString(), readable)

  if (!readable) {
    return null
  }

  const overview = query.data
  const figures = overview
    ? [
        { label: 'Cash balance', value: signedTaka(overview.cash.balance), className: 'text-primary' },
        {
          label: `Profit · ${overview.period.label}`,
          value: signedTaka(overview.profitLoss.profit),
          className: overview.profitLoss.profit < 0 ? 'text-tone-rose' : 'text-tone-emerald',
        },
        { label: 'Vendor bills due', value: taka(overview.vendorDue.total), className: 'text-tone-amber' },
        { label: 'To receive from Walton', value: taka(overview.receivable.outstanding), className: '' },
      ]
    : []

  return (
    <section className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-tone-violet/10 text-tone-violet ring-1 ring-tone-violet/20" aria-hidden>
          <Landmark className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[13px] font-semibold tracking-tight">Accounts</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Cash balance, what is owed, and this month's profit.</p>
        </div>
        <Button variant="ghost" size="sm" render={<Link to="/accounts" />} className="shrink-0">
          Open
          <ArrowRight data-icon="inline-end" aria-hidden />
        </Button>
      </header>

      {query.isError ? (
        <div className="flex flex-col items-start gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
            <TriangleAlert className="size-4 shrink-0 text-destructive" aria-hidden />
            The accounts summary could not be loaded.
          </p>
          <Button variant="outline" size="sm" onClick={() => void query.refetch()}>
            <RefreshCcw data-icon="inline-start" aria-hidden />
            Retry
          </Button>
        </div>
      ) : (
        <dl className="grid grid-cols-2 divide-x divide-y sm:grid-cols-4 sm:divide-y-0">
          {(overview ? figures : Array.from({ length: 4 }, (_, index) => ({ label: String(index), value: '', className: '' }))).map((figure) => (
            <div key={figure.label} className="px-4 py-4 sm:px-5">
              <dt className="truncate text-xs text-muted-foreground">{overview ? figure.label : <Skeleton className="h-3 w-16" />}</dt>
              <dd className={cn('mt-1.5 truncate text-xl leading-none font-semibold tracking-tight tabular-nums', figure.className)}>
                {overview ? figure.value : <Skeleton className="h-6 w-20" />}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
