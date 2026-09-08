import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { BatchDirectory } from '@/features/challan/components/batch-directory'
import { BatchFilters } from '@/features/challan/components/batch-filters'
import { useBatchListParams } from '@/features/challan/hooks/use-batch-list-params'
import { useChallanBatches } from '@/features/challan/hooks/use-challans'
import { canWriteChallans } from '@/features/challan/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * Every source PDF, and how far through each one the operation got.
 *
 * This is the durable trace of a document that was deliberately never stored.
 * A WhatsApp file is a temporary working source — it lives in the browser for
 * as long as the tab is open and then it is gone — so an operator who filed
 * eight of fifteen challans and closed the tab has no other way to find out
 * which file still has pages outstanding. The batch rows are the whole of what
 * survives about it.
 *
 * It is a page of its own rather than a panel on the records list because the
 * two answer different questions. "Which challans went to this customer" is a
 * question about records; "which file have I not finished" is a question about
 * work in progress, and a four-row preview of it could only ever show the four
 * most recent — which are the ones least likely to be the unfinished ones. A
 * page can be filtered to *Processing* and paged through, which is what
 * actually clears a backlog.
 *
 * Read-only, and deliberately so: everything you can *do* to a batch needs its
 * page counts and unassigned ranges to make sense of, so it lives on the batch
 * page. This is the way in.
 */
export function ChallanBatchesPage() {
  const role = useCurrentRole()
  const canWrite = canWriteChallans(role)

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useBatchListParams()

  const query = useChallanBatches(applied)

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  // A filter that shrinks the result set can leave the current page past the
  // end of it. Clamping during render lands on the last real page instead of
  // an empty one.
  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <Button
        variant="ghost"
        size="sm"
        render={<Link to="/challan" />}
        className="mb-3 -ml-2 text-muted-foreground"
      >
        <ArrowLeft data-icon="inline-start" aria-hidden />
        Challan records
      </Button>

      <PageHeader
        title="Source PDFs"
        description="Every corporate PDF challans have been filed out of, and how far through each one the operation got. The files themselves are never stored — a batch is created by the first challan filed out of a file, and this is the only trace of it that survives."
      />

      <section
        aria-label="Source PDF batches"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <BatchFilters
          params={params}
          onChange={applyFilters}
          onReset={reset}
          summary={
            meta && !query.isPending
              ? `${meta.total} ${meta.total === 1 ? 'source PDF' : 'source PDFs'}${
                  isFiltered ? ' match these filters' : ' processed'
                }`
              : undefined
          }
        />

        <BatchDirectory
          records={records}
          isLoading={query.isPending}
          isFetching={query.isFetching}
          isError={query.isError}
          errorMessage={query.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          canWrite={canWrite}
          onRetry={() => void query.refetch()}
          onReset={reset}
        />

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={query.isFetching}
            noun={['source PDF', 'source PDFs']}
          />
        )}
      </section>
    </div>
  )
}
