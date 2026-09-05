import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DeleteGatePassDialog } from '@/features/gate-pass/components/delete-gate-pass-dialog'
import { ExportGatePassesDialog } from '@/features/gate-pass/components/export-gate-passes-dialog'
import { GatePassDirectory } from '@/features/gate-pass/components/gate-pass-directory'
import { GatePassFilters } from '@/features/gate-pass/components/gate-pass-filters'
import { GatePassPagination } from '@/features/gate-pass/components/gate-pass-pagination'
import { GatePassStats } from '@/features/gate-pass/components/gate-pass-stats'
import { ReviewDialog } from '@/features/gate-pass/components/review-dialog'
import { useGatePassActions } from '@/features/gate-pass/hooks/use-gate-pass-actions'
import { useGatePassExport } from '@/features/gate-pass/hooks/use-gate-pass-export'
import { useGatePassListParams } from '@/features/gate-pass/hooks/use-gate-pass-list-params'
import { useGatePassStats, useGatePasses } from '@/features/gate-pass/hooks/use-gate-passes'
import {
  canManageAnyGatePass,
  canReviewGatePasses,
  canWriteGatePasses,
} from '@/features/gate-pass/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useAuthStore } from '@/stores/use-auth-store'

/**
 * The gate pass records.
 *
 * Everything that narrows the list — search, status, dates, depot, unit,
 * product, reference, owner — is applied server-side and paged server-side.
 * That is not an optimisation: on the M0 free tier, fetching a year of gate
 * passes to filter them in the browser is the one query that would take the
 * cluster down. The quantity total and the spreadsheet are read from the same
 * filters for the same reason: both are about every matching record, and only
 * the server has ever seen more than ten of them.
 */
export function GatePassPage() {
  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const list = useGatePassListParams()

  const query = useGatePasses(list.applied)
  const statsQuery = useGatePassStats()
  const actions = useGatePassActions()
  const exporter = useGatePassExport(list.applied)

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && list.params.page > meta.totalPages) {
    list.clampToPages(meta.totalPages)
  }

  const canWrite = canWriteGatePasses(role)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Gate Pass</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            Every gate pass recorded against a trip, with the scanned hard copy attached to it.
          </p>
        </div>

        {canWrite && (
          <Button render={<Link to="/gate-pass/new" />} className="shrink-0">
            <Plus data-icon="inline-start" aria-hidden />
            New gate pass
          </Button>
        )}
      </div>

      <GatePassStats
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        isError={statsQuery.isError}
        onRetry={() => void statsQuery.refetch()}
      />

      <section
        aria-label="Gate pass records"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <GatePassFilters
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          totalQty={meta?.totalQty}
          onExport={exporter.request}
          canExport={Boolean(meta && meta.total > 0)}
          isExporting={exporter.isExporting}
          canFilterByOwner={canManageAnyGatePass(role)}
          currentUserId={currentUserId}
          summary={
            meta && !query.isPending
              ? `${meta.total} ${meta.total === 1 ? 'gate pass' : 'gate passes'}${
                  list.isFiltered ? ' match these filters' : ' on record'
                }`
              : undefined
          }
        />

        <GatePassDirectory
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
            canWrite,
            canReview: canReviewGatePasses(role),
            currentUserId,
            onOpen: actions.open,
            onEdit: actions.edit,
            onDownload: actions.download,
            onPrint: actions.print,
            onReview: actions.openReview,
            onDelete: actions.openDelete,
          }}
        />

        {meta && !query.isError && (
          <GatePassPagination
            meta={meta}
            onPageChange={list.setPage}
            isFetching={query.isFetching}
          />
        )}
      </section>

      {/* Only mounted once there is a result set to describe: the dialog's
          whole job is to state what the file will contain. */}
      {meta && (
        <ExportGatePassesDialog
          open={exporter.isConfirming}
          total={meta.total}
          totalQty={meta.totalQty}
          isFiltered={list.isFiltered}
          isPending={exporter.isExporting}
          onOpenChange={(open) => !open && exporter.cancel()}
          onConfirm={exporter.confirm}
        />
      )}

      <ReviewDialog
        record={actions.target}
        decision={actions.decision}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmReview}
      />

      <DeleteGatePassDialog
        record={actions.target}
        open={actions.isConfirmingDelete}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
