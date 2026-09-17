import { CircleCheckBig, HandCoins, Plus, Search, Wallet } from 'lucide-react'
import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { AdvanceCard } from '@/features/accounts/components/advance-card'
import { useAdvances } from '@/features/accounts/hooks/use-accounts'
import { useEntryDialog } from '@/features/accounts/hooks/use-entry-dialog'
import { taka } from '@/features/accounts/lib/accounts-meta'
import { canWriteAccounts } from '@/features/accounts/types'
import type { AdvanceStatusFilter } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'

const STATUS_OPTIONS: { value: AdvanceStatusFilter; label: string }[] = [
  { value: 'outstanding', label: 'Outstanding' },
  { value: 'Open', label: 'Untouched' },
  { value: 'Partial', label: 'Partly settled' },
  { value: 'Settled', label: 'Settled' },
  { value: 'all', label: 'All' },
]

export function AccountsAdvancesPage() {
  return (
    <AccountsShell
      title="Advances"
      description="Money given to anyone — staff, a driver, a contractor — until it comes back in cash. Trip advances to vendors are on Vendor Bills."
    >
      <AdvancesBody />
    </AccountsShell>
  )
}

function AdvancesBody() {
  const canWrite = canWriteAccounts(useCurrentRole())
  const dialog = useEntryDialog()
  const [status, setStatus] = useState<AdvanceStatusFilter>('outstanding')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const debounced = useDebouncedValue(search.trim(), 300)
  const query = useAdvances({ page, limit: 12, status, search: debounced })
  const totals = query.data?.totals

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Outstanding" value={taka(totals?.outstanding ?? 0)} hint={totals && `${totals.openCount} advances not settled`} icon={HandCoins} tone="amber" isLoading={query.isPending} />
        <StatTile label="Given" value={taka(totals?.totalAmount ?? 0)} hint={totals && `${totals.total} advances in this view`} icon={Wallet} tone="indigo" isLoading={query.isPending} />
        <StatTile label="Settled" value={taka(totals?.settledAmount ?? 0)} hint="Cash returned" icon={CircleCheckBig} tone="emerald" isLoading={query.isPending} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            type="search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            aria-label="Search by person, purpose, phone or number"
            className="pl-8.5"
          />
        </div>
        <div role="radiogroup" aria-label="Status" className="flex w-fit flex-wrap gap-1 rounded-lg border bg-card p-0.5">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={status === option.value}
              onClick={() => {
                setStatus(option.value)
                setPage(1)
              }}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition',
                status === option.value ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
        {canWrite && (
          <Button className="lg:ml-auto" onClick={() => dialog.open({ kind: 'Advance' })}>
            <Plus data-icon="inline-start" aria-hidden />
            Give advance
          </Button>
        )}
      </div>

      {query.isError ? (
        <p className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">{query.error.message}</p>
      ) : query.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : query.data.records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-16 text-center">
          <HandCoins className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">{status === 'outstanding' ? 'No advance is outstanding' : 'No advance here'}</p>
          <p className="text-xs text-muted-foreground">An advance stays listed until its cash is returned.</p>
        </div>
      ) : (
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.records.map((advance) => (
            <AdvanceCard key={advance.id} advance={advance} canWrite={canWrite} />
          ))}
        </div>
      )}

      {query.data && query.data.meta.total > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ListPagination meta={query.data.meta} onPageChange={setPage} isFetching={query.isFetching} noun={['advance', 'advances']} />
        </div>
      )}
    </div>
  )
}
