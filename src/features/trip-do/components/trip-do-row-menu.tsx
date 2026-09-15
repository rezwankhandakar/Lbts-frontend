import { Link2, Merge, MoreHorizontal, Receipt, ReceiptText, ScanLine, Split, Unlink } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { TripDoRowRecord } from '../types'
import type { RowActions } from './trip-do-sheet-row'

interface TripDoRowMenuProps extends RowActions {
  row: TripDoRowRecord
  canWrite: boolean
}

/**
 * Everything that can be done to one row. The write actions are absent rather
 * than disabled for a read-only account — a greyed-out button is a promise of
 * something that will never be allowed.
 */
export function TripDoRowMenu({
  row,
  canWrite,
  onLink,
  onSplit,
  onMerge,
  onUnlink,
}: TripDoRowMenuProps) {
  const navigate = useNavigate()
  const gatePassId = row.link?.gatePassId ?? null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Actions for ${row.challanNumber} ${row.model}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-48">
        {/* A billed row is fixed until it comes off its bill, so its write actions are gone. */}
        {row.bill && (
          <>
            <DropdownMenuItem onClick={() => navigate(`/bills/${row.bill?.billId}`)}>
              <Receipt aria-hidden />
              Open {row.bill.billNumber}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        {canWrite && !row.bill && (
          <>
            <DropdownMenuItem onClick={() => onLink(row)}>
              <Link2 aria-hidden />
              {row.link ? 'Change Trip DO' : 'Set Trip DO'}
            </DropdownMenuItem>
            <DropdownMenuItem disabled={row.qty < 2} onClick={() => onSplit(row)}>
              <Split aria-hidden />
              Split quantity
            </DropdownMenuItem>
            {row.partCount > 1 && (
              <DropdownMenuItem onClick={() => onMerge(row)}>
                <Merge aria-hidden />
                Merge parts back
              </DropdownMenuItem>
            )}
            {row.link && (
              <DropdownMenuItem variant="destructive" onClick={() => onUnlink(row)}>
                <Unlink aria-hidden />
                Remove Trip DO
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={() => navigate(`/challan/${row.challanId}`)}>
          <ReceiptText aria-hidden />
          Open challan
        </DropdownMenuItem>
        {gatePassId && (
          <DropdownMenuItem onClick={() => navigate(`/gate-pass/${gatePassId}`)}>
            <ScanLine aria-hidden />
            Open gate pass
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
