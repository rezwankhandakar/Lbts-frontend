import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  fetchActivity,
  fetchActivityFilters,
  fetchActivityStats,
  fetchVendorActivity,
} from '../api/activity-api'
import type {
  ActivityFilterOptions,
  ActivityListParams,
  ActivityListResult,
  ActivityRecord,
  ActivityStats,
} from '../types'

export const activityKeys = {
  all: ['activity'] as const,
  list: (params: ActivityListParams) => ['activity', 'list', params] as const,
  stats: (params: ActivityListParams) => ['activity', 'stats', params] as const,
  filters: () => ['activity', 'filters'] as const,
  vendor: (vendorId: string, limit: number) => ['activity', 'vendor', vendorId, limit] as const,
}

/**
 * Freshness, and why it is what it is.
 *
 * **Nothing here invalidates.** This module has no mutations — the journal is
 * appended by services and by nothing a request can reach — so the only way a
 * row arrives is time passing. That makes the stale time the whole caching
 * policy, and a short one right: somebody watching the journal while an
 * operator works expects the page to catch up when they come back to it.
 *
 * The filter options are the exception. Who has ever done something, and what
 * actions exist, change about as often as the deployment does.
 */
const LIST_STALE_TIME = 20_000
const FILTER_STALE_TIME = 10 * 60_000

export function useActivity(
  params: ActivityListParams,
): UseQueryResult<ActivityListResult, ApiError> {
  return useQuery({
    queryKey: activityKeys.list(params),
    queryFn: () => fetchActivity(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next loads, so paging and
    // filtering never blank the timeline.
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake up.
    retry: 2,
  })
}

/**
 * The overview.
 *
 * Takes the same params as the list, because every figure on it answers the
 * filters rather than the collection — the rule every total in this app
 * follows. Its own query rather than a slice of the list's, because the list
 * holds one page of twenty-five and these are sums over the whole matching
 * set.
 */
export function useActivityStats(
  params: ActivityListParams,
): UseQueryResult<ActivityStats, ApiError> {
  return useQuery({
    queryKey: activityKeys.stats(params),
    queryFn: () => fetchActivityStats(params),
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: 2,
  })
}

export function useActivityFilters(): UseQueryResult<ActivityFilterOptions, ApiError> {
  return useQuery({
    queryKey: activityKeys.filters(),
    queryFn: fetchActivityFilters,
    staleTime: FILTER_STALE_TIME,
    retry: 2,
  })
}

/**
 * One vendor's journal, for the tab on its page.
 *
 * A key outside the vendor namespace, deliberately. Nothing a vendor page does
 * writes a journal row directly — the rows are a side effect of the writes it
 * already invalidates — and putting this under `['vendors', …]` would refetch
 * the whole history every time somebody renamed a driver.
 */
export function useVendorActivity(
  vendorId: string,
  limit = 30,
): UseQueryResult<ActivityRecord[], ApiError> {
  return useQuery({
    queryKey: activityKeys.vendor(vendorId, limit),
    queryFn: () => fetchVendorActivity(vendorId, limit),
    staleTime: LIST_STALE_TIME,
    enabled: vendorId.length > 0,
    retry: 2,
  })
}

/**
 * The generic top-level message for a failure tells a reader nothing, so where
 * the API itemised what was wrong the first entry is shown underneath — the
 * same treatment every other module gives its errors.
 */
export function reportActivityError(error: ApiError): void {
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
