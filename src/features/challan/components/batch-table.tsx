import { ChevronRight, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatBytes } from '../lib/challan-meta'
import { formatDateTime, formatRelative } from '@/lib/format'
import type { ChallanBatchRecord } from '../types'
import { ChallanBatchStatusBadge } from './challan-status-badge'

interface BatchTableProps {
  records: ChallanBatchRecord[]
}

/**
 * The source PDFs, one row each.
 *
 * A list of rows rather than a column table, because a batch is not really
 * tabular: it is a file name and a sentence about how far through it somebody
 * got. Squeezing that into six columns would push the file name — the only
 * thing anybody recognises a batch by — into a truncated cell.
 *
 * Every row is a link to the batch page. There is no action menu here on
 * purpose: everything you can *do* to a batch (continue entering, download,
 * print, mark pages blank) needs the page count and the unassigned ranges to
 * make sense of, and those live on the batch page itself. A list that offered
 * Download beside a half-finished file would be offering a button the API
 * refuses.
 */
export function BatchTable({ records }: BatchTableProps) {
  return (
    <ul className="divide-y">
      {records.map((batch) => (
        <li key={batch.id}>
          <Link
            to={`/challan/batch/${batch.id}`}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors outline-none hover:bg-primary/[0.035] focus-visible:bg-primary/[0.035]"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium" title={batch.sourceFileName}>
                {batch.sourceFileName}
              </p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {batch.challanCount} filed · {batch.assignedPages}/{batch.sourcePageCount} pages
                {batch.sourceFileSize ? ` · ${formatBytes(batch.sourceFileSize)}` : ''}
                {' · '}
                <span title={formatDateTime(batch.createdAt)}>
                  {formatRelative(batch.createdAt)}
                </span>
                {batch.createdBy ? ` · ${batch.createdBy.name}` : ''}
              </p>

              {/* The unfinished ones say what is outstanding, because that is
                  the only thing anybody comes to this list to find out. A
                  completed batch says nothing here — its badge already has. */}
              {!batch.isComplete && batch.unassignedPages > 0 && (
                <p className="mt-0.5 text-xs text-tone-amber">
                  {batch.unassignedPages}{' '}
                  {batch.unassignedPages === 1 ? 'page' : 'pages'} still unaccounted for
                </p>
              )}
            </div>

            {/* Only once the file can actually be printed as one document. A
                batch still being worked through has no print state worth
                reporting, and "not printed" about it would read as something
                to act on when the thing to act on is the pages. */}
            {batch.isComplete && (
              <span
                className={cn(
                  'hidden shrink-0 items-center gap-1.5 text-xs whitespace-nowrap sm:inline-flex',
                  batch.isPrinted ? 'font-medium text-tone-violet' : 'text-muted-foreground',
                )}
              >
                <Printer className="size-3.5" aria-hidden />
                {batch.isPrinted
                  ? 'Printed'
                  : batch.printedChallanCount > 0
                    ? `${batch.printedChallanCount}/${batch.challanCount} printed`
                    : 'Not printed'}
              </span>
            )}

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
  )
}
