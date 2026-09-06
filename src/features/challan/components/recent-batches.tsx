import { ChevronRight, Layers } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatRelative } from '@/lib/format'
import { useChallanBatches } from '../hooks/use-challans'
import { ChallanBatchStatusBadge } from './challan-status-badge'

/**
 * The last few source PDFs, and how far through each one the operation got.
 *
 * This is the answer to the question the module otherwise leaves hanging: a
 * source file is temporary, so an operator who filed eight of fifteen challans
 * and closed the tab has no other way to find out which file still has pages
 * outstanding. The batch rows are the durable trace of that.
 *
 * Deliberately short. It is a pointer back into unfinished work, not a second
 * records table — anything longer belongs on the batch page itself.
 */
export function RecentBatches() {
  const query = useChallanBatches({ page: 1, limit: 4, status: 'all', search: '' })
  const batches = query.data?.records ?? []

  if (query.isError) {
    return null
  }

  if (!query.isPending && batches.length === 0) {
    return null
  }

  return (
    <section
      aria-label="Recent source batches"
      className="mb-6 overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <header className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-3">
        <Layers className="size-4 text-muted-foreground" aria-hidden />
        <h2 className="text-[13px] font-semibold tracking-tight">Recent source PDFs</h2>
        <p className="ml-auto text-xs text-muted-foreground">
          Where each file got to. The files themselves are not stored.
        </p>
      </header>

      {query.isPending ? (
        <div className="divide-y">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="h-3.5 w-56 max-w-full" />
              <Skeleton className="ml-auto h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <ul className="divide-y">
          {batches.map((batch) => (
            <li key={batch.id}>
              <Link
                to={`/challan/batch/${batch.id}`}
                className="flex items-center gap-3 px-4 py-3 transition-colors outline-none hover:bg-primary/[0.035] focus-visible:bg-primary/[0.035]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium" title={batch.sourceFileName}>
                    {batch.sourceFileName}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {batch.challanCount} filed · {batch.assignedPages}/{batch.sourcePageCount} pages
                    · {formatRelative(batch.createdAt)}
                    {/* Only once the file can actually be printed as one
                        document. A batch still being worked through has no
                        print state worth reporting, and saying "not printed"
                        about it would read as something to act on. */}
                    {batch.isComplete && (
                      <>
                        {' · '}
                        <span
                          className={cn(
                            batch.isPrinted ? 'font-medium text-tone-violet' : 'text-foreground',
                          )}
                        >
                          {batch.isPrinted
                            ? 'printed'
                            : batch.printedChallanCount > 0
                              ? `${batch.printedChallanCount}/${batch.challanCount} printed`
                              : 'not printed'}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="hidden w-28 shrink-0 sm:block">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        batch.isComplete ? 'bg-tone-emerald' : 'bg-primary',
                      )}
                      style={{ width: `${batch.percent}%` }}
                    />
                  </div>
                </div>

                <ChallanBatchStatusBadge status={batch.status} className="shrink-0" />
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
