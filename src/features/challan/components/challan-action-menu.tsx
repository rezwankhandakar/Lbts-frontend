import {
  Download,
  EllipsisVertical,
  Eye,
  Layers,
  MapPin,
  Pencil,
  Printer,
  PrinterCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isReviewableLocation } from '@/features/location/types'
import { canChangeChallan, needsLocationAttention } from '../types'
import type { ChallanRecord } from '../types'
import type { UserRole } from '@/lib/roles'

export interface ChallanActions {
  role: UserRole | null
  currentUserId: string | null
  onOpen: (record: ChallanRecord) => void
  onEdit: (record: ChallanRecord) => void
  onDownload: (record: ChallanRecord) => void
  onPrint: (record: ChallanRecord) => void
  /**
   * Records that a challan was printed, or takes the mark back — for the copy
   * that came off somebody else's printer, and for the print that was
   * cancelled at the dialog.
   */
  onSetPrinted: (record: ChallanRecord, printed: boolean) => void
  /** False for a role that may print but not write — CEO. */
  canMarkPrinted: boolean
  onOpenBatch: (record: ChallanRecord) => void
  /**
   * Opens the location picker over the list. Optional, because there is one
   * place it makes no sense: the details page already carries the picker on
   * the page itself, and a second route to it from the row menu there would
   * be two buttons for one job.
   */
  onSetLocation?: (record: ChallanRecord) => void
  onDelete: (record: ChallanRecord) => void
}

/**
 * Secondary actions live behind the overflow trigger so a row stays calm, and
 * colour sits on the icon rather than on a filled button.
 *
 * Items an operator cannot use are dropped rather than disabled. A row for
 * somebody else's challan simply offers viewing, downloading and printing —
 * showing a greyed-out Delete would only invite the question of how to enable
 * it, and the API refuses it regardless.
 */
export function ChallanActionMenu({
  record,
  actions,
}: {
  record: ChallanRecord
  actions: ChallanActions
}) {
  const t = useT()

  const canChange = canChangeChallan(actions.role, record, actions.currentUserId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t('challan.menu.aria', { challan: record.challanNumber })}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <EllipsisVertical aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60 rounded-xl p-1.5 shadow-lg">
        {/* A plain heading, not DropdownMenuLabel: that maps to Base UI's
            Menu.GroupLabel, which throws unless it sits inside a Menu.Group. */}
        <div className="px-1.5 pt-1 pb-2">
          <p className="truncate text-[13px] leading-tight font-semibold">{record.challanNumber}</p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
            {t('challan.pages.slWith', { sl: formatNumber(record.slNumber) })} ·{' '}
            {record.customerName}
          </p>
        </div>

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onOpen(record)}
        >
          <Eye className="text-muted-foreground" aria-hidden />
          {t('challan.menu.view')}
        </DropdownMenuItem>

        {canChange && (
          <DropdownMenuItem
            className="h-8 gap-2.5 rounded-lg text-[13px]"
            onClick={() => actions.onEdit(record)}
          >
            <Pencil className="text-tone-indigo" aria-hidden />
            {t('challan.menu.correct')}
          </DropdownMenuItem>
        )}

        {/* Setting the location is separated from Correct because it is not
            one: it writes two fields, regenerates nothing, and is the one
            correction that can be finished from this list without opening the
            record. Whoever is clearing a location backlog is going through
            rows, not challans.

            The wording follows what the record actually needs — choosing one,
            agreeing with one, or changing a settled one — so the queue an
            administrator filtered to reads as a list of jobs rather than a
            list of identical menu items. */}
        {canChange && actions.onSetLocation && (
          <DropdownMenuItem
            className="h-8 gap-2.5 rounded-lg text-[13px]"
            onClick={() => actions.onSetLocation?.(record)}
          >
            <MapPin
              className={
                needsLocationAttention(record) ? 'text-tone-orange' : 'text-muted-foreground'
              }
              aria-hidden
            />
            {record.locationStatus === 'Pending'
              ? t('challan.menu.setLocation')
              : isReviewableLocation(record.resolvedLocation)
                ? t('challan.menu.checkLocation')
                : t('challan.menu.changeLocation')}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onDownload(record)}
        >
          <Download className="text-muted-foreground" aria-hidden />
          {t('challan.menu.downloadPdf')}
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onPrint(record)}
        >
          <Printer className="text-muted-foreground" aria-hidden />
          {t('challan.menu.printChallan')}
        </DropdownMenuItem>

        {/* Printing already marks the record, so this is for the two cases it
            cannot see: a copy printed from somewhere else, and a print dialog
            that was cancelled. The mark is a claim about paper, so it has to be
            correctable in both directions. */}
        {actions.canMarkPrinted && (
          <DropdownMenuItem
            className="h-8 gap-2.5 rounded-lg text-[13px]"
            onClick={() => actions.onSetPrinted(record, !record.printedAt)}
          >
            <PrinterCheck
              className={record.printedAt ? 'text-muted-foreground' : 'text-tone-violet'}
              aria-hidden
            />
            {record.printedAt ? t('challan.menu.markNotPrinted') : t('challan.menu.markPrinted')}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onOpenBatch(record)}
        >
          <Layers className="text-muted-foreground" aria-hidden />
          {t('challan.menu.openSourceBatch')}
        </DropdownMenuItem>

        {canChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px] text-destructive"
              onClick={() => actions.onDelete(record)}
            >
              <Trash2 aria-hidden />
              {t('challan.menu.deleteChallan')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
