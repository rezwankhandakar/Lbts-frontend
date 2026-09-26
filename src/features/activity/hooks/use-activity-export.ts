import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import { saveBlob } from '@/lib/save-blob'
import { exportActivity } from '../api/activity-api'
import type { ActivityListParams } from '../types'
import { reportActivityError } from './use-activity'

export interface ActivityExportController {
  isConfirming: boolean
  isExporting: boolean
  request: () => void
  cancel: () => void
  confirm: () => void
}

/**
 * Downloads the journal under the current filters as a spreadsheet.
 *
 * It asks first, as every export in this app does, and here the confirmation
 * carries more than a row count: this file is a copy of the audit trail, and
 * the dialog is where somebody notices they are about to take the whole
 * collection rather than last month's deletions.
 *
 * The toast stays up for the whole call, because a cold instance builds the
 * workbook before a byte arrives and silence for that long reads as a button
 * that did nothing.
 */
export function useActivityExport(params: ActivityListParams): ActivityExportController {
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
    const toastId = toast.loading(t('activity.export.buildingToast'))

    void exportActivity(params)
      .then(({ blob, filename }) => {
        saveBlob(blob, filename)
        toast.success(t('activity.export.exported'), { id: toastId })
        setIsConfirming(false)
      })
      .catch((error: ApiError) => {
        toast.dismiss(toastId)
        reportActivityError(error)
      })
      .finally(() => setIsExporting(false))
  }, [params, isExporting])

  return { isConfirming, isExporting, request, cancel, confirm }
}
