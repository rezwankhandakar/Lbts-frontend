import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  fetchLabourBill,
  fetchLabourBillCompanies,
  fetchLabourBills,
} from '../api/labour-bill-api'
import type { LabourBillDetail, LabourBillListParams, LabourBillListResult } from '../types'

export const labourBillKeys = {
  all: ['labour-bills'] as const,
  list: (params: LabourBillListParams) => ['labour-bills', 'list', params] as const,
  detail: (id: string) => ['labour-bills', 'detail', id] as const,
}

/** Type-ahead lives outside the invalidated namespace, the rule CLAUDE.md sets for suggestions. */
const companyKeys = ['labour-bill-companies'] as const

export function useLabourBills(
  params: LabourBillListParams,
  enabled = true,
): UseQueryResult<LabourBillListResult, ApiError> {
  return useQuery({
    queryKey: labourBillKeys.list(params),
    queryFn: () => fetchLabourBills(params),
    enabled,
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake.
    retry: 2,
  })
}

export function useLabourBill(id: string | undefined): UseQueryResult<LabourBillDetail, ApiError> {
  return useQuery({
    queryKey: labourBillKeys.detail(id ?? ''),
    queryFn: () => fetchLabourBill(id ?? ''),
    enabled: Boolean(id),
    staleTime: 10_000,
    retry: 2,
  })
}

export function useLabourBillCompanies(enabled: boolean): UseQueryResult<string[], ApiError> {
  return useQuery({
    queryKey: companyKeys,
    queryFn: fetchLabourBillCompanies,
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
  })
}

/** The first itemised reason under the message, the treatment every module gives its errors. */
export function reportLabourBillError(error: ApiError): void {
  const detail = error.errorSources?.find(
    (source) => source.message && source.message !== error.message,
  )
  toast.error(error.message, { description: detail ? detail.message : undefined })
}
