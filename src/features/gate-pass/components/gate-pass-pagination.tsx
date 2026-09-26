import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import type { PageMeta } from '../types'
import { useT } from '@/lib/i18n'

interface GatePassPaginationProps {
  meta: PageMeta
  onPageChange: (page: number) => void
  /** True while the next page is in flight, so the controls cannot stack requests. */
  isFetching: boolean
}

/**
 * Server-side paging. The browser never holds more than one page of records —
 * on an M0 cluster, shipping a year of gate passes to the client to filter
 * them is exactly the query the free tier cannot afford.
 */
export function GatePassPagination({ meta, onPageChange, isFetching }: GatePassPaginationProps) {
  const t = useT()

  if (meta.total === 0) {
    return null
  }

  const first = (meta.page - 1) * meta.limit + 1
  const last = Math.min(meta.page * meta.limit, meta.total)

  return (
    <nav
      aria-label={t('common.pagination.pagesAria', { noun: t('gatePass.title') })}
      className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row"
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {t('common.pagination.showingNoun', {
          from: formatNumber(first),
          to: formatNumber(last),
          total: formatNumber(meta.total),
          noun: t('nouns.gatePass', { count: meta.total }),
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
            page: formatNumber(meta.page),
            pages: formatNumber(meta.totalPages),
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
