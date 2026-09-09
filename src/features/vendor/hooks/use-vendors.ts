import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  changeVendorStatus,
  createVendor,
  deleteVendor,
  fetchMyVendor,
  fetchVendor,
  fetchVendorActivity,
  fetchVendorOptions,
  fetchVendorStats,
  fetchVendorSummary,
  fetchVendors,
  removeVendorPhoto,
  updateVendor,
  uploadVendorPhoto,
} from '../api/vendor-api'
import type { VendorInput, VendorStatusArgs } from '../api/vendor-api'
import type {
  ActivityRecord,
  ListResult,
  VendorListParams,
  VendorOption,
  VendorRecord,
  VendorRemoval,
  VendorStats,
  VendorSummary,
} from '../types'

/**
 * The query keys for the whole module.
 *
 * One namespace, because almost every write here changes more than one of them:
 * adding a vehicle changes the vehicle list, the vendor's counts, the summary,
 * the compliance totals and the activity feed. Invalidating the namespace is
 * what stops the page telling two different stories — the same call the
 * Location module makes for the same reason.
 */
export const vendorKeys = {
  all: ['vendors'] as const,
  list: (params: VendorListParams) => ['vendors', 'list', params] as const,
  stats: () => ['vendors', 'stats'] as const,
  options: (operational: boolean) => ['vendors', 'options', operational] as const,
  mine: () => ['vendors', 'me'] as const,
  detail: (id: string) => ['vendors', 'detail', id] as const,
  summary: (id: string) => ['vendors', 'summary', id] as const,
  activity: (id: string) => ['vendors', 'activity', id] as const,
}

const LIST_STALE_TIME = 30_000
/** A selector's contents change rarely and are opened repeatedly. */
const REFERENCE_STALE_TIME = 5 * 60_000

