import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** The paging half of any list response envelope. */
export interface ListPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface ListPaginationProps {
  meta: ListPageMeta
  onPageChange: (page: number) => void
  /** True while the next page is in flight, so the controls cannot stack requests. */
  isFetching: boolean
  /** "challan" / "challans", "location" / "locations" — one control serves both. */
  noun?: [singular: string, plural: string]
}

/**
 * Server-side paging. The browser never holds more than one page of records —
 * on an M0 cluster, shipping a year of challans to the client to filter them
 * is exactly the query the free tier cannot afford.
 *
 * This lived in `features/challan/components/challan-pagination.tsx` until the
 * Location master list needed the same control. CLAUDE.md asks for a move
 * rather than a copy when a second feature wants a piece, and a second copy of
 * "showing 1–10 of 43" is exactly the kind of thing that quietly comes to
 * disagree with the first about what a page boundary is.
 */
export function ListPagination({
  meta,
  onPageChange,
  isFetching,
  noun = ['record', 'records'],
}: ListPaginationProps) {
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
