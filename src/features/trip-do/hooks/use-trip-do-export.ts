import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { saveBlob } from '@/lib/save-blob'
import { exportTripDoRows } from '../api/trip-do-api'
import type { TripDoListParams } from '../types'
import { reportTripDoError } from './use-trip-do'

export interface TripDoExportController {
  isConfirming: boolean
  isExporting: boolean
  request: () => void
  cancel: () => void
  confirm: () => void
}

/**
 * Downloads the sheet under the current filters as a spreadsheet.
 *
 * It asks first, as the gate pass export does: the filters defining the file
 * are several clicks from the button, and the confirmation is where somebody
 * reads back how many rows they are about to export. The toast stays up for the
 * whole call, because a cold instance builds the workbook before a byte arrives
 * and silence for that long reads as a button that did nothing.
 */
export function useTripDoExport(params: TripDoListParams): TripDoExportController {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const request = useCallback(() => setIsConfirming(true), [])

  const cancel = useCallback(() => {
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

    void exportTripDoRows(params)
      .then(({ blob, filename }) => {
        saveBlob(blob, filename)
        toast.success('Spreadsheet downloaded', { id: toastId })
        setIsConfirming(false)
      })
      .catch((error: ApiError) => {
        toast.dismiss(toastId)
        reportTripDoError(error)
      })
      .finally(() => setIsExporting(false))
  }, [params, isExporting])

  return { isConfirming, isExporting, request, cancel, confirm }
}