export function useVendors(
  params: VendorListParams,
): UseQueryResult<ListResult<VendorRecord>, ApiError> {
  return useQuery({
    queryKey: vendorKeys.list(params),
    queryFn: () => fetchVendors(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next loads, so paging and
    // filtering never blank the table.
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake up.
    retry: 2,
  })
}

export function useVendorStats(enabled = true): UseQueryResult<VendorStats, ApiError> {
  return useQuery({
    queryKey: vendorKeys.stats(),
    queryFn: fetchVendorStats,
    staleTime: LIST_STALE_TIME,
    enabled,
    retry: 2,
  })
}

export function useVendorOptions(
  operational = false,
  enabled = true,
): UseQueryResult<VendorOption[], ApiError> {
  return useQuery({
    queryKey: vendorKeys.options(operational),
    queryFn: () => fetchVendorOptions(operational),
    staleTime: REFERENCE_STALE_TIME,
    enabled,
    retry: 2,
  })
}

/**
 * The signed-in vendor account's own record.
 *
 * `enabled` is not a convenience: without it every staff account opening the
 * app would fire a request the API answers 404, spend a cold start on it and
 * log an error for a page they were never shown.
 */
export function useMyVendor(enabled = true): UseQueryResult<VendorRecord, ApiError> {
  return useQuery({
    queryKey: vendorKeys.mine(),
    queryFn: fetchMyVendor,
    staleTime: LIST_STALE_TIME,
    enabled,
    retry: 2,
  })
}

export function useVendor(id: string | undefined): UseQueryResult<VendorRecord, ApiError> {
  return useQuery({
    queryKey: vendorKeys.detail(id ?? ''),
    queryFn: () => fetchVendor(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

/**
 * The overview, in one request.
 *
 * The whole reason the server has a summary endpoint: an overview firing six
 * requests at a sleeping Render instance is six cold starts stacked one behind
 * the other, which is the difference between a page that appears and a page
 * somebody gives up on.
 */
export function useVendorSummary(
  id: string | undefined,
): UseQueryResult<VendorSummary, ApiError> {
  return useQuery({
    queryKey: vendorKeys.summary(id ?? ''),
    queryFn: () => fetchVendorSummary(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

export function useVendorActivity(
  id: string | undefined,
  enabled = true,
): UseQueryResult<ActivityRecord[], ApiError> {
  return useQuery({
    queryKey: vendorKeys.activity(id ?? ''),
    queryFn: () => fetchVendorActivity(id as string, 40),
    enabled: Boolean(id) && enabled,
    staleTime: LIST_STALE_TIME,
    retry: 2,
  })
}

/**
 * Every write invalidates the whole namespace.
 *
 * Adding a vehicle changes the vehicle list, the vendor's counts on the
 * directory, the summary, the compliance totals and the activity feed.
 * Refetching one key would leave the page telling two different stories about
 * the same fleet.
 */
export function useInvalidateVendors() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: vendorKeys.all })
}

/**
 * The generic top-level message for a validation failure tells somebody
 * nothing, so where the API itemised what was wrong the first entry is shown
 * underneath. The same treatment administration, profile, gate pass, challan
 * and location give their errors.
 */
export function reportVendorError(error: ApiError): void {
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

export function useCreateVendor(): UseMutationResult<VendorRecord, ApiError, VendorInput> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: createVendor,
    onSuccess: (vendor) => {
      toast.success(`${vendor.name} added as ${vendor.vendorCode}`, {
        description:
          vendor.status === 'Active'
            ? 'It can take assignments straight away.'
            : `It is ${vendor.status.toLowerCase()}, so nothing can be assigned under it yet.`,
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useUpdateVendor(): UseMutationResult<
  VendorRecord,
  ApiError,
  VendorInput & { id: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: updateVendor,
    onSuccess: (vendor) => {
      toast.success(`${vendor.name} updated`)
      void invalidate()
    },
    onError: reportVendorError,
  })
}

/**
 * Moving a vendor between lifecycle states.
 *
 * The toast says what it means rather than "Saved": an inactive or suspended
 * vendor stops receiving new assignments, and somebody who does not know that
 * will not understand why the assignment form stopped offering it.
 */
export function useChangeVendorStatus(): UseMutationResult<
  VendorRecord,
  ApiError,
  VendorStatusArgs
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: changeVendorStatus,
    onSuccess: (vendor) => {
      toast.success(`${vendor.name} is now ${vendor.status}`, {
        description:
          vendor.status === 'Active'
            ? 'It can take new assignments again.'
            : 'Existing records are kept. Nothing new can be assigned under it.',
      })
      void invalidate()
    },
    onError: reportVendorError,
  })
}

/**
 * Removing one.
 *
 * Two outcomes and the toast has to tell them apart. A vendor nothing
 * references is deleted; one with vehicles, drivers, assignments or a linked
 * user account behind it is deactivated instead, and reporting that as a
 * deletion would leave somebody believing they had removed something that is
 * still on a year of records.
 */
export function useDeleteVendor(): UseMutationResult<
  VendorRemoval,
  ApiError,
  { id: string; label: string }
> {
  const invalidate = useInvalidateVendors()

  return useMutation({
    mutationFn: ({ id }) => deleteVendor(id),
    onSuccess: (result, variables) => {
      const referenced =
        result.vehicles + result.drivers + result.assignments + result.linkedUsers

      toast.success(
        result.deactivated ? `${variables.label} deactivated` : `${variables.label} deleted`,
        {
          description: result.deactivated
            ? `${referenced} record${referenced === 1 ? '' : 's'} still reference it, so it was kept and taken out of use instead.`
            : 'Nothing referenced it, so it is gone.',
        },
      )
      void invalidate()
    },
    onError: reportVendorError,
  })
}

export function useVendorPhoto(): {
  upload: UseMutationResult<VendorRecord, ApiError, { id: string; file: File }>
  remove: UseMutationResult<VendorRecord, ApiError, string>
} {
  const invalidate = useInvalidateVendors()

  const upload = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadVendorPhoto(id, file),
    onSuccess: () => {
      toast.success('Photo updated')
      void invalidate()
    },
    onError: reportVendorError,
  })

  const remove = useMutation({
    mutationFn: removeVendorPhoto,
    onSuccess: () => {
      toast.success('Photo removed')
      void invalidate()
    },
    onError: reportVendorError,
  })

  return { upload, remove }
}
