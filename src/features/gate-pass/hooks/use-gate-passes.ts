import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { fetchGatePass, fetchGatePassStats, fetchGatePasses } from '../api/gate-pass-api'
import type { ApiError } from '@/lib/axios'
import type {
  GatePassListParams,
  GatePassListResult,
  GatePassRecord,
  GatePassStats,
} from '../types'

export const gatePassKeys = {
  all: ['gate-passes'] as const,
  list: (params: GatePassListParams) => ['gate-passes', 'list', params] as const,
  detail: (id: string) => ['gate-passes', 'detail', id] as const,
  stats: () => ['gate-passes', 'stats'] as const,
  document: (id: string) => ['gate-passes', 'document', id] as const,
}

/**
 * Shorter than the app-wide 5-minute staleTime: an operator working through a
 * stack of challans expects the list to reflect what they just filed. Still
 * long enough that paging back and forth is free.
 */
const LIST_STALE_TIME = 30_000

/** A cold Render instance can take most of a minute to answer the first call. */
const COLD_START_RETRIES = 2

export function useGatePasses(
  params: GatePassListParams,
): UseQueryResult<GatePassListResult, ApiError> {
  return useQuery({
    queryKey: gatePassKeys.list(params),
    queryFn: () => fetchGatePasses(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the previous page on screen while the next one loads, so paging
    // and filtering never blank the table.
    placeholderData: keepPreviousData,
    retry: COLD_START_RETRIES,
  })
}

export function useGatePassStats(): UseQueryResult<GatePassStats, ApiError> {
  return useQuery({
    queryKey: gatePassKeys.stats(),
    queryFn: fetchGatePassStats,
    staleTime: LIST_STALE_TIME,
    retry: COLD_START_RETRIES,
  })
}

export function useGatePass(id: string | undefined): UseQueryResult<GatePassRecord, ApiError> {
  return useQuery({
    queryKey: gatePassKeys.detail(id ?? ''),
    queryFn: () => fetchGatePass(id as string),
    enabled: Boolean(id),
    staleTime: LIST_STALE_TIME,
    retry: COLD_START_RETRIES,
  })
}
