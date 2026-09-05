import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  deleteChallan,
  setBatchSkippedPages,
  submitChallan,
  updateChallan,
} from '../api/challan-api'
import type {
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
      toast.success('Challan corrected', {
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
          ? 'Batch complete'
          : batch.skippedPages.length === 0
            ? 'Blank pages cleared'
            : 'Marked as blank',
        {
          description: batch.isComplete
            ? 'Every page of this PDF is accounted for. The batch can be downloaded as one document.'
            : `${batch.unassignedPages} page${batch.unassignedPages === 1 ? '' : 's'} still to account for.`,
        },
      )
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
      toast.success(`${variables.challanNumber} was deleted`, {
        // Deleting re-opens the batch it came from: its pages are unclaimed
        // again, so the batch can no longer be downloaded as a finished set.
        description: 'Its pages are unassigned again in the batch it came from.',
      })
      void invalidate()
    },
    onError: reportChallanError,
  })
}
