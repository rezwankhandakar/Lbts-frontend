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
import { formatTaka } from '@/lib/format'
import type { TripDoPageMeta, TripDoRowRecord } from '../types'
import { useT } from '@/lib/i18n'

interface UnlinkDialogProps {
  row: TripDoRowRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/** Taking a Trip DO off a row. Says where the pieces go: back to waiting. */
export function UnlinkTripDoDialog({ row, open, isPending, onOpenChange, onConfirm }: UnlinkDialogProps) {
  const t = useT()

  if (!row?.link) {
    return null
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Trip DO {row.link.tripDo}?</AlertDialogTitle>
          <AlertDialogDescription>
            {row.qty} {row.model || row.productName} on {row.challanNumber} stop counting against{' '}
            {row.link.gatePassNumber}, and its CSD and unit are cleared from the row. If another part of
            this line is also waiting for a Trip DO, the two are merged back into one row.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t('tripDo.remove.keep')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isPending}
            className="bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            {isPending ? t('tripDo.remove.removing') : t('tripDo.remove.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface ExportDialogProps {
  meta: TripDoPageMeta | undefined
  open: boolean
  isExporting: boolean
  onCancel: () => void
  onConfirm: () => void
}

/**
 * Reads back what is about to be exported, because the filters defining it are
 * several clicks away — this is where somebody notices it is the whole sheet
 * rather than last month.
 */
export function ExportTripDoDialog({ meta, open, isExporting, onCancel, onConfirm }: ExportDialogProps) {
  const t = useT()

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Export {meta ? meta.total.toLocaleString() : ''} {meta?.total === 1 ? 'row' : 'rows'}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {meta
              ? `${meta.totalQty.toLocaleString()} pieces worth ${formatTaka(meta.totalAmount)}, `
              : ''}
            one row per challan product line with its returns and re-sends, in the sheet's own column
            order — exactly the rows the current filters show, every page of them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isExporting}>{t('common.actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isExporting}>
            {isExporting ? t('tripDo.export.building') : t('tripDo.export.download')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
