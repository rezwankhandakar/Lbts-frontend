import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BLANK } from '@/lib/format'
import { countOf, t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import {
  bulkLinkTripDoRows,
  linkTripDoRow,
  mergeTripDoRow,
  splitTripDoRow,
  unlinkTripDoRow,
} from '../api/trip-do-api'
import type { BulkLinkArgs, LinkRowArgs } from '../api/trip-do-api'
import type { TripDoLinkResult } from '../types'
import { reportTripDoError, tripDoKeys } from './use-trip-do'

/**
 * Every write invalidates the whole namespace. A link changes the row, the
 * toolbar totals, the room left on the gate pass in the picker and that gate
 * pass's own panel — refetching one of those would leave the page telling two
 * stories.
 */
function useInvalidateTripDo() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: tripDoKeys.all })
}

/** "CSD CSD-04 · Unit WFR", and what a split left behind. */
function linkDescription(result: TripDoLinkResult): string {
  const parts = [
    t('tripDo.remove.linkDetail', {
      csd: result.csd || BLANK,
      unit: result.unit || BLANK,
      gatePass: result.gatePassNumber,
    }),
  ]
  if (result.remainderQty > 0) {
    parts.push(
      t('tripDo.remove.linkRemainder', { remainder: countOf(result.remainderQty, 'nouns.pc', t) }),
    )
  }
  return parts.join(' · ')
}

export function useLinkTripDo(): UseMutationResult<TripDoLinkResult, ApiError, LinkRowArgs> {
  const invalidate = useInvalidateTripDo()

  return useMutation({
    mutationFn: linkTripDoRow,
    onSuccess: (result) => {
      toast.success(
        t('tripDo.remove.linkedOne', {
          tripDo: result.tripDo,
          pieces: countOf(result.qty, 'nouns.pc', t),
        }),
        { description: linkDescription(result) },
      )
      void invalidate()
    },
    onError: reportTripDoError,
  })
}

export function useBulkLinkTripDo(): UseMutationResult<TripDoLinkResult, ApiError, BulkLinkArgs> {
  const invalidate = useInvalidateTripDo()

  return useMutation({
    mutationFn: bulkLinkTripDoRows,
    onSuccess: (result) => {
      toast.success(
        t('tripDo.remove.linkedMany', {
          tripDo: result.tripDo,
          rows: countOf(result.rows, 'nouns.row', t),
        }),
        {
          description: t('tripDo.remove.linkedManyNote', {
            pieces: countOf(result.qty, 'nouns.piece', t),
            detail: linkDescription(result),
          }),
        },
      )
      void invalidate()
    },
    onError: reportTripDoError,
  })
}

export function useUnlinkTripDo(): UseMutationResult<{ qty: number }, ApiError, string> {
  const invalidate = useInvalidateTripDo()

  return useMutation({
    mutationFn: unlinkTripDoRow,
    onSuccess: () => {
      toast.success(t('tripDo.remove.removed'), {
        description: t('tripDo.remove.removedNote'),
      })
      void invalidate()
    },
    onError: reportTripDoError,
  })
}

export function useSplitTripDo(): UseMutationResult<
  { parts: number },
  ApiError,
  { rowId: string; parts: number[] }
> {
  const invalidate = useInvalidateTripDo()

  return useMutation({
    mutationFn: splitTripDoRow,
    onSuccess: (result, variables) => {
      toast.success(t('tripDo.remove.splitDone', { parts: countOf(result.parts, 'nouns.part', t) }), {
        description: variables.parts.join(' + '),
      })
      void invalidate()
    },
    onError: reportTripDoError,
  })
}

export function useMergeTripDo(): UseMutationResult<
  { merged: number; qty: number },
  ApiError,
  string
> {
  const invalidate = useInvalidateTripDo()

  return useMutation({
    mutationFn: mergeTripDoRow,
    onSuccess: (result) => {
      toast.success(
        result.merged > 0
          ? t('tripDo.remove.mergedBack', { qty: result.qty })
          : t('tripDo.remove.nothingToMerge'),
        {
          description:
            result.merged > 0
              ? undefined
              : t('tripDo.remove.partsApart'),
        },
      )
      void invalidate()
    },
    onError: reportTripDoError,
  })
}
