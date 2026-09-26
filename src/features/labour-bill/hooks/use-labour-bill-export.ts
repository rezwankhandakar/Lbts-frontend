import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import { saveBlob } from '@/lib/save-blob'
import { exportLabourBill } from '../api/labour-bill-api'
import { reportLabourBillError } from './use-labour-bills'

/**
 * Downloads one labour bill as its spreadsheet. The toast stays up for the
 * whole call, because a cold instance builds the workbook before a byte
 * arrives and silence for that long reads as a button that did nothing.
 */
export function useLabourBillExport(): { isExporting: boolean; download: (id: string) => void } {
  const [isExporting, setIsExporting] = useState(false)

  const download = useCallback(
    (id: string) => {
      if (isExporting) {
        return
      }
      setIsExporting(true)
      const toastId = toast.loading(t('labourBill.actions.buildingToast'))

      void exportLabourBill(id)
        .then(({ blob, filename }) => {
          saveBlob(blob, filename)
          toast.success(t('labourBill.actions.downloaded'), { id: toastId, description: filename })
        })
        .catch((error: ApiError) => {
          toast.dismiss(toastId)
          reportLabourBillError(error)
        })
        .finally(() => setIsExporting(false))
    },
    [isExporting],
  )

  return { isExporting, download }
}
