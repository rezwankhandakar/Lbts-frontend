import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
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
  const parts = [`CSD ${result.csd || '—'}`, `Unit ${result.unit || '—'}`, result.gatePassNumber]
  if (result.remainderQty > 0) {
    parts.push(`${result.remainderQty} left on a row of their own`)
  }
  return parts.join(' · ')
}

export function useLinkTripDo(): UseMutationResult<TripDoLinkResult, ApiError, LinkRowArgs> {
  const invalidate = useInvalidateTripDo()

  return useMutation({
    mutationFn: linkTripDoRow,
    onSuccess: (result) => {
      toast.success(`Trip DO ${result.tripDo} set on ${result.qty}`, {
        description: linkDescription(result),
      })
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
      toast.success(`Trip DO ${result.tripDo} set on ${result.rows} rows`, {
        description: `${result.qty} pieces · ${linkDescription(result)}`,
      })
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
      toast.success('Trip DO removed', {
        description: 'The row is waiting for a Trip DO again, merged with any other waiting part of the line.',
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
      toast.success(`Row split into ${result.parts} parts`, {
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
        result.merged > 0 ? `Parts merged back into ${result.qty}` : 'Nothing to merge',
        {
          description:
            result.merged > 0
              ? undefined
              : 'The other parts of this line carry a different Trip DO, so they stay apart.',
        },
      )
      void invalidate()
    },
    onError: reportTripDoError,
  })
}
