import { MoreHorizontal, Paperclip, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { ConfirmDialog } from '@/features/vendor/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDeleteEntry, useRemoveEntryVoucher } from '../hooks/use-accounts-mutations'
import { useEntryDialog } from '../hooks/use-entry-dialog'
import { useT } from '@/lib/i18n'
import { kindMeta, taka } from '../lib/accounts-meta'
import type { EntryRecord } from '../types'

/**
 * Correcting or removing one entry. Absent entirely for a read-only role — a
 * greyed-out menu is a promise of something that will never be allowed.
 */
export function EntryActionsMenu({ entry }: { entry: EntryRecord }) {
  const t = useT()
  const dialog = useEntryDialog()
  const remove = useDeleteEntry()
  const removeVoucher = useRemoveEntryVoucher()
  const [confirming, setConfirming] = useState(false)
  const [droppingVoucher, setDroppingVoucher] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={t('accounts.list.actionsFor', { entry: entry.entryNumber })} />}
        >
          <MoreHorizontal aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem onClick={() => dialog.edit(entry)}>
            <Pencil aria-hidden />
            Edit
          </DropdownMenuItem>
          {/* Attaching and replacing both happen on the form, which is what
              Edit opens — so the menu carries only the verb the form has no
              room for. */}
          {entry.voucher ? (
            <DropdownMenuItem onClick={() => setDroppingVoucher(true)}>
              <Paperclip aria-hidden />
              {t('accounts.voucher.remove')}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => dialog.edit(entry)}>
              <Paperclip aria-hidden />
              {t('accounts.voucher.attach')}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={droppingVoucher}
        isPending={removeVoucher.isPending}
        title={t('accounts.voucher.removeTitle', { entry: entry.entryNumber })}
        description={t('accounts.voucher.removeDescription')}
        confirmLabel={t('accounts.voucher.remove')}
        pendingLabel={t('accounts.voucher.removing')}
        onOpenChange={setDroppingVoucher}
        onConfirm={() =>
          removeVoucher.mutate(entry.id, { onSuccess: () => setDroppingVoucher(false) })
        }
      />

      <ConfirmDialog
        open={confirming}
        isPending={remove.isPending}
        title={t('accounts.voucher.deleteTitle', { entry: entry.entryNumber })}
        description={t('accounts.voucher.deleteDescription', {
          kind: kindMeta(entry.kind, t).label.toLowerCase(),
          amount: taka(entry.amount),
        })}
        confirmLabel={t('accounts.voucher.deleteConfirm')}
        pendingLabel={t('accounts.voucher.deleting')}
        onOpenChange={setConfirming}
        onConfirm={() => remove.mutate(entry.id, { onSuccess: () => setConfirming(false) })}
      />
    </>
  )
}
