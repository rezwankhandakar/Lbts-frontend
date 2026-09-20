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
import { KIND_META, taka } from '../lib/accounts-meta'
import type { EntryRecord } from '../types'

/**
 * Correcting or removing one entry. Absent entirely for a read-only role — a
 * greyed-out menu is a promise of something that will never be allowed.
 */
export function EntryActionsMenu({ entry }: { entry: EntryRecord }) {
  const dialog = useEntryDialog()
  const remove = useDeleteEntry()
  const removeVoucher = useRemoveEntryVoucher()
  const [confirming, setConfirming] = useState(false)
  const [droppingVoucher, setDroppingVoucher] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${entry.entryNumber}`} />}
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
              Remove voucher
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => dialog.edit(entry)}>
              <Paperclip aria-hidden />
              Attach a voucher
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
        title={`Remove the voucher from ${entry.entryNumber}?`}
        description="The entry itself is untouched — the figures, the wallet and the day stay exactly as they are. Only the file behind it is deleted, and it cannot be recovered."
        confirmLabel="Remove voucher"
        pendingLabel="Removing…"
        onOpenChange={setDroppingVoucher}
        onConfirm={() =>
          removeVoucher.mutate(entry.id, { onSuccess: () => setDroppingVoucher(false) })
        }
      />

      <ConfirmDialog
        open={confirming}
        isPending={remove.isPending}
        title={`Delete ${entry.entryNumber}?`}
        description={`This ${KIND_META[entry.kind].label.toLowerCase()} of ${taka(entry.amount)} is removed from the books, and every balance and total it counted in is recalculated without it.`}
        confirmLabel="Delete entry"
        pendingLabel="Deleting…"
        onOpenChange={setConfirming}
        onConfirm={() => remove.mutate(entry.id, { onSuccess: () => setConfirming(false) })}
      />
    </>
  )
}
