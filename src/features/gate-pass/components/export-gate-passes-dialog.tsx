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
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface ExportGatePassesDialogProps {
  open: boolean
  /** How many records the current filters match, and what they carry. */
  total: number
  totalQty: number
  /** Whether anything narrows the list, which is what the file is defined by. */
  isFiltered: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Reads the export back before it runs.
 *
 * The file is defined by filters set several clicks away — some of them behind
 * "More filters", where they are easy to forget. So the confirmation states
 * the two figures that say which export this is: how many gate passes, and how
 * much quantity between them. An operator who meant last month and is looking
 * at "every gate pass on record" stops here rather than in Excel.
 *
 * It also says what the file is shaped like, because that is the other thing
 * people get wrong about a spreadsheet of this: a gate pass carrying three
 * products is three rows, so the row count is a line count.
 */
export function ExportGatePassesDialog({
  open,
  total,
  totalQty,
  isFiltered,
  isPending,
  onOpenChange,
  onConfirm,
}: ExportGatePassesDialogProps) {
  const t = useT()

  const records = t('gatePass.stats.recordCount', { count: total, n: formatNumber(total) })

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('gatePass.exportDialog.title', { records })}</AlertDialogTitle>
          <AlertDialogDescription>
            {isFiltered
              ? t('gatePass.exportDialog.filteredBody', {
                  records,
                  qty: formatNumber(totalQty),
                })
              : t('gatePass.exportDialog.allBody', {
                  records,
                  qty: formatNumber(totalQty),
                })}{' '}
            {t('gatePass.exportDialog.lineNote')}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t('common.actions.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending
              ? t('gatePass.exportDialog.building')
              : t('gatePass.exportDialog.confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
