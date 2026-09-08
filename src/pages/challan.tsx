import { Layers, Plus } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChallanDirectory } from '@/features/challan/components/challan-directory'
import { ChallanFilters } from '@/features/challan/components/challan-filters'
import { ListPagination } from '@/components/shared/list-pagination'
import { ChallanStats } from '@/features/challan/components/challan-stats'
import { DeleteChallanDialog } from '@/features/challan/components/delete-challan-dialog'
import { useChallanActions } from '@/features/challan/hooks/use-challan-actions'
import { useChallanLocationReview } from '@/features/challan/hooks/use-challan-location-review'
import { useChallanListParams } from '@/features/challan/hooks/use-challan-list-params'
import { useChallanStats, useChallans } from '@/features/challan/hooks/use-challans'
import { canManageAnyChallan, canWriteChallans } from '@/features/challan/types'
import type { ChallanListParams } from '@/features/challan/types'
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

  /**
   * Settling a run of locations happens on its own page, and this is how the
   * filtered list somebody left survives the trip. Router state rather than
   * the URL, because these filters have never been in the URL — carrying them
   * back is a convenience for one journey, not a promise that a link
   * reproduces a view.
   */
  const { state } = useLocation()
  const restored = (state as { challanFilters?: ChallanListParams } | null)?.challanFilters

  const list = useChallanListParams(undefined, restored)

  const query = useChallans(list.applied)
  const statsQuery = useChallanStats()
  const actions = useChallanActions()

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  /**
   * Settling a location starts here and finishes on its own page.
   *
   * The two working filters — nothing determined, and determined by inference
   * and unread — describe a backlog, and a backlog is cleared in a run. This
   * is what turns the row somebody clicked into that run: the rest of the
   * filtered page travels with them, so they come back once at the end rather
   * than after every record.
   */
  const locationReview = useChallanLocationReview(records, list.params)

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

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {/* Where the "Recent source PDFs" panel used to be, as a way in
              rather than a preview of it. Four rows could only ever show the
              four most recent files, which are the ones least likely to be the
              unfinished ones; the page they lead to can be filtered to
              Processing and paged through, which is what actually answers
              "which file have I not finished". Visible to every role that can
              read a challan — following a file's progress is not a write. */}
          <Button variant="outline" render={<Link to="/challan/batches" />}>
            <Layers data-icon="inline-start" aria-hidden />
            Source PDFs
          </Button>

          {canWrite && (
            <Button render={<Link to="/challan/new" />}>
              <Plus data-icon="inline-start" aria-hidden />
              Open a challan PDF
            </Button>
          )}
        </div>
      </div>

      <ChallanStats
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        isError={statsQuery.isError}
        onRetry={() => void statsQuery.refetch()}
      />

      <section
        aria-label="Challan records"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <ChallanFilters
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          meta={meta}
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
            onSetPrinted: actions.setPrinted,
            canMarkPrinted: actions.canMarkPrinted,
            onOpenBatch: actions.openBatch,
            onSetLocation: locationReview.openFor,
            onDelete: actions.openDelete,
          }}
        />

        {meta && !query.isError && (
          <ListPagination
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
