import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatNumber } from '@/lib/format'
import { countOf, t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import {
  deleteChallan,
  setBatchPrinted,
  setBatchSkippedPages,
  setChallanLocation,
  setChallanPrinted,
  submitChallan,
  updateChallan,
} from '../api/challan-api'
import type {
  BatchPrintedArgs,
  PrintedArgs,
  SetChallanLocationArgs,
  SkippedPagesArgs,
  SubmitChallanArgs,
  UpdateChallanArgs,
} from '../api/challan-api'
import type { ChallanBatchDetail, ChallanRecord } from '../types'
import { challanKeys } from './use-challans'

/**
 * The generic top-level message for a validation failure ("Validation failed.")
 * tells an operator nothing, so where the API itemised what was wrong the first
 * entry is shown underneath. The same treatment administration, profile and
 * gate pass give their errors.
 */
export function reportChallanError(error: ApiError): void {
  const detail = error.errorSources?.find(
    (source) => source.message && source.message !== error.message,
  )

  toast.error(error.message, {
    description: detail
      ? detail.path
        ? `${detail.path}: ${detail.message}`
        : detail.message
      : undefined,
  })
}

/**
 * Every write invalidates the whole challan namespace. Filing a challan moves
 * a batch's progress, changes the summary counts and adds a row to a filtered
 * list, so refetching one key would leave the page telling two different
 * stories.
 */
function useInvalidateChallans() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: challanKeys.all })
}

/**
 * Filing one challan.
 *
 * Deliberately reports none of its own failures. A submission can fail with a
 * question rather than an error — a possible duplicate, an overlapping page
 * range — and the workspace is the only thing that knows whether to open a
 * dialog or show a message.
 */
export function useSubmitChallan(): UseMutationResult<ChallanRecord, unknown, SubmitChallanArgs> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: submitChallan,
    onSuccess: () => void invalidate(),
  })
}

/**
 * Correcting one.
 *
 * The toast says what actually happened rather than "Saved": a correction
 * regenerates the barcode back page and rewrites the stored PDF, and an
 * operator who does not know that will not know to reprint.
 */
export function useUpdateChallan(): UseMutationResult<ChallanRecord, ApiError, UpdateChallanArgs> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: updateChallan,
    onSuccess: (record) => {
      toast.success(t('challan.toasts.corrected'), {
        description: `${record.challanNumber} was saved and its document regenerated. Reprint it if the old copy is in circulation.`,
      })
      void invalidate()
    },
    onError: reportChallanError,
  })
}

/**
 * Marking pages of a source PDF as blank, or unmarking them.
 *
 * The toast says what it unlocked rather than what it set: an operator marks a
 * blank page precisely so the batch can be finished and printed, and telling
 * them the batch is now complete is the thing they were waiting to hear.
 */
export function useBatchSkippedPages(): UseMutationResult<
  ChallanBatchDetail,
  ApiError,
  SkippedPagesArgs
> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: setBatchSkippedPages,
    onSuccess: (batch) => {
      toast.success(
        batch.isComplete
          ? t('challan.toasts.batchComplete')
          : batch.skippedPages.length === 0
            ? t('challan.toasts.blankCleared')
            : t('challan.toasts.markedBlank'),
        {
          description: batch.isComplete
            ? t('challan.toasts.batchAccounted')
            : t('challan.toasts.stillToAccount', {
                count: batch.unassignedPages,
                n: formatNumber(batch.unassignedPages),
              }),
        },
      )
      void invalidate()
    },
    onError: reportChallanError,
  })
}

/**
 * Recording that one challan was printed, or taking that back.
 *
 * Quiet on success by design. This runs immediately after a print dialog has
 * opened, and a toast saying "Marked as printed" on top of the browser's own
 * print window is noise about the bookkeeping rather than about the job. What
 * the operator needs to see is the mark on the record, which the invalidation
 * puts there. A *failure* is worth a toast: the paper came out and the record
 * does not know it.
 */
export function useChallanPrinted(): UseMutationResult<ChallanRecord, ApiError, PrintedArgs> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: setChallanPrinted,
    onSuccess: () => void invalidate(),
    onError: reportChallanError,
  })
}

/**
 * The same for a whole batch.
 *
 * This one does speak up, because it is an explicit action on a page rather
 * than a side effect of pressing Print — and because "all fifteen are now
 * marked printed" is a bigger claim than one record, worth confirming.
 */
export function useBatchPrinted(): UseMutationResult<
  ChallanBatchDetail,
  ApiError,
  BatchPrintedArgs
> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: setBatchPrinted,
    onSuccess: (batch) => {
      toast.success(
        batch.isPrinted ? t('challan.toasts.batchPrinted') : t('challan.toasts.printMarksCleared'),
        {
        description: batch.isPrinted
          ? t('challan.toasts.batchPrintedNote', {
              challans: countOf(batch.challanCount, 'nouns.challan', t),
              file: batch.sourceFileName,
            })
          : t('challan.toasts.batchNotPrintedNote'),
      })
      void invalidate()
    },
    onError: reportChallanError,
  })
}

/**
 * Setting a filed challan's district and thana by hand.
 *
 * The toast names what it resolved to rather than saying "Saved", because the
 * whole point of the action is the classification: an operator setting a
 * location wants to see that the record now reads Dhaka / Savar / OSD-Thana,
 * and clearing one wants to see that it is back to being unset.
 */
export function useSetChallanLocation(): UseMutationResult<
  ChallanRecord,
  ApiError,
  SetChallanLocationArgs
> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: setChallanLocation,
    onSuccess: (record) => {
      const location = record.resolvedLocation

      toast.success(location ? t('challan.toasts.locationSet') : t('challan.toasts.locationCleared'), {
        description: location
          ? `${record.challanNumber} is ${location.district} / ${location.thana} · ${location.locationType}.`
          : `${record.challanNumber} has no location again. It can be set at any time.`,
      })
      void invalidate()
    },
    onError: reportChallanError,
  })
}

export function useDeleteChallan(): UseMutationResult<
  { id: string },
  ApiError,
  { id: string; challanNumber: string }
> {
  const invalidate = useInvalidateChallans()

  return useMutation({
    mutationFn: ({ id }) => deleteChallan(id),
    onSuccess: (_result, variables) => {
      toast.success(t('challan.toasts.deleted', { challan: variables.challanNumber }), {
        // Deleting re-opens the batch it came from: its pages are unclaimed
        // again, so the batch can no longer be downloaded as a finished set.
        description: t('challan.toasts.deletedNote'),
      })
      void invalidate()
    },
    onError: reportChallanError,
  })
}
