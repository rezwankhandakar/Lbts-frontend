import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChallanDirectory } from '@/features/challan/components/challan-directory'
import { ChallanFilters } from '@/features/challan/components/challan-filters'
import { ChallanPagination } from '@/features/challan/components/challan-pagination'
import { ChallanStats } from '@/features/challan/components/challan-stats'
import { DeleteChallanDialog } from '@/features/challan/components/delete-challan-dialog'
import { RecentBatches } from '@/features/challan/components/recent-batches'
import { useChallanActions } from '@/features/challan/hooks/use-challan-actions'
import { useChallanListParams } from '@/features/challan/hooks/use-challan-list-params'
import { useChallanStats, useChallans } from '@/features/challan/hooks/use-challans'
import { canManageAnyChallan, canWriteChallans } from '@/features/challan/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * The challan records.
 *
 * Everything that narrows the list — search, status, dates, customer,
 * district, product, model, zone/PO, owner — is applied server-side and paged
 * server-side. That is not an optimisation: on the M0 free tier, fetching a
 * year of challans to filter them in the browser is the one query that would
 * take the cluster down.
 */
export function ChallanPage() {
  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const list = useChallanListParams()

  const query = useChallans(list.applied)
  const statsQuery = useChallanStats()
  const actions = useChallanActions()

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && list.params.page > meta.totalPages) {
    list.clampToPages(meta.totalPages)
  }

  const canWrite = canWriteChallans(role)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Challan</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            Every challan filed out of a corporate PDF, with its serial, its barcode back page and
            the document that was generated for it.
          </p>
        </div>

        {canWrite && (
          <Button render={<Link to="/challan/new" />} className="shrink-0">
            <Plus data-icon="inline-start" aria-hidden />
            Open a challan PDF
          </Button>
        )}
      </div>

      <ChallanStats
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        isError={statsQuery.isError}
        onRetry={() => void statsQuery.refetch()}
      />

      <RecentBatches />

      <section
        aria-label="Challan records"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <ChallanFilters
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          totalQty={meta?.totalQty}
          canFilterByOwner={canManageAnyChallan(role)}
          currentUserId={currentUserId}
          summary={
            meta && !query.isPending
              ? `${meta.total} ${meta.total === 1 ? 'challan' : 'challans'}${
                  list.isFiltered ? ' match these filters' : ' on record'
                }`
              : undefined
          }
        />

        <ChallanDirectory
          records={records}
          isLoading={query.isPending}
          isFetching={query.isFetching}
          isError={query.isError}
          errorMessage={query.error?.message ?? 'Something went wrong.'}
          isFiltered={list.isFiltered}
          onRetry={() => void query.refetch()}
          onReset={list.reset}
          onOpen={actions.open}
          actions={{
            role,
            currentUserId,
            onOpen: actions.open,
            onEdit: actions.edit,
            onDownload: actions.download,
            onPrint: actions.print,
            onOpenBatch: actions.openBatch,
            onDelete: actions.openDelete,
          }}
        />

        {meta && !query.isError && (
          <ChallanPagination
            meta={meta}
            onPageChange={list.setPage}
            isFetching={query.isFetching}
          />
        )}
      </section>

      <DeleteChallanDialog
        record={actions.target}
        open={actions.isConfirmingDelete}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
