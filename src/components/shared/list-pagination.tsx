import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFormatters, useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

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
  /**
   * What is being paged, as a key into the `nouns` branch — "challan" /
   * "challans", "location" / "locations". One control serves every list.
   *
   * A key rather than the `[singular, plural]` pair of English words this used
   * to take: the pair could only ever be English, and the sentence around it
   * puts the noun in a different place in the two languages. The key lets the
   * message own the whole sentence, which is the only way Bangla's word order
   * can be right.
   */
  nounKey?: TranslationKey
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
  nounKey = 'nouns.record',
}: ListPaginationProps) {
  const t = useT()
  const format = useFormatters()

  if (meta.total === 0) {
    return null
  }

  const first = (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.page * meta.limit, meta.total)
  const noun = t(nounKey, { count: meta.total })

  return (
    <nav
      aria-label={t('common.pagination.pagesAria', { noun })}
      className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"
    >
      {/*
       * One interpolated sentence rather than spans stitched together in JSX.
       * The emphasis went with it: English reads "Showing 1–10 of 43 challans"
       * and Bangla leads with the total, so a layout that hard-coded which
       * fragment was bold could only be right in one of them.
       */}
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {t('common.pagination.showingNoun', {
          from: format.number(first),
          to: format.number(last),
          total: format.number(meta.total),
          noun,
        })}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={meta.page <= 1 || isFetching}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronLeft data-icon="inline-start" aria-hidden />
          {t('common.actions.previous')}
        </Button>

        <span className="px-1 text-xs whitespace-nowrap text-muted-foreground">
          {t('common.pagination.page', {
            page: format.number(meta.page),
            pages: format.number(meta.totalPages),
          })}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={meta.page >= meta.totalPages || isFetching}
          onClick={() => onPageChange(meta.page + 1)}
        >
          {t('common.actions.next')}
          <ChevronRight data-icon="inline-end" aria-hidden />
        </Button>
      </div>
    </nav>
  )
}
