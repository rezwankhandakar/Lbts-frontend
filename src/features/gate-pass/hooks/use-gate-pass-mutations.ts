import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  createGatePass,
  deleteGatePass,
  reviewGatePass,
  submitGatePass,
  updateGatePass,
  uploadGatePassDocument,
} from '../api/gate-pass-api'
import type {
  ReviewGatePassArgs,
  SubmitGatePassArgs,
  UpdateGatePassArgs,
  UploadDocumentArgs,
} from '../api/gate-pass-api'
import type { GatePassInput, GatePassRecord } from '../types'
import { gatePassKeys } from './use-gate-passes'

/**
 * The generic top-level message for a validation failure ("Validation failed.")
 * tells an operator nothing, so where the API itemised what was wrong the first
 * entry is shown underneath. Same treatment administration and profile give
 * their errors.
 */
export function reportGatePassError(error: ApiError): void {
  const detail = error.errorSources.find(
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
 * Every write invalidates the whole gate pass namespace. A submission moves a
 * row between filtered views and shifts the summary counts, so refetching one
 * key would leave the page telling two different stories.
 */
function useInvalidateGatePasses() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: gatePassKeys.all })
}

export function useCreateGatePass(): UseMutationResult<GatePassRecord, ApiError, GatePassInput> {
  const invalidate = useInvalidateGatePasses()

  return useMutation({
    mutationFn: createGatePass,
    onSuccess: () => void invalidate(),
    // The New Gate Pass workspace runs this inside a multi-step submission and
    // reports failure once, in context. A toast here would double it up.
  })
}

export function useUpdateGatePass(): UseMutationResult<
  GatePassRecord,
  ApiError,
  UpdateGatePassArgs
> {
  const invalidate = useInvalidateGatePasses()

  return useMutation({
    mutationFn: updateGatePass,
    onSuccess: () => void invalidate(),
  })
}

export function useUploadGatePassDocument(): UseMutationResult<
  GatePassRecord,
  ApiError,
  UploadDocumentArgs
> {
  const invalidate = useInvalidateGatePasses()

  return useMutation({
    mutationFn: uploadGatePassDocument,
    onSuccess: () => void invalidate(),
  })
}

/**
 * Submitting can fail with a question rather than an error — see
 * DuplicateSubmissionError — so this one deliberately does not report its own
 * failures. The workspace decides whether to show a dialog or a message.
 */
export function useSubmitGatePass(): UseMutationResult<
  GatePassRecord,
  ApiError,
  SubmitGatePassArgs
> {
  const invalidate = useInvalidateGatePasses()

  return useMutation({
    mutationFn: submitGatePass,
    onSuccess: () => void invalidate(),
  })
}

const REVIEW_MESSAGES: Record<ReviewGatePassArgs['status'], string> = {
  Verified: 'Gate pass verified',
  Rejected: 'Gate pass sent back for correction',
  Cancelled: 'Gate pass cancelled',
}

export function useReviewGatePass(): UseMutationResult<
  GatePassRecord,
  ApiError,
  ReviewGatePassArgs
> {
  const invalidate = useInvalidateGatePasses()

  return useMutation({
    mutationFn: reviewGatePass,
    onSuccess: (_record, variables) => {
      toast.success(REVIEW_MESSAGES[variables.status])
      void invalidate()
    },
    onError: reportGatePassError,
  })
}

export function useDeleteGatePass(): UseMutationResult<
  { id: string },
  ApiError,
  { id: string; gatePassId: string }
> {
  const invalidate = useInvalidateGatePasses()

  return useMutation({
    mutationFn: ({ id }) => deleteGatePass(id),
    onSuccess: (_result, variables) => {
      toast.success(`${variables.gatePassId} was deleted`)
      void invalidate()
    },
    onError: reportGatePassError,
  })
}
