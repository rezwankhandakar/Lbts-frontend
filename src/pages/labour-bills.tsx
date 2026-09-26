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
import { formatNumber, formatTaka } from '@/lib/format'
import { useT } from '@/lib/i18n'

/**
 * Every Walton Labour Bill: a month of handling charges, opened as a slot and
 * filled by scanning challans.
 */
export function LabourBillsPage() {
  const t = useT()

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
          title={t('labourBill.title')}
          description={t('labourBill.pageDescription')}
        />
        {canWrite && (
          <Button onClick={() => setCreating(true)} className="mb-6">
            <Plus data-icon="inline-start" aria-hidden />
            {t('labourBill.newBill')}
          </Button>
        )}
      </div>

      <LabourBillOverview
        meta={meta}
        isLoading={query.isPending}
        params={list.params}
        onChange={list.applyFilters}
      />

      <section aria-label={t('labourBill.listAria')} className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <LabourBillListToolbar
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          isFiltered={list.isFiltered}
          summary={
            meta && !query.isPending
              ? t(
                  list.isFiltered
                    ? 'labourBill.stats.summaryFiltered'
                    : 'labourBill.stats.summaryTotal',
                  {
                    bills: t('labourBill.stats.billCount', {
                      count: meta.total,
                      n: formatNumber(meta.total),
                    }),
                    amount: formatTaka(meta.totalAmount),
                  },
                )
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
            nounKey="nouns.labourBill"
          />
        )}
      </section>

      <LabourBillFormDialog open={creating} onOpenChange={setCreating} />
    </div>
  )
}
