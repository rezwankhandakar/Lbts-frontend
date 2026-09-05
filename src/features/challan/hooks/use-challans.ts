import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import type { ApiError } from '@/lib/axios'
import {
  fetchChallan,
  fetchChallanBatch,
  fetchChallanBatches,
  fetchChallanStats,
  fetchChallans,
} from '../api/challan-api'
import type { BatchListParams } from '../api/challan-api'
import type {
  ChallanBatchDetail,
  ChallanBatchListResult,
  ChallanListParams,
  ChallanListResult,
  ChallanRecord,
  ChallanStats,
} from '../types'

export const challanKeys = {
  all: ['challans'] as const,
  list: (params: ChallanListParams) => ['challans', 'list', params] as const,
  detail: (id: string) => ['challans', 'detail', id] as const,
  stats: () => ['challans', 'stats'] as const,
  batches: (params: BatchListParams) => ['challans', 'batches', params] as const,
  batch: (id: string) => ['challans', 'batch', id] as const,
}

/**
 * Shorter than the app-wide 5-minute staleTime: an operator working through a
 * WhatsApp PDF expects the list to reflect what they just filed. Still long
 * enough that paging back and forth is free.
 */
const LIST_STALE_TIME = 30_000

/** A cold Render instance can take most of a minute to answer the first call. */
const COLD_START_RETRIES = 2

export function useChallans(params: ChallanListParams): UseQueryResult<ChallanListResult, ApiError> {
  return useQuery({
    queryKey: challanKeys.list(params),
    queryFn: () => fetchChallans(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next one loads, so paging
    // and filtering never blank the table.
    placeholderData: keepPreviousData,
    retry: COLD_START_RETRIES,
  })
}

export function useChallan(id: string | undefined): UseQueryResult<ChallanRecord, ApiError> {
  return useQuery({
    queryKey: challanKeys.detail(id ?? ''),
    queryFn: () => fetchChallan(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: COLD_START_RETRIES,
  })
}

export function useChallanStats(): UseQueryResult<ChallanStats, ApiError> {
  return useQuery({
    queryKey: challanKeys.stats(),
    queryFn: fetchChallanStats,
    staleTime: LIST_STALE_TIME,
    retry: COLD_START_RETRIES,
  })
}

export function useChallanBatches(
  params: BatchListParams,
): UseQueryResult<ChallanBatchListResult, ApiError> {
  return useQuery({
    queryKey: challanKeys.batches(params),
    queryFn: () => fetchChallanBatches(params),
    staleTime: LIST_STALE_TIME,
    placeholderData: keepPreviousData,
    retry: COLD_START_RETRIES,
  })
}

export function useChallanBatch(
  id: string | undefined,
): UseQueryResult<ChallanBatchDetail, ApiError> {
  return useQuery({
    queryKey: challanKeys.batch(id ?? ''),
    queryFn: () => fetchChallanBatch(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: COLD_START_RETRIES,
  })
}
