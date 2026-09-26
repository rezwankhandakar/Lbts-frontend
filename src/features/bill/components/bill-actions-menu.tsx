import { FileCheck2, LockOpen, MoreHorizontal, Pencil, RefreshCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { BillRecord } from '../types'
import { useT } from '@/lib/i18n'

export type BillDialog = 'edit' | 'finalize' | 'reopen' | 'delete' | null

interface BillActionsMenuProps {
  bill: BillRecord
  canWrite: boolean
  canReview: boolean
  isRefreshing: boolean
  onOpen: (dialog: Exclude<BillDialog, null>) => void
  onRefresh: () => void
}

/**
 * What else can be done to a bill. Every action a role cannot take is absent
 * rather than disabled — a greyed-out button is a promise of something that
 * will never be allowed — and the menu is not drawn at all when nothing is left.
 */
export function BillActionsMenu({ bill, canWrite, canReview, isRefreshing, onOpen, onRefresh }: BillActionsMenuProps) {
  const t = useT()

  const isDraft = bill.status === 'Draft'
  const canPrepare = isDraft && canWrite

  if (!canPrepare && !canReview) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" size="icon" aria-label={`More actions for ${bill.billNumber}`} />}>
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-52">
        {canPrepare && (
          <>
            <DropdownMenuItem onClick={() => onOpen('edit')}>
              <Pencil aria-hidden />
              {t('bill.menu.edit')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCcw aria-hidden />
              {t('bill.menu.refresh')}
            </DropdownMenuItem>
          </>
        )}

        {canReview && (
          <>
            {canPrepare && <DropdownMenuSeparator />}
            {isDraft ? (
              <DropdownMenuItem onClick={() => onOpen('finalize')}>
                <FileCheck2 aria-hidden />
                {t('bill.menu.finalize')}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onOpen('reopen')}>
                <LockOpen aria-hidden />
                {t('bill.menu.reopen')}
              </DropdownMenuItem>
            )}
          </>
        )}

        {canPrepare && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onOpen('delete')}>
              <Trash2 aria-hidden />
              {t('bill.menu.delete')}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
