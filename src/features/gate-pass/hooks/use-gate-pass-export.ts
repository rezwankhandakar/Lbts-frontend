import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { exportGatePasses } from '../api/gate-pass-api'
import { saveBlob } from '@/lib/save-blob'
import type { GatePassListParams } from '../types'
import { reportGatePassError } from './use-gate-pass-mutations'

export interface GatePassExportController {
  /** True while the confirmation is open. */
  isConfirming: boolean
  /** True while a file is being built, so the button cannot stack requests. */
  isExporting: boolean
  /** Opens the confirmation; nothing is requested until it is answered. */
  request: () => void
  cancel: () => void
  confirm: () => void
}

/**
 * Downloads the current filters as a spreadsheet.
 *
 * Deliberately not a query: an export is something an operator asks for once,
 * and caching a 300 KB workbook against a filter key would hold it in memory
 * long after the file had been saved. It is not a mutation either — nothing on
 * the server changes — so it owns its own pending flag rather than borrowing
 * TanStack Query's.
 *
 * It asks before it runs. Not because a download is dangerous, but because the
 * file is defined by filters that are several clicks away from the button: the
 * confirmation is where the operator reads back how many records and how much
 * quantity they are about to export, and catches the export they meant to
 * narrow first. It is also the module's most expensive request, and one that
 * arrives by accident is a slow one nobody wanted.
 *
 * The toast stays up for the whole call on purpose. A cold instance has to
 * wake, read every matching record and build the workbook before a single byte
 * arrives, and silence for that long reads as a button that did nothing.
 */
export function useGatePassExport(params: GatePassListParams): GatePassExportController {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const request = useCallback(() => setIsConfirming(true), [])

  const cancel = useCallback(() => {
    // A download in flight is not cancelled by closing the dialog — the file
    // still arrives — so this only ever closes an unanswered question.
    if (!isExporting) {
      setIsConfirming(false)
    }
  }, [isExporting])

  const confirm = useCallback(() => {
    if (isExporting) {
      return
    }

    setIsExporting(true)
    const toastId = toast.loading('Building the spreadsheet…')

    void exportGatePasses(params)
      .then(({ blob, filename }) => {
        saveBlob(blob, filename)
        toast.success('Spreadsheet downloaded', { id: toastId })
        // Closed only once the file exists, so a failure leaves the operator
        // looking at the question rather than at a list that did nothing.
        setIsConfirming(false)
      })
      .catch((error: ApiError) => {
        toast.dismiss(toastId)
        reportGatePassError(error)
      })
      .finally(() => setIsExporting(false))
  }, [params, isExporting])

  return { isConfirming, isExporting, request, cancel, confirm }
}
