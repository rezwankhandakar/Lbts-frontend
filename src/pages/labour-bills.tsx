import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { LabourBillFormDialog } from '@/features/labour-bill/components/labour-bill-form-dialog'
import { LabourBillGrid } from '@/features/labour-bill/components/labour-bill-grid'
import { LabourBillListToolbar } from '@/features/labour-bill/components/labour-bill-list-toolbar'
import { LabourBillOverview } from '@/features/labour-bill/components/labour-bill-overview'
import { useLabourBillListParams } from '@/features/labour-bill/hooks/use-labour-bill-list-params'
import { useLabourBills } from '@/features/labour-bill/hooks/use-labour-bills'
import { canWriteLabourBill } from '@/features/labour-bill/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { formatTaka } from '@/lib/format'

/**
 * Every Walton Labour Bill: a month of handling charges, opened as a slot and
 * filled by scanning challans.
 */
export function LabourBillsPage() {
  const canWrite = canWriteLabourBill(useCurrentRole())
  const list = useLabourBillListParams()
  const query = useLabourBills(list.applied)
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
          title="Walton Labour Bill"
          description="One bill per CSD per month. Open a slot, scan the challans in, and type what the handling cost against each model — van, pulling and labour on one side, the floor it went up to on the other. It charges nothing the Excel bill charges, and marks nothing on the Trip DO sheet."
        />
        {canWrite && (
          <Button onClick={() => setCreating(true)} className="mb-6">
            <Plus data-icon="inline-start" aria-hidden />
            New labour bill
          </Button>
        )}
      </div>

      <LabourBillOverview
        meta={meta}
        isLoading={query.isPending}
        params={list.params}
        onChange={list.applyFilters}
      />

      <section aria-label="Labour bills" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <LabourBillListToolbar
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          isFiltered={list.isFiltered}
          summary={
            meta && !query.isPending
              ? `${meta.total.toLocaleString()} ${meta.total === 1 ? 'labour bill' : 'labour bills'} · ${formatTaka(meta.totalAmount)}${
                  list.isFiltered ? ' match these filters' : ' in total'
                }`
              : undefined
          }
        />

        <div className="p-4 sm:p-5">
          <LabourBillGrid
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
          <ListPagination
            meta={meta}
            onPageChange={list.setPage}
            isFetching={query.isFetching}
            noun={['labour bill', 'labour bills']}
          />
        )}
      </section>

      <LabourBillFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}
