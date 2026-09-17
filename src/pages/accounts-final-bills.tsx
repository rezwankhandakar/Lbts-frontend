import { FileBadge, FileSpreadsheet, HandCoins, Plus, Scale } from 'lucide-react'
import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/features/vendor/components/confirm-dialog'
import { StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { FinalBillCard } from '@/features/accounts/components/final-bill-card'
import { FinalBillDialog } from '@/features/accounts/components/final-bill-dialog'
import { useFinalBills } from '@/features/accounts/hooks/use-accounts'
import { useDeleteFinalBill } from '@/features/accounts/hooks/use-accounts-mutations'
import { SETTLEMENT_META, signedTaka, taka } from '@/features/accounts/lib/accounts-meta'
import { SETTLEMENT_STATUSES, canWriteAccounts } from '@/features/accounts/types'
import type { FinalBillListParams, FinalBillRecord } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { cn } from '@/lib/utils'

export function AccountsFinalBillsPage() {
  const canWrite = canWriteAccounts(useCurrentRole())
  const [editing, setEditing] = useState<FinalBillRecord | null>(null)
  const [creating, setCreating] = useState(false)

  return (
    <AccountsShell
      title="Walton Final Bill"
      description="After Walton audits a submitted Excel bill, enter the final approved amount here. It is the income the profit and loss is built on, compared against what the Excel bill asked for."
      actions={
        canWrite && (
          <Button onClick={() => setCreating(true)}>
            <Plus data-icon="inline-start" aria-hidden />
            Enter final bill
          </Button>
        )
      }
    >
      <FinalBillsBody canWrite={canWrite} onEdit={setEditing} />
      <FinalBillDialog
        open={creating || editing !== null}
        bill={editing}
        onOpenChange={(open) => {
          if (!open) {
            setCreating(false)
            setEditing(null)
          }
        }}
      />
    </AccountsShell>
  )
}

function FinalBillsBody({ canWrite, onEdit }: { canWrite: boolean; onEdit: (bill: FinalBillRecord) => void }) {
  const [params, setParams] = useState<FinalBillListParams>({ page: 1, limit: 24, year: null, unit: '', status: 'all' })
  const unit = useDebouncedValue(params.unit, 300)
  const query = useFinalBills({ ...params, unit })
  const remove = useDeleteFinalBill()
  const [deleting, setDeleting] = useState<FinalBillRecord | null>(null)
  const totals = query.data?.totals
  const years = Array.from({ length: 5 }, (_, index) => new Date().getFullYear() - index)
  const patch = (next: Partial<FinalBillListParams>) => setParams((current) => ({ ...current, ...next, page: 1 }))

  return (
    <div className="grid gap-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Final bills" value={taka(totals?.finalAmount ?? 0)} hint={totals && `${totals.total} unit-months`} icon={FileBadge} tone="emerald" isLoading={query.isPending} />
        <StatTile label="Excel bills asked" value={taka(totals?.submittedAmount ?? 0)} hint="For the same units and months" icon={FileSpreadsheet} tone="indigo" isLoading={query.isPending} />
        <StatTile label="Audit difference" value={signedTaka((totals?.finalAmount ?? 0) - (totals?.submittedAmount ?? 0))} hint="Final less submitted" icon={Scale} tone="violet" isLoading={query.isPending} />
        <StatTile label="Still to receive" value={taka(totals?.outstanding ?? 0)} hint={totals && `${taka(totals.receivedAmount)} received`} icon={HandCoins} tone="amber" isLoading={query.isPending} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div role="radiogroup" aria-label="Year" className="flex flex-wrap gap-1 rounded-lg border bg-card p-0.5">
          {[null, ...years].map((year) => (
            <button key={year ?? 'all'} type="button" role="radio" aria-checked={params.year === year} onClick={() => patch({ year })} className={cn('rounded-md px-2.5 py-1 text-xs font-medium tabular-nums transition', params.year === year ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
              {year ?? 'All years'}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="Payment" className="flex flex-wrap gap-1 rounded-lg border bg-card p-0.5">
          {(['all', ...SETTLEMENT_STATUSES] as const).map((status) => (
            <button key={status} type="button" role="radio" aria-checked={params.status === status} onClick={() => patch({ status })} className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition', params.status === status ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
              {status === 'all' ? 'Any payment' : SETTLEMENT_META[status].received}
            </button>
          ))}
        </div>
        <Input value={params.unit} onChange={(event) => patch({ unit: event.target.value })} aria-label="Unit" className="h-8 w-28 font-mono uppercase" />
      </div>

      {query.isError ? (
        <p className="rounded-xl border bg-card px-4 py-12 text-center text-sm text-muted-foreground">{query.error.message}</p>
      ) : query.isPending ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-72 rounded-xl" />)}
        </div>
      ) : query.data.records.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border bg-card px-4 py-16 text-center">
          <FileBadge className="size-7 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">No final bill entered</p>
          <p className="max-w-md text-xs text-muted-foreground">When Walton sends back the audited amount for a unit's month, enter it here. Until then that month has no income in the profit and loss.</p>
        </div>
      ) : (
        <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
          {query.data.records.map((bill) => (
            <FinalBillCard key={bill.id} bill={bill} canWrite={canWrite} onEdit={() => onEdit(bill)} onDelete={() => setDeleting(bill)} />
          ))}
        </div>
      )}

      {query.data && query.data.meta.total > 0 && (
        <div className="overflow-hidden rounded-xl border bg-card">
          <ListPagination meta={query.data.meta} onPageChange={(page) => setParams((current) => ({ ...current, page }))} isFetching={query.isFetching} noun={['final bill', 'final bills']} />
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        isPending={remove.isPending}
        title={deleting ? `Delete the final bill for ${deleting.unit} · ${deleting.periodLabel}?` : 'Delete final bill?'}
        description="Its income leaves the profit and loss. A final bill with payments recorded against it cannot be deleted until those deposits are."
        confirmLabel="Delete final bill"
        pendingLabel="Deleting…"
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </div>
  )
}
