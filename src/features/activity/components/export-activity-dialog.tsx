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
  const total = stats?.total ?? 0

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export the activity journal?</AlertDialogTitle>
          <AlertDialogDescription>
            {total.toLocaleString()} {total === 1 ? 'event' : 'events'}
            {stats && stats.actors > 0 && (
              <>
                {' '}
                covering {stats.actors.toLocaleString()}{' '}
                {stats.actors === 1 ? 'person' : 'people'}
              </>
            )}
            {isFiltered ? ' match the filters in force' : ' — the whole journal, unfiltered'}. One
            row per event, with what changed in a single column.
            {stats && stats.critical > 0 && (
              <>
                {' '}
                {stats.critical.toLocaleString()} of them{' '}
                {stats.critical === 1 ? 'is' : 'are'} critical — deletions, access changes and money
                corrections.
              </>
            )}{' '}
            The file is a copy of the audit trail, so treat it as one.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExporting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isExporting || total === 0}>
            {isExporting ? 'Building…' : 'Download spreadsheet'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
