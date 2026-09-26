import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFormatters, useT } from '@/lib/i18n'
import type { PageMeta } from '../types'

interface UserPaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
  /** True while the next page is in flight, so the controls cannot stack requests. */
  isFetching: boolean
}

/**
 * Server-side paging. The browser never holds more than one page of users —
 * on an M0 cluster, shipping the whole collection to filter it client-side is
 * exactly the query the free tier cannot afford.
 */
export function UserPagination({ meta, onPageChange, isFetching }: UserPaginationProps) {
  const t = useT()
  const format = useFormatters()

  if (meta.total === 0) {
    return null
  }

  const first = (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.page * meta.limit, meta.total)

  return (
    <nav
      aria-label={t('administration.directory.pagesAria')}
      className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"
    >
      {/* One interpolated sentence, for the reason `ListPagination` gives: the
          two languages put the noun and the total in different places. */}
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {t('common.pagination.showingNoun', {
          from: format.number(first),
          to: format.number(last),
          total: format.number(meta.total),
          noun: t('nouns.user', { count: meta.total }),
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
