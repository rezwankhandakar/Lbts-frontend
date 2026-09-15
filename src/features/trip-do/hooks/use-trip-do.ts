import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  fetchColumnValues,
  fetchGatePassOptions,
  fetchGatePassTripDoStatus,
  fetchTripDoRows,
  filterParams,
} from '../api/trip-do-api'
import { setColumnFilter } from '@/lib/column-filters'
import type {
  ColumnValuesResult,
  GatePassOption,
  GatePassTripDoStatus,
  TripDoColumnId,
  TripDoListParams,
  TripDoListResult,
} from '../types'

export const tripDoKeys = {
  all: ['trip-do'] as const,
  list: (params: TripDoListParams) => ['trip-do', 'list', params] as const,
  columnValues: (column: TripDoColumnId, filters: Record<string, string>) =>
    ['trip-do', 'column-values', column, filters] as const,
  options: (rowId: string, q: string) => ['trip-do', 'options', rowId, q] as const,
  gatePass: (id: string) => ['trip-do', 'gate-pass', id] as const,
}

export function useTripDoRows(
  params: TripDoListParams,
): UseQueryResult<TripDoListResult, ApiError> {
  return useQuery({
    queryKey: tripDoKeys.list(params),
    queryFn: () => fetchTripDoRows(params),
    staleTime: 15_000,
    // The previous page stays on screen while the next loads, so paging and
    // filtering never blank a sheet somebody is reading across.
    placeholderData: keepPreviousData,
    // A cold Render instance can take most of a minute to wake.
    retry: 2,
  })
}

/**
 * What one column's dropdown offers, fetched only while it is open. The
 * column's own ticks are left out of the request, so an unticked value is
 * still there to tick again.
 */
export function useColumnValues(
  column: TripDoColumnId,
  params: TripDoListParams,
  enabled: boolean,
): UseQueryResult<ColumnValuesResult, ApiError> {
  const others = { ...params, columns: setColumnFilter(params.columns, column, null) }

  return useQuery({
    queryKey: tripDoKeys.columnValues(column, filterParams(others)),
    queryFn: () => fetchColumnValues(column, others),
    enabled,
    staleTime: 30_000,
    retry: 1,
  })
}

/**
 * The gate passes one row could take as its Trip DO.
 *
 * No retry, for the reason the model lookup gives: a suggestion that arrives
 * after a cold-start retry is an answer to something nobody is typing any more.
 * The previous answer stays while the next loads, so the list does not flash
 * empty on every keystroke.
 */
export function useGatePassOptions(
  rowId: string | null,
  q: string,
): UseQueryResult<GatePassOption[], ApiError> {
  return useQuery({
    queryKey: tripDoKeys.options(rowId ?? '', q),
    queryFn: () => fetchGatePassOptions(rowId ?? '', q),
    enabled: rowId !== null,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useGatePassTripDoStatus(
  gatePassId: string | undefined,
): UseQueryResult<GatePassTripDoStatus, ApiError> {
  return useQuery({
    queryKey: tripDoKeys.gatePass(gatePassId ?? ''),
    queryFn: () => fetchGatePassTripDoStatus(gatePassId ?? ''),
    enabled: Boolean(gatePassId),
    staleTime: 15_000,
    retry: 2,
  })
}

/**
 * The first itemised reason under the message, the treatment every module
 * gives its errors — "Validation failed" alone tells an operator nothing.
 */
export function reportTripDoError(error: ApiError): void {
  const detail = error.errorSources?.find(
    (source) => source.message && source.message !== error.message,
  )

  toast.error(error.message, {
    description: detail ? detail.message : undefined,
  })
}
