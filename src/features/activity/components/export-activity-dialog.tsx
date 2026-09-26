import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { ActivityStats } from '../types'
import { useFormatters, useT } from '@/lib/i18n'

interface ExportActivityDialogProps {
  stats: ActivityStats | undefined
  isFiltered: boolean
  open: boolean
  isExporting: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Reads back what is about to leave the system.
 *
 * Every export in this app confirms first, because the filters defining the
 * file are several clicks away and behind a disclosure — this is where
 * somebody notices they are taking the whole journal instead of last month's
 * deletions.
 *
 * Here it does one more thing, and it is the reason the export is Admin-only
 * while reading is not: the file is a copy of the audit trail. It names who is
 * in it, not only how many rows, because "412 events" and "412 events covering
 * nine people" are different things to hand somebody.
 */
export function ExportActivityDialog({
  stats,
  isFiltered,
  open,
  isExporting,
  onCancel,
  onConfirm,
}: ExportActivityDialogProps) {
  const t = useT()
  const format = useFormatters()

  const total = stats?.total ?? 0

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('activity.export.title')}</AlertDialogTitle>
          {/*
            * Whole sentences rather than fragments stitched together. The
            * original interleaved a count, an optional "covering N people", a
            * clause that changed with the filters and an optional critical tail
            * — an order that is English's alone, and one no other language
            * could have been given.
            */}
          <AlertDialogDescription>
            {t(isFiltered ? 'activity.export.bodyFiltered' : 'activity.export.bodyAll', {
              events: t('activity.export.events', { count: total, n: format.number(total) }),
            })}{' '}
            {stats && stats.actors > 0
              ? t('activity.export.covering', {
                  count: stats.actors,
                  n: format.number(stats.actors),
                })
              : ''}{' '}
            {stats && stats.critical > 0
              ? t('activity.export.criticalNote', {
                  count: stats.critical,
                  n: format.number(stats.critical),
                })
              : ''}{' '}
            {t('activity.export.warning')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExporting}>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isExporting || total === 0}>
            {isExporting ? t('activity.export.building') : t('activity.export.download')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
