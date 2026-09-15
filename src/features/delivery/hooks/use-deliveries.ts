import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  clearCopyMissing,
  deleteTrip,
  markCopyMissing,
  fetchChallanDispatch,
  fetchTrip,
  fetchTripStats,
  fetchTrips,
  removeReceivedCopy,
  saveCompletion,
  saveTripBill,
  uploadReceivedCopy,
} from '../api/delivery-api'
import { localToday, shortTripNumber } from '../lib/delivery-meta'
import type {
  ChallanDispatchDetail,
  CompletionPayload,
  TripBillPayload,
  TripListParams,
  TripListResult,
  TripRecord,
  TripStats,
} from '../types'

/**
 * The query keys for the module. One namespace, because a trip written here
 * changes the list, the stats, its own record and the allocation every cart
 * search reads — invalidating the namespace keeps the pages telling one story.
 */
export const deliveryKeys = {
  all: ['deliveries'] as const,
  list: (params: TripListParams) => ['deliveries', 'list', params] as const,
  stats: (today: string) => ['deliveries', 'stats', today] as const,
  detail: (id: string) => ['deliveries', 'detail', id] as const,
  vehicles: (q: string) => ['deliveries', 'vehicles', q] as const,
  vehicle: (id: string) => ['deliveries', 'vehicle', id] as const,
  candidates: (q: string, excludeTripId: string) =>
    ['deliveries', 'candidates', q, excludeTripId] as const,
  candidateIds: (ids: string[], excludeTripId: string) =>
    ['deliveries', 'candidate-ids', ids.join(','), excludeTripId] as const,
  byChallan: (challanId: string) => ['deliveries', 'by-challan', challanId] as const,
}

const LIST_STALE_TIME = 30_000

export function useTrips(params: TripListParams): UseQueryResult<TripListResult, ApiError> {
  return useQuery({
    queryKey: deliveryKeys.list(params),
    queryFn: () => fetchTrips(params),
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake up.
    retry: 2,
  })
}

export function useTripStats(enabled = true): UseQueryResult<TripStats, ApiError> {
  const today = localToday()

  return useQuery({
    queryKey: deliveryKeys.stats(today),
    queryFn: () => fetchTripStats(today),
    staleTime: LIST_STALE_TIME,
    enabled,
    retry: 2,
  })
}

export function useTrip(id: string | undefined): UseQueryResult<TripRecord, ApiError> {
  return useQuery({
    queryKey: deliveryKeys.detail(id ?? ''),
    queryFn: () => fetchTrip(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

/**
 * The dispatch state of one challan, for the challan's own page. Refetched
 * whenever a trip is written, because a trip is the only thing that changes it.
 */
export function useChallanDispatch(
  challanId: string | undefined,
): UseQueryResult<ChallanDispatchDetail, ApiError> {
  return useQuery({
    queryKey: deliveryKeys.byChallan(challanId ?? ''),
    queryFn: () => fetchChallanDispatch(challanId as string),
    enabled: Boolean(challanId),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

/** Everything a trip write can have changed, vendor activity included. */
export function useInvalidateDeliveries(): () => Promise<void> {
  const client = useQueryClient()

  return async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: deliveryKeys.all }),
      // A vendor's Trips tab lists every trip written against it.
      client.invalidateQueries({ queryKey: ['vendors', 'trips'] }),
      /**
       * And the challans themselves: a trip changes their dispatch status,
       * their backlog counts, and — where it corrected something — their lines
       * and their charge. A stale challan list would show goods as waiting
       * that are already on a lorry.
       */
      client.invalidateQueries({ queryKey: ['challans'] }),
    ])
  }
}

export function reportDeliveryError(error: ApiError): void {
  toast.error(error.message, {
    description:
      error.errorSources.find((source) => source.message !== error.message)?.message ?? undefined,
  })
}

/**
 * What came back, how far up it went, and what that cost.
 *
 * It invalidates the whole namespace like every other trip write, because a
 * return releases quantity: the challan it came off is waiting for a lorry
 * again, and every cart search and challan list has to say so.
 */
export function useSaveCompletion(): UseMutationResult<
  TripRecord,
  ApiError,
  { tripId: string; challanId: string; payload: CompletionPayload }
> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: saveCompletion,
    onSuccess: (trip, { challanId }) => {
      const challan = trip.challans?.find((entry) => entry.challanId === challanId)
      toast.success(
        challan?.completionMethod === 'Returned' ? 'Returned in full — delivery closed' : 'Saved',
      )
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}

export function useUploadReceivedCopy(): UseMutationResult<
  TripRecord,
  ApiError,
  { tripId: string; challanId: string; file: Blob; fileName: string; pageCount?: number | null }
> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: uploadReceivedCopy,
    onSuccess: (trip) => {
      toast.success('Signed copy filed', {
        description:
          trip.status === 'Completed'
            ? `Every challan on ${shortTripNumber(trip.tripNumber)} has now been signed for.`
            : 'This delivery is complete.',
      })
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}

export function useRemoveReceivedCopy(): UseMutationResult<
  TripRecord,
  ApiError,
  { tripId: string; challanId: string }
> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: removeReceivedCopy,
    onSuccess: () => {
      toast.success('Signed copy removed', {
        description: 'The delivery is open again.',
      })
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}

export function useSaveTripBill(): UseMutationResult<
  TripRecord,
  ApiError,
  { tripId: string; payload: TripBillPayload }
> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: saveTripBill,
    onSuccess: () => {
      toast.success('Trip bill saved')
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}

export function useMarkCopyMissing(): UseMutationResult<
  TripRecord,
  ApiError,
  { tripId: string; challanId: string; reason: string }
> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: markCopyMissing,
    onSuccess: () => {
      toast.success('Delivery completed', {
        description: 'Recorded without a signed copy. Scan it if it turns up.',
      })
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}

export function useClearCopyMissing(): UseMutationResult<
  TripRecord,
  ApiError,
  { tripId: string; challanId: string }
> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: clearCopyMissing,
    onSuccess: () => {
      toast.success('The delivery is open again')
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}

export function useDeleteTrip(): UseMutationResult<{ id: string }, ApiError, string> {
  const invalidate = useInvalidateDeliveries()

  return useMutation({
    mutationFn: deleteTrip,
    onSuccess: () => {
      toast.success('Trip deleted', {
        description: 'Every challan quantity it held is free for another trip.',
      })
      void invalidate()
    },
    onError: reportDeliveryError,
  })
}
