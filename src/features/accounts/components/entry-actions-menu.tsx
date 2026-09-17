import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
import { useDeleteEntry } from '../hooks/use-accounts-mutations'
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
  const [confirming, setConfirming] = useState(false)

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
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirming(true)}>
            <Trash2 aria-hidden />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
