import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { ActivityDetailSheet } from '@/features/activity/components/activity-detail-sheet'
import { ActivityOverview } from '@/features/activity/components/activity-overview'
import { ActivityTimeline } from '@/features/activity/components/activity-timeline'
import { ActivityToolbar } from '@/features/activity/components/activity-toolbar'
import { ExportActivityDialog } from '@/features/activity/components/export-activity-dialog'
import { useActivityExport } from '@/features/activity/hooks/use-activity-export'
import { useActivityListParams } from '@/features/activity/hooks/use-activity-list-params'
import {
  useActivity,
  useActivityFilters,
  useActivityStats,
} from '@/features/activity/hooks/use-activity'
import { canExportActivity } from '@/features/activity/types'
import type { ActivityRecord } from '@/features/activity/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The activity journal: who did what, across every module.
 *
 * **This page reads, and nothing on it writes.** There is no create, no edit
 * and no delete anywhere in the module — rows are appended by services through
 * `recordActivity` and by nothing a request can reach. An audit log somebody
 * can edit is not one, and a page offering a row menu would be promising
 * otherwise.
 *
 * Read top to bottom it narrows, like every other overview in this app: what
 * the filtered set adds up to, then how to narrow it, then the events
 * themselves grouped by day, then one event in full.
 *
 * Every figure answers the filters rather than the page — the rule every total
 * in this codebase follows — which is why the overview takes the same params
 * the list does and the export takes them again. A file that described a set
 * of rows nobody was looking at would be the worst thing this page could
 * produce.
 */
export function ActivityPage() {
  const role = useCurrentRole()
  const canExport = canExportActivity(role)

  const {
    params,
    applied,
    isFiltered,
    quickRange,
    applyFilters,
    applyQuickRange,
    setPage,
    clampToPages,
    reset,
  } = useActivityListParams()

  const activityQuery = useActivity(applied)
  const statsQuery = useActivityStats(applied)
  const filtersQuery = useActivityFilters()
  const exportController = useActivityExport(applied)

  const [open, setOpen] = useState<ActivityRecord | null>(null)

  const records = activityQuery.data?.records ?? []
  const meta = activityQuery.data?.meta

  // A filter that narrows the set leaves the current page past the end of it.
  // Clamping during render lands the reader on the last real page instead of
  // an empty one.
  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Activity Logs"
        description="Every change the system records, in one place: what happened, which record it touched, and who did it. Rows are written by the system as people work and can never be edited or removed from here — that is what makes it worth reading."
      />

      <ActivityOverview
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        params={params}
        onChange={applyFilters}
      />

      <section
        aria-label="Activity journal"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <ActivityToolbar
          params={params}
          options={filtersQuery.data}
          quickRange={quickRange}
          isFiltered={isFiltered}
          canExport={canExport}
          onChange={applyFilters}
          onQuickRange={applyQuickRange}
          onReset={reset}
          onExport={exportController.request}
          summary={
            meta && !activityQuery.isPending
              ? `${meta.total.toLocaleString()} ${meta.total === 1 ? 'event' : 'events'}${
                  isFiltered ? ' match these filters' : ' in the journal'
                }`
              : undefined
          }
        />

        <ActivityTimeline
          records={records}
          isLoading={activityQuery.isPending}
          isFetching={activityQuery.isFetching}
          isError={activityQuery.isError}
          errorMessage={activityQuery.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          onRetry={() => void activityQuery.refetch()}
          onReset={reset}
          onOpen={setOpen}
        />

        {meta && !activityQuery.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={activityQuery.isFetching}
            noun={['event', 'events']}
          />
        )}
      </section>

      <ActivityDetailSheet record={open} onClose={() => setOpen(null)} />

      {canExport && (
        <ExportActivityDialog
          stats={statsQuery.data}
          isFiltered={isFiltered}
          open={exportController.isConfirming}
          isExporting={exportController.isExporting}
          onCancel={exportController.cancel}
          onConfirm={exportController.confirm}
        />
      )}
    </div>
  )
}
