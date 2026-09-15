import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { fetchBill, fetchBillCandidates, fetchBillUnits, fetchBills } from '../api/bill-api'
import type { BillCandidates, BillDetail, BillListParams, BillListResult } from '../types'

export const billKeys = {
  all: ['bills'] as const,
  list: (params: BillListParams) => ['bills', 'list', params] as const,
  detail: (id: string) => ['bills', 'detail', id] as const,
  candidates: (id: string, q: string) => ['bills', 'candidates', id, q] as const,
}

/** Type-ahead lives outside the invalidated namespace, the rule CLAUDE.md sets for suggestions. */
const unitKeys = ['bill-units'] as const

export function useBills(params: BillListParams, enabled = true): UseQueryResult<BillListResult, ApiError> {
  return useQuery({
    queryKey: billKeys.list(params),
    queryFn: () => fetchBills(params),
    enabled,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake.
    retry: 2,
  })
}

export function useBill(id: string | undefined): UseQueryResult<BillDetail, ApiError> {
  return useQuery({
    queryKey: billKeys.detail(id ?? ''),
    queryFn: () => fetchBill(id ?? ''),
    enabled: Boolean(id),
    staleTime: 10_000,
    retry: 2,
  })
}

export function useBillUnits(enabled: boolean): UseQueryResult<string[], ApiError> {
  return useQuery({
    queryKey: unitKeys,
    queryFn: fetchBillUnits,
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

/**
 * Trip DO rows a bill could take, fetched only while the add panel is open. No
 * retry, for the reason every type-ahead gives: an answer that arrives after a
 * retry is an answer to something nobody is typing any more.
 */
export function useBillCandidates(
  id: string,
  q: string,
  enabled: boolean,
): UseQueryResult<BillCandidates, ApiError> {
  return useQuery({
    queryKey: billKeys.candidates(id, q),
    queryFn: () => fetchBillCandidates(id, q),
    enabled,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

/** The first itemised reason under the message, the treatment every module gives its errors. */
export function reportBillError(error: ApiError): void {
  const detail = error.errorSources?.find((source) => source.message && source.message !== error.message)
  toast.error(error.message, { description: detail ? detail.message : undefined })
}
