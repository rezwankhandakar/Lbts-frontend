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
  const records = `${total} ${total === 1 ? 'gate pass' : 'gate passes'}`

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Export {records}?</AlertDialogTitle>
          <AlertDialogDescription>
            {isFiltered
              ? `The ${records} matching these filters download as an Excel file — ${totalQty} total qty between them.`
              : `Every gate pass on record downloads as an Excel file — ${records}, ${totalQty} total qty between them.`}{' '}
            Each product line is its own row, so a gate pass carrying more than one product appears
            more than once.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Building…' : 'Export'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
