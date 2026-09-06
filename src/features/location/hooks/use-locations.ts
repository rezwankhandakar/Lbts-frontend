import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  createLocation,
  deleteLocation,
  fetchDistricts,
  fetchLocationStats,
  fetchLocations,
  fetchThanas,
  resolveLocation,
  updateLocation,
} from '../api/location-api'
import type {
  CreateLocationArgs,
  ResolveLocationArgs,
  UpdateLocationArgs,
} from '../api/location-api'
import type {
  LocationListParams,
  LocationListResult,
  LocationRecord,
  LocationRemoval,
  LocationResolution,
  LocationStats,
  ThanaOption,
} from '../types'

export const locationKeys = {
  all: ['locations'] as const,
  list: (params: LocationListParams) => ['locations', 'list', params] as const,
  stats: () => ['locations', 'stats'] as const,
  districts: () => ['locations', 'districts'] as const,
  thanas: (district: string) => ['locations', 'thanas', district] as const,
}

/**
 * Reference data changes rarely, so it is cached hard.
 *
 * The cascade in particular: an operator setting the location on a stack of
 * challans opens the same district list twenty times, and re-fetching it each
 * time would be twenty round trips to a sleeping instance for a list that has
 * not changed since the deploy. Every write invalidates the namespace, so an
 * Admin's edit is still visible immediately.
 */
const REFERENCE_STALE_TIME = 10 * 60_000
const LIST_STALE_TIME = 30_000

export function useLocations(
  params: LocationListParams,
): UseQueryResult<LocationListResult, ApiError> {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => fetchLocations(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next loads, so paging and
    // filtering never blank the table.
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake up.
    retry: 2,
  })
}

/**
 * The overview panel, which is Admin-only on the server.
 *
 * `enabled` is not a convenience: without it every Manager, CEO and Operation
 * Executive opening this page would fire a request the API refuses, spend a
 * cold start on it and get a 403 in the console for a panel they were never
 * shown.
 */
export function useLocationStats(enabled = true): UseQueryResult<LocationStats, ApiError> {
  return useQuery({
    queryKey: locationKeys.stats(),
    queryFn: fetchLocationStats,
    staleTime: LIST_STALE_TIME,
    enabled,
    retry: 2,
  })
}

export function useDistricts(enabled = true): UseQueryResult<string[], ApiError> {
  return useQuery({
    queryKey: locationKeys.districts(),
    queryFn: fetchDistricts,
    staleTime: REFERENCE_STALE_TIME,
    enabled,
    retry: 2,
  })
}

/**
 * The thanas of one district.
 *
 * Disabled until a district is chosen, which is what makes the cascade a
 * cascade: there is no meaningful list of thanas without one, and asking for
 * every thana in the country would be a request nobody could read the answer
 * to.
 */
export function useThanas(district: string): UseQueryResult<ThanaOption[], ApiError> {
  return useQuery({
    queryKey: locationKeys.thanas(district),
    queryFn: () => fetchThanas(district),
    staleTime: REFERENCE_STALE_TIME,
    enabled: district.length > 0,
    retry: 2,
  })
}

/**
 * What a piece of challan text resolves to.
 *
 * A query rather than a mutation, even though it is a POST, and the caching is
 * the reason: an operator working through one WhatsApp PDF types the same
 * district fifteen times, and switching between sheets in the tray would
 * otherwise re-ask on every switch. It changes nothing on the server, so
 * caching it is honest.
 *
 * `enabled` is how the caller keeps this off the keystroke path — it is passed
 * a debounced value and is switched off entirely once somebody has chosen a
 * location by hand, because nothing may re-resolve over a person's choice.
 */
export function useLocationResolution(
  args: ResolveLocationArgs,
  enabled: boolean,
): UseQueryResult<LocationResolution, ApiError> {
  return useQuery({
    queryKey: ['locations', 'resolve', args] as const,
    queryFn: () => resolveLocation(args),
    enabled,
    staleTime: 5 * 60_000,
    // One retry, not the usual two. A failed lookup costs a blank location and
    // nothing else, and the operator is waiting to submit.
    retry: 1,
  })
}

/**
 * Every write invalidates the whole namespace. Adding a thana changes the
 * list, the counts, the district options and the cascade, so refetching one
 * key would leave the page telling two different stories.
 */
function useInvalidateLocations() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: locationKeys.all })
}

/**
 * The generic top-level message for a validation failure tells an Admin
 * nothing, so where the API itemised what was wrong the first entry is shown
 * underneath. The same treatment administration, profile, gate pass and
 * challan give their errors.
 */
export function reportLocationError(error: ApiError): void {
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

export function useCreateLocation(): UseMutationResult<
  LocationRecord,
  ApiError,
  CreateLocationArgs
> {
  const invalidate = useInvalidateLocations()

  return useMutation({
    mutationFn: createLocation,
    onSuccess: (location) => {
      toast.success(`${location.district} / ${location.thana} added`, {
        description: `Challans matching it will be classified as ${location.locationType}.`,
      })
      void invalidate()
    },
    onError: reportLocationError,
  })
}

/**
 * Correcting a row.
 *
 * The toast says what it means rather than "Saved": correcting a location type
 * reclassifies every challan that points at this row, which is the whole
 * reason a challan stores a reference rather than a copy — and an Admin who
 * does not know that will not know how much they just fixed.
 */
export function useUpdateLocation(): UseMutationResult<
  LocationRecord,
  ApiError,
  UpdateLocationArgs
> {
  const invalidate = useInvalidateLocations()

  return useMutation({
    mutationFn: updateLocation,
    onSuccess: (location) => {
      toast.success(`${location.district} / ${location.thana} updated`, {
        description: location.isActive
          ? 'Challans that reference it now read the corrected values.'
          : 'It is deactivated, so it can no longer be chosen or matched.',
      })
      void invalidate()
    },
    onError: reportLocationError,
  })
}

/**
 * Removing one.
 *
 * Two outcomes and the toast has to tell them apart. A row nothing references
 * is deleted; a row challans point at is deactivated instead, and reporting
 * that as a deletion would leave an Admin believing they had removed something
 * that is still on a year of records.
 */
export function useDeleteLocation(): UseMutationResult<
  LocationRemoval,
  ApiError,
  { id: string; label: string }
> {
  const invalidate = useInvalidateLocations()

  return useMutation({
    mutationFn: ({ id }) => deleteLocation(id),
    onSuccess: (result, variables) => {
      toast.success(
        result.deactivated ? `${variables.label} deactivated` : `${variables.label} deleted`,
        {
          description: result.deactivated
            ? `${result.challanCount} challan${
                result.challanCount === 1 ? '' : 's'
              } still reference it, so it was kept and taken out of use instead.`
            : 'Nothing referenced it, so it is gone.',
        },
      )
      void invalidate()
    },
    onError: reportLocationError,
  })
}
