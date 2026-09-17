import { useSearchParams } from 'react-router-dom'
import { ListPagination } from '@/components/shared/list-pagination'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { CashBookToolbar } from '@/features/accounts/components/cash-book-toolbar'
import { EntryList } from '@/features/accounts/components/entry-list'
import { EntryTotals } from '@/features/accounts/components/entry-totals'
import { QuickActions } from '@/features/accounts/components/quick-actions'
import { useEntries } from '@/features/accounts/hooks/use-accounts'
import { useEntryListParams } from '@/features/accounts/hooks/use-entry-list-params'
import { canWriteAccounts } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * Every movement of money, newest first. Choosing one wallet and a date range
 * turns it into that wallet's statement, with an opening and closing balance.
 * `?wallet=` seeds the wallet, which is how a wallet card opens its own book.
 */
export function AccountsCashBookPage() {
  const canWrite = canWriteAccounts(useCurrentRole())
  const [searchParams] = useSearchParams()
  const list = useEntryListParams({ walletId: searchParams.get('wallet') ?? '' })
  const query = useEntries(list.applied)
  const meta = query.data?.meta

  if (meta && list.params.page > meta.totalPages) {
    list.setPage(meta.totalPages)
  }

  return (
    <AccountsShell
      title="Cash Book"
      description="Every deposit, payment, advance, expense and transfer. Pick a wallet and a date range to read it as that wallet's statement."
    >
      {canWrite && <QuickActions className="mb-5" />}

      <section aria-label="Entries" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <CashBookToolbar params={list.params} onChange={list.applyFilters} onReset={list.reset} isFiltered={list.isFiltered} />
        <div className="border-b px-4 py-3 sm:px-5">
          <EntryTotals totals={query.data?.totals} />
        </div>

        <EntryList
          records={query.data?.records ?? []}
          isLoading={query.isPending}
          errorMessage={query.isError ? query.error.message : null}
          onRetry={() => void query.refetch()}
          canWrite={canWrite}
          walletId={list.applied.walletId || undefined}
          emptyTitle={list.isFiltered ? 'Nothing matches these filters' : 'No entries yet'}
        />

        {meta && !query.isError && (
          <ListPagination meta={meta} onPageChange={list.setPage} isFetching={query.isFetching} noun={['entry', 'entries']} />
        )}
      </section>
    </AccountsShell>
  )
}
