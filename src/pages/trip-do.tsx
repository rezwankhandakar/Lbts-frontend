import { useSearchParams } from 'react-router-dom'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { AssignTripDoDialog } from '@/features/trip-do/components/assign-trip-do-dialog'
import { BulkLinkBar } from '@/features/trip-do/components/bulk-link-bar'
import { SplitRowDialog } from '@/features/trip-do/components/split-row-dialog'
import {
  ExportTripDoDialog,
  UnlinkTripDoDialog,
} from '@/features/trip-do/components/trip-do-confirm-dialogs'
import { TripDoDirectory } from '@/features/trip-do/components/trip-do-directory'
import { TripDoOverview } from '@/features/trip-do/components/trip-do-overview'
import { TripDoToolbar } from '@/features/trip-do/components/trip-do-toolbar'
import { useRowSelection } from '@/features/trip-do/hooks/use-row-selection'
import { useTripDoRows } from '@/features/trip-do/hooks/use-trip-do'
import { useTripDoActions } from '@/features/trip-do/hooks/use-trip-do-actions'
import { useTripDoExport } from '@/features/trip-do/hooks/use-trip-do-export'
import { useTripDoListParams } from '@/features/trip-do/hooks/use-trip-do-list-params'
import { canWriteTripDo } from '@/features/trip-do/types'
import { useCurrentRole } from '@/hooks/use-current-role'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'

/**
 * The Trip DO sheet: every product line of every filed challan on a row of its
 * own, with the pieces that came back off a trip and the pieces a later trip
 * took out again beneath it — and on each row, the gate pass it came out on.
 *
 * Setting a Trip DO ties a row to one gate pass line. The gate pass supplies
 * the CSD and the unit, and in return shows, line by line, where the challans
 * linked to it say its goods are.
 *
 * `?q=` seeds the search, which is how a gate pass page opens the sheet on its
 * own Trip DO.
 */
export function TripDoPage() {
  const role = useCurrentRole()
  const canWrite = canWriteTripDo(role)
  const [searchParams] = useSearchParams()

  const list = useTripDoListParams(searchParams.get('q') ?? '')
  const rowsQuery = useTripDoRows(list.applied)
  const selection = useRowSelection()
  const actions = useTripDoActions(selection.clear)
  const exporter = useTripDoExport(list.applied)

  const records = rowsQuery.data?.records ?? []
  const meta = rowsQuery.data?.meta

  // A merge or an unlink can shorten the sheet past the current page.
  if (meta && list.params.page > meta.totalPages) {
    list.clampToPages(meta.totalPages)
  }

  return (
    <div className={cn('mx-auto w-full max-w-[1600px]', selection.count > 0 && 'pb-24')}>
      <PageHeader
        title="Trip DO"
        description="Every challan product line on a row of its own, with returns and re-sends beneath it. Set the Trip DO a row came out on — split the quantity when a line came out on more than one — and the gate pass supplies its CSD and unit, and shows where its goods are."
      />

      <TripDoOverview
        meta={meta}
        isLoading={rowsQuery.isPending}
        params={list.params}
        onChange={list.applyFilters}
      />

      <section aria-label="Trip DO sheet" className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <TripDoToolbar
          params={list.params}
          onChange={list.applyFilters}
          onReset={list.reset}
          isFiltered={list.isFiltered}
          onExport={exporter.request}
          canExport={Boolean(meta && meta.total > 0)}
          isExporting={exporter.isExporting}
          summary={
            meta && !rowsQuery.isPending
              ? `${meta.total.toLocaleString()} ${meta.total === 1 ? 'row' : 'rows'} · ${meta.totalQty.toLocaleString()} pcs · ${formatTaka(meta.totalAmount)}${
                  list.isFiltered ? ' match these filters' : ' on the sheet'
                }`
              : undefined
          }
        />

        <TripDoDirectory
          rows={records}
          isLoading={rowsQuery.isPending}
          isFetching={rowsQuery.isFetching}
          errorMessage={rowsQuery.isError ? rowsQuery.error.message : null}
          isFiltered={list.isFiltered}
          canWrite={canWrite}
          selection={selection}
          filters={list.params}
          onFilterChange={list.applyFilters}
          onRetry={() => void rowsQuery.refetch()}
          onReset={list.reset}
          onLink={actions.openLink}
          onSplit={actions.openSplit}
          onMerge={actions.merge}
          onUnlink={actions.openUnlink}
        />

        {meta && !rowsQuery.isError && (
          <ListPagination
            meta={meta}
            onPageChange={list.setPage}
            isFetching={rowsQuery.isFetching}
            noun={['row', 'rows']}
          />
        )}
      </section>

      {canWrite && (
        <BulkLinkBar selection={selection} onLink={() => actions.openBulk(selection.selected)} />
      )}

      <AssignTripDoDialog
        target={actions.linkTarget}
        open={actions.linkTarget !== null}
        isPending={actions.isLinking}
        onOpenChange={(open) => !open && actions.closeLink()}
        onConfirm={actions.confirmLink}
      />

      <SplitRowDialog
        row={actions.splitRow}
        open={actions.splitRow !== null}
        isPending={actions.isSplitting}
        onOpenChange={(open) => !open && actions.closeSplit()}
        onConfirm={actions.confirmSplit}
      />

      <UnlinkTripDoDialog
        row={actions.unlinkRow}
        open={actions.unlinkRow !== null}
        isPending={actions.isUnlinking}
        onOpenChange={(open) => !open && actions.closeUnlink()}
        onConfirm={actions.confirmUnlink}
      />

      <ExportTripDoDialog
        meta={meta}
        open={exporter.isConfirming}
        isExporting={exporter.isExporting}
        onCancel={exporter.cancel}
        onConfirm={exporter.confirm}
      />
    </div>
  )
}
