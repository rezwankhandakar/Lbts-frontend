import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PageMeta } from '../types'

interface ChallanPaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
  /** True while the next page is in flight, so the controls cannot stack requests. */
  isFetching: boolean
  /** "challan" / "challans", or "batch" / "batches" — the same control serves both. */
  noun?: [singular: string, plural: string]
}

/**
 * Server-side paging. The browser never holds more than one page of records —
 * on an M0 cluster, shipping a year of challans to the client to filter them
 * is exactly the query the free tier cannot afford.
 */
export function ChallanPagination({
  meta,
  onPageChange,
  isFetching,
  noun = ['challan', 'challans'],
}: ChallanPaginationProps) {
  if (meta.total === 0) {
    return null
  }

  const first = (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.page * meta.limit, meta.total)

  return (
    <nav
      aria-label={`${noun[1]} pages`}
      className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing <span className="font-medium text-foreground">{first}</span>–
        <span className="font-medium text-foreground">{last}</span> of{' '}
        <span className="font-medium text-foreground">{meta.total}</span>{' '}
        {meta.total === 1 ? noun[0] : noun[1]}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1 || isFetching}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft data-icon="inline-start" aria-hidden />
          Previous
        </Button>

        <span className="px-1 text-xs whitespace-nowrap text-muted-foreground">
          Page {meta.page} of {meta.totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages || isFetching}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
          <ChevronRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
