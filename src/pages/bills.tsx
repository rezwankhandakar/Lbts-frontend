import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { BillFormDialog } from '@/features/bill/components/bill-form-dialog'
import { BillGrid } from '@/features/bill/components/bill-grid'
import { BillListToolbar } from '@/features/bill/components/bill-list-toolbar'
import { BillOverview } from '@/features/bill/components/bill-overview'
import { useBillListParams } from '@/features/bill/hooks/use-bill-list-params'
import { useBills } from '@/features/bill/hooks/use-bills'
import { canWriteBill } from '@/features/bill/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { formatTaka } from '@/lib/format'

/**
 * Every bill: a unit's month of Trip DOs, as the Excel sheet the office sends.
 * A bill is opened here as a slot — a month and a unit — and filled on its own
 * page by searching the Trip DO sheet.
 */
export function BillsPage() {
  const canWrite = canWriteBill(useCurrentRole())
  const list = useBillListParams()
  const query = useBills(list.applied)
  const [creating, setCreating] = useState(false)

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  // A deleted bill can shorten the list past the current page.
  if (meta && list.params.page > meta.totalPages) {
    list.clampToPages(meta.totalPages)
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <div className="flex flex-wrap items-start justify-between gap-x-6">
        <PageHeader
          title="Excel Bill"
          description="Open a bill slot for a month and a unit, add its Trip DOs, and download the bill in the office's own Excel layout — one SL per Trip DO. Every row you add is marked billed on the Trip DO sheet, the challan and the gate pass."
        />
        {canWrite && (
          <Button onClick={() => setCreating(true)} className="mb-6">
            <Plus data-icon="inline-start" aria-hidden />
            New bill
          </Button>
        )}
      </div>

      <BillOverview meta={meta} isLoading={query.isPending} params={list.params} onChange={list.applyFilters} />

      <section aria-label="Bills" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <BillListToolbar
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          isFiltered={list.isFiltered}
          summary={
            meta && !query.isPending
              ? `${meta.total.toLocaleString()} ${meta.total === 1 ? 'bill' : 'bills'} · ${formatTaka(meta.totalAmount)}${
                  list.isFiltered ? ' match these filters' : ' in total'
                }`
              : undefined
          }
        />

        <div className="p-4 sm:p-5">
          <BillGrid
            records={records}
            isLoading={query.isPending}
            isFetching={query.isFetching}
            errorMessage={query.isError ? query.error.message : null}
            isFiltered={list.isFiltered}
            canCreate={canWrite}
            onRetry={() => void query.refetch()}
            onReset={list.reset}
            onCreate={() => setCreating(true)}
          />
        </div>

        {meta && !query.isError && (
          <ListPagination meta={meta} onPageChange={list.setPage} isFetching={query.isFetching} noun={['bill', 'bills']} />
        )}
      </section>

      <BillFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}
