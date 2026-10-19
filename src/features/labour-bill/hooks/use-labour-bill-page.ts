import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { LabourBillDialog } from '../components/labour-bill-actions-menu'
import type { LabourRemoveTarget } from '../components/labour-bill-sheet-row'
import type { LabourBillLinePatch } from '../types'
import { useLabourBillExport } from './use-labour-bill-export'
import {
  useDeleteLabourBill,
  useFinalizeLabourBill,
  useRefreshLabourBill,
  useRemoveLabourBillLines,
  useReopenLabourBill,
  useUpdateLabourBillLine,
} from './use-labour-bill-mutations'
import { useLabourBillScan } from './use-labour-bill-scan'
import { useLabourBill } from './use-labour-bills'

/**
 * Everything the labour bill page does, so the page itself reads as a layout:
 * the query, the scanner, the cell writes, which unit's tab is showing, which
 * dialog is open, and the confirmations behind each.
 */
export function useLabourBillPage(id: string) {
  const navigate = useNavigate()
  const query = useLabourBill(id)
  const exporter = useLabourBillExport()

  /**
   * The unit tab on screen. Null until somebody picks one or a scan opens one,
   * which the sheet reads as "the first tab". A scan sets it to wherever its
   * rows landed, so a WFR challan opens the WFR tab and a WAC one the WAC tab.
   */
  const [tab, setTab] = useState<string | null>(null)
  const scanner = useLabourBillScan(id, setTab)

  const [dialog, setDialog] = useState<LabourBillDialog>(null)
  const [removing, setRemoving] = useState<LabourRemoveTarget | null>(null)

  const finalize = useFinalizeLabourBill()
  const reopen = useReopenLabourBill()
  const remove = useDeleteLabourBill()
  const refresh = useRefreshLabourBill()
  const removeLines = useRemoveLabourBillLines()
  const editLine = useUpdateLabourBillLine()

  const closeDialog = () => setDialog(null)

  const saveCell = useCallback(
    (lineId: string, patch: LabourBillLinePatch) => editLine.mutate({ id, lineId, patch }),
    [editLine, id],
  )

  return {
    query,
    tab,
    setTab,
    dialog,
    openDialog: setDialog,
    closeDialog,
    removing,
    askRemove: setRemoving,
    cancelRemove: () => setRemoving(null),
    exporter,
    scanner,
    saveCell,
    refresh: () => refresh.mutate(id),
    confirmFinalize: () => finalize.mutate(id, { onSuccess: closeDialog }),
    confirmReopen: () => reopen.mutate(id, { onSuccess: closeDialog }),
    confirmDelete: () =>
      remove.mutate(id, { onSuccess: () => navigate('/labour-bills', { replace: true }) }),
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
      cell: editLine.isPending,
    },
  }
}
