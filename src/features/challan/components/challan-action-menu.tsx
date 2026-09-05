import { Download, EllipsisVertical, Eye, Layers, Pencil, Printer, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { canChangeChallan } from '../types'
import type { ChallanRecord } from '../types'
import type { UserRole } from '@/lib/roles'

export interface ChallanActions {
  role: UserRole | null
  currentUserId: string | null
  onOpen: (record: ChallanRecord) => void
  onEdit: (record: ChallanRecord) => void
  onDownload: (record: ChallanRecord) => void
  onPrint: (record: ChallanRecord) => void
  onOpenBatch: (record: ChallanRecord) => void
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
  const canChange = canChangeChallan(actions.role, record, actions.currentUserId)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${record.challanNumber}`}
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
          <p className="truncate text-[13px] leading-tight font-semibold">
            {record.challanNumber}
          </p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
            SL {record.slNumber} · {record.customerName}
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
            Correct
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onDownload(record)}
        >
          <Download className="text-muted-foreground" aria-hidden />
          Download PDF
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onPrint(record)}
        >
          <Printer className="text-muted-foreground" aria-hidden />
          Print challan
        </DropdownMenuItem>

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => actions.onOpenBatch(record)}
        >
          <Layers className="text-muted-foreground" aria-hidden />
          Open source batch
        </DropdownMenuItem>

        {canChange && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px] text-destructive"
              onClick={() => actions.onDelete(record)}
            >
              <Trash2 aria-hidden />
              Delete challan
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
