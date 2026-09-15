import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ApiError } from '@/lib/axios'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import {
  fetchChallanCandidates,
  fetchTripVehicle,
  searchChallanCandidates,
  searchTripVehicles,
} from '../api/delivery-api'
import type { ChallanCandidate, TripVehicleOption, VehicleSearchResult } from '../types'
import { deliveryKeys } from './use-deliveries'

/** Typing must not fire a request per keystroke; a plate is usually four digits. */
const DEBOUNCE_MS = 250

/** Mirrors `MIN_PLATE_QUERY_LENGTH` — one character matches half the fleet. */
const MIN_PLATE_QUERY = 2

const MIN_CHALLAN_QUERY = 3

/**
 * The plate search behind the vehicle box.
 *
 * Server-side, debounced, and never the whole fleet: the browser holds the
 * dozen results it is shown and nothing else. The previous answer stays on
 * screen while the next is in flight, so the list refines rather than blinking
 * empty on every digit.
 */
export function useVehicleSearch(
  query: string,
): UseQueryResult<VehicleSearchResult, ApiError> & { debounced: string } {
  const debounced = useDebouncedValue(query.trim(), DEBOUNCE_MS)

  const result = useQuery<VehicleSearchResult, ApiError>({
    queryKey: deliveryKeys.vehicles(debounced),
    queryFn: ({ signal }) => searchTripVehicles(debounced, signal),
    enabled: debounced.length >= MIN_PLATE_QUERY,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    retry: 1,
  })

  return { ...result, debounced }
}

/** One vehicle with its vendor and assigned driver — for a trip being reopened. */
export function useTripVehicle(id: string | undefined): UseQueryResult<TripVehicleOption, ApiError> {
  return useQuery({
    queryKey: deliveryKeys.vehicle(id ?? ''),
    queryFn: () => fetchTripVehicle(id as string),
    enabled: Boolean(id),
    staleTime: 30_000,
    retry: 2,
  })
}

/** The cart's search box. Three characters, because a challan number shares its first two with every other. */
export function useChallanSearch(
  query: string,
  excludeTripId?: string,
): UseQueryResult<ChallanCandidate[], ApiError> & { debounced: string } {
  const debounced = useDebouncedValue(query.trim(), DEBOUNCE_MS)

  const result = useQuery<ChallanCandidate[], ApiError>({
    queryKey: deliveryKeys.candidates(debounced, excludeTripId ?? ''),
    queryFn: ({ signal }) => searchChallanCandidates(debounced, excludeTripId, signal),
    enabled: debounced.length >= MIN_CHALLAN_QUERY,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    retry: 1,
  })

  return { ...result, debounced }
}

/**
 * The live allocation of the challans already on a trip being edited, with
 * that trip's own quantities left out.
 */
export function useChallanCandidatesByIds(
  ids: string[],
  excludeTripId: string | undefined,
): UseQueryResult<ChallanCandidate[], ApiError> {
  return useQuery({
    queryKey: deliveryKeys.candidateIds(ids, excludeTripId ?? ''),
    queryFn: () => fetchChallanCandidates(ids, excludeTripId),
    enabled: ids.length > 0,
    staleTime: 0,
    retry: 2,
  })
}
