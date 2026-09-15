import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { BillDialog } from '../components/bill-actions-menu'
import type { RemoveTarget } from '../components/bill-sheet-row'
import { useBillExport } from './use-bill-export'
import {
  useDeleteBill,
  useFinalizeBill,
  useRefreshBill,
  useRemoveBillLines,
  useReopenBill,
} from './use-bill-mutations'
import { useBill } from './use-bills'

/**
 * Everything the bill page does, so the page itself reads as a layout: the
 * query, which dialog is open, and the writes behind each confirmation.
 */
export function useBillPage(id: string) {
  const navigate = useNavigate()
  const query = useBill(id)
  const exporter = useBillExport()

  const [dialog, setDialog] = useState<BillDialog>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [removing, setRemoving] = useState<RemoveTarget | null>(null)

  const finalize = useFinalizeBill()
  const reopen = useReopenBill()
  const remove = useDeleteBill()
  const refresh = useRefreshBill()
  const removeLines = useRemoveBillLines()

  const closeDialog = () => setDialog(null)

  return {
    query,
    dialog,
    openDialog: setDialog,
    closeDialog,
    isAdding,
    setIsAdding,
    removing,
    askRemove: setRemoving,
    cancelRemove: () => setRemoving(null),
    exporter,
    refresh: () => refresh.mutate(id),
    confirmFinalize: () => finalize.mutate(id, { onSuccess: closeDialog }),
    confirmReopen: () => reopen.mutate(id, { onSuccess: closeDialog }),
    confirmDelete: () => remove.mutate(id, { onSuccess: () => navigate('/bills', { replace: true }) }),
    confirmRemove: () => {
      if (removing) {
        removeLines.mutate({ id, lineIds: removing.lineIds }, { onSuccess: () => setRemoving(null) })
      }
    },
    pending: {
      finalize: finalize.isPending,
      reopen: reopen.isPending,
      delete: remove.isPending,
      refresh: refresh.isPending,
      remove: removeLines.isPending,
    },
  }
}
