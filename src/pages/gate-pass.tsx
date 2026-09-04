import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { DeleteDraftDialog } from '@/features/gate-pass/components/delete-draft-dialog'
import { GatePassDirectory } from '@/features/gate-pass/components/gate-pass-directory'
import { GatePassFilters } from '@/features/gate-pass/components/gate-pass-filters'
import type { FilterPatch } from '@/features/gate-pass/components/gate-pass-filters'
import { GatePassPagination } from '@/features/gate-pass/components/gate-pass-pagination'
import { GatePassStats } from '@/features/gate-pass/components/gate-pass-stats'
import { ReviewDialog } from '@/features/gate-pass/components/review-dialog'
import { useGatePassActions } from '@/features/gate-pass/hooks/use-gate-pass-actions'
import { useGatePassStats, useGatePasses } from '@/features/gate-pass/hooks/use-gate-passes'
import {
  canManageAnyGatePass,
  canReviewGatePasses,
  canWriteGatePasses,
} from '@/features/gate-pass/types'
import type { GatePassListParams } from '@/features/gate-pass/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAuthStore } from '@/stores/use-auth-store'

const PAGE_SIZE = 10

const INITIAL_PARAMS: GatePassListParams = {
  page: 1,
  limit: PAGE_SIZE,
  search: '',
  status: 'all',
  csd: '',
  unit: '',
  product: '',
  referenceType: 'all',
  reference: '',
  createdBy: '',
  from: '',
  to: '',
}

/**
 * The gate pass records.
 *
 * Everything that narrows the list — search, status, dates, depot, unit,
 * product, reference, owner — is applied server-side and paged server-side.
 * That is not an optimisation: on the M0 free tier, fetching a year of gate
 * passes to filter them in the browser is the one query that would take the
 * cluster down.
 */
export function GatePassPage() {
  const role = useCurrentRole()
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  const [params, setParams] = useState<GatePassListParams>(INITIAL_PARAMS)

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(params.search, 350)

  /**
   * Any narrowing of the result set invalidates the current page number —
   * filtering to three results while on page four would show nothing. Every
   * filter change returns to page one in the same update, so there is never a
   * render where the page and the filters disagree.
   */
  const applyFilters = (patch: FilterPatch) => {
    setParams((current) => ({ ...current, ...patch, page: 1 }))
  }

  const query = useGatePasses({ ...params, search: debouncedSearch })
  const statsQuery = useGatePassStats()
  const actions = useGatePassActions()

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  // Deleting the last row on a page leaves the current page past the end of
  // the result set. Clamping during render lands the operator on the last real
  // page instead of an empty one.
  if (meta && params.page > meta.totalPages) {
    setParams((current) => ({ ...current, page: meta.totalPages }))
  }

  const isFiltered =
    params.search !== '' ||
    params.status !== 'all' ||
    params.csd !== '' ||
    params.unit !== '' ||
    params.product !== '' ||
    params.referenceType !== 'all' ||
    params.reference !== '' ||
    params.createdBy !== '' ||
    params.from !== '' ||
    params.to !== ''

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
          params={params}
          onChange={applyFilters}
          onReset={() => setParams(INITIAL_PARAMS)}
          canFilterByOwner={canManageAnyGatePass(role)}
          currentUserId={currentUserId}
          summary={
            meta && !query.isPending
              ? `${meta.total} ${meta.total === 1 ? 'gate pass' : 'gate passes'}${
                  isFiltered ? ' match these filters' : ' on record'
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
          isFiltered={isFiltered}
          onRetry={() => void query.refetch()}
          onReset={() => setParams(INITIAL_PARAMS)}
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
            onPageChange={(page) => setParams((current) => ({ ...current, page }))}
            isFetching={query.isFetching}
          />
        )}
      </section>

      <ReviewDialog
        record={actions.target}
        decision={actions.decision}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmReview}
      />

      <DeleteDraftDialog
        record={actions.target}
        open={actions.isConfirmingDelete}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
