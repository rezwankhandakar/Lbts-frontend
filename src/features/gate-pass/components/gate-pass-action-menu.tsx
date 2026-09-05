import {
  BadgeCheck,
  Download,
  EllipsisVertical,
  Eye,
  Pencil,
  Printer,
  Trash2,
  Undo2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { GatePassRecord } from '../types'

export interface GatePassActions {
  /** True when the signed-in user may edit or submit their own open records. */
  canWrite: boolean
  /** True for Admin and Manager: the roles that verify and manage anyone's work. */
  canReview: boolean
  currentUserId: string | null
  onOpen: (record: GatePassRecord) => void
  onEdit: (record: GatePassRecord) => void
  onDownload: (record: GatePassRecord) => void
  onPrint: (record: GatePassRecord) => void
  onReview: (record: GatePassRecord, status: 'Verified' | 'Rejected') => void
  onDelete: (record: GatePassRecord) => void
}

/**
 * Secondary actions live behind the overflow trigger so a row stays calm, and
 * colour sits on the icon rather than on a filled button.
 *
 * Items an operator cannot use are dropped rather than disabled. A row for
 * somebody else's gate pass simply offers viewing, downloading and printing —
 * showing a greyed-out Delete would only invite the question of how to enable
 * it, and the API refuses it regardless.
 */
export function GatePassActionMenu({
  record,
  actions,
}: {
  record: GatePassRecord
  actions: GatePassActions
}) {
  const isOwner = record.createdBy?.id === actions.currentUserId

  /**
   * Correcting and deleting run on the same rule, in every status: the person
   * who filed the record, and the roles that manage anybody's work. Neither is
   * gated on status — a wrong gate pass is worth fixing whenever it is
   * noticed, and deleting is the only way to withdraw one. The API applies
   * exactly this.
   */
  const canChange = actions.canWrite && (isOwner || actions.canReview)
  const canVerify = actions.canReview && record.status === 'Submitted'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${record.gatePassId}`}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <EllipsisVertical aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg">
        {/* A plain heading, not DropdownMenuLabel: that maps to Base UI's
            Menu.GroupLabel, which throws unless it sits inside a Menu.Group. */}
        <div className="px-1.5 pt-1 pb-2">
          <p className="truncate text-[13px] leading-tight font-semibold">{record.gatePassId}</p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
            {record.customerName}
          </p>
        </div>

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onOpen(record)}
        >
          <Eye className="text-muted-foreground" aria-hidden />
          View details
        </DropdownMenuItem>

        {canChange && (
          <DropdownMenuItem
            className="h-8 gap-2.5 rounded-lg text-[13px]"
            onClick={() => actions.onEdit(record)}
          >
            <Pencil className="text-tone-indigo" aria-hidden />
            Edit
          </DropdownMenuItem>
        )}

        {record.document && (
          <>
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px]"
              onClick={() => actions.onDownload(record)}
            >
              <Download className="text-muted-foreground" aria-hidden />
              Download document
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px]"
              onClick={() => actions.onPrint(record)}
            >
              <Printer className="text-muted-foreground" aria-hidden />
              Print gate pass
            </DropdownMenuItem>
          </>
        )}

        {(canVerify || canChange) && <DropdownMenuSeparator />}

        {canVerify && (
          <>
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px] text-tone-emerald"
              onClick={() => actions.onReview(record, 'Verified')}
            >
              <BadgeCheck aria-hidden />
              Verify
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px] text-tone-rose"
              onClick={() => actions.onReview(record, 'Rejected')}
            >
              <Undo2 aria-hidden />
              Send back
            </DropdownMenuItem>
          </>
        )}

        {canChange && (
          <DropdownMenuItem
            className="h-8 gap-2.5 rounded-lg text-[13px] text-destructive"
            onClick={() => actions.onDelete(record)}
          >
            <Trash2 aria-hidden />
            {record.status === 'Draft' ? 'Delete draft' : 'Delete gate pass'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
