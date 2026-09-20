import { CalendarRange, HandCoins, HardHat, Wallet } from 'lucide-react'
import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { LabourMonthCard } from '@/features/accounts/components/labour-month-card'
import { useLabourReceivables } from '@/features/accounts/hooks/use-accounts'
import { SETTLEMENT_META, taka } from '@/features/accounts/lib/accounts-meta'
import { SETTLEMENT_STATUSES } from '@/features/accounts/types'
import type { LabourReceivableListParams } from '@/features/accounts/types'
import { cn } from '@/lib/utils'

/**
 * What Walton owes on the labour side, a month at a time.
 *
 * The month is the first level because that is how a labour bill is kept — one
 * sheet, one claim — and the CSDs inside it are the second, because that is how
 * it is **paid**. Opening a month is what gets to the cards a payment is
 * recorded from.
 */
export function AccountsLabourBillsPage() {
  return (
    <AccountsShell
      title="Walton Labour Bill"
      description="What each month's labour bill came to, and what has arrived. Open a month to see its CSDs — Walton settles each of them separately, so each has its own card and its own payment."
    >
      <LabourBillsBody />
    </AccountsShell>
  )
}

function LabourBillsBody() {
  const [params, setParams] = useState<LabourReceivableListParams>({
    page: 1,
    limit: 24,
    year: null,
    status: 'all',
  })
  const query = useLabourReceivables(params)
  const totals = query.data?.totals
  const years = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index)
  const patch = (next: Partial<LabourReceivableListParams>) =>
    setParams((current) => ({ ...current, ...next, page: 1 }))

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="Labour billed"
          value={taka(totals?.billedAmount ?? 0)}
          hint={totals && `${totals.total} ${totals.total === 1 ? 'month' : 'months'}`}
          icon={HardHat}
          tone="indigo"
          isLoading={query.isPending}
        />
        <StatTile
          label="Received"
          value={taka(totals?.receivedAmount ?? 0)}
          hint="Walton payments against a CSD"
          icon={Wallet}
          tone="emerald"
          isLoading={query.isPending}
        />
        <StatTile
          label="Still to receive"
          value={taka(totals?.outstanding ?? 0)}
          hint="Across every CSD of every month"
          icon={HandCoins}
          tone="amber"
          isLoading={query.isPending}
        />
        <StatTile
          label="Months"
          value={(totals?.total ?? 0).toLocaleString()}
          hint="Matching these filters"
          icon={CalendarRange}
          tone="violet"
          isLoading={query.isPending}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Year" className="flex flex-wrap gap-1 rounded-lg border bg-card p-0.5">
          {[null, ...years].map((year) => (
            <button
              key={year ?? 'all'}
              type="button"
              role="radio"
              aria-checked={params.year === year}
              onClick={() => patch({ year })}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium tabular-nums transition',
                params.year === year
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {year ?? 'All years'}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Payment" className="flex flex-wrap gap-1 rounded-lg border bg-card p-0.5">
          {(['all', ...SETTLEMENT_STATUSES] as const).map((status) => (
            <button
              key={status}
              type="button"
              role="radio"
              aria-checked={params.status === status}
              onClick={() => patch({ status })}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition',
                params.status === status
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {status === 'all' ? 'Any payment' : SETTLEMENT_META[status].received}
            </button>
          ))}
        </div>
      </div>

      {query.isError ? (
        <p className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">
          {query.error.message}
        </p>
      ) : query.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-60 rounded-xl" />
          ))}
        </div>
      ) : query.data.records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-16 text-center">
          <HardHat className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No labour bill to receive against</p>
          <p className="max-w-md text-xs text-muted-foreground">
            A month appears here as soon as a labour bill is opened for it and challans are scanned
            in. What each CSD comes to is read off that sheet, so there is nothing to enter.
          </p>
        </div>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.records.map((month) => (
            <LabourMonthCard key={month.id} month={month} />
          ))}
        </div>
      )}

      {query.data && query.data.meta.total > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ListPagination
            meta={query.data.meta}
            onPageChange={(page) => setParams((current) => ({ ...current, page }))}
            isFetching={query.isFetching}
            noun={['month', 'months']}
          />
        </div>
      )}
    </div>
  )
}
