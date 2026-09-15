import { api } from '@/lib/axios'
import { filenameFrom, withBlobMessage } from '@/lib/download-error'
import type {
  ColumnValuesResult,
  GatePassOption,
  TripDoColumnId,
  GatePassTripDoStatus,
  TripDoLinkResult,
  TripDoListParams,
  TripDoListResult,
  TripDoPageMeta,
  TripDoRowRecord,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: TripDoPageMeta
}

const BASE = '/trip-do'

/**
 * What narrows the sheet, as query parameters. Shared by the list and the
 * export so a downloaded file is always the rows on screen. Empty values and
 * `all` are dropped, which keeps the query cache key minimal.
 */
export function filterParams(params: TripDoListParams): Record<string, string> {
  const result: Record<string, string> = {}
  if (params.search) result.search = params.search
  if (params.kind !== 'all') result.kind = params.kind
  if (params.link !== 'all') result.link = params.link
  if (params.from) result.from = params.from
  if (params.to) result.to = params.to
  // One JSON parameter: a ticked value is a string, a number or a blank.
  if (Object.keys(params.columns).length > 0) result.columns = JSON.stringify(params.columns)
  return result
}

/** The distinct values one column's dropdown offers, under the other filters. */
export async function fetchColumnValues(
  column: TripDoColumnId,
  params: TripDoListParams,
): Promise<ColumnValuesResult> {
  const { data } = await api.get<ApiEnvelope<ColumnValuesResult>>(`${BASE}/column-values`, {
    params: { column, ...filterParams(params) },
  })
  return data.data
}

export async function fetchTripDoRows(params: TripDoListParams): Promise<TripDoListResult> {
  const { data } = await api.get<ApiListEnvelope<TripDoRowRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })
  return { records: data.data, meta: data.meta }
}

/** Longer than the shared timeout: a cold instance builds the whole workbook first. */
const EXPORT_TIMEOUT = 120_000

export async function exportTripDoRows(
  params: TripDoListParams,
): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await api.get<Blob>(`${BASE}/export`, {
      params: filterParams(params),
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT,
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition'], 'trip-do.xlsx'),
    }
  } catch (error) {
    throw await withBlobMessage(error)
  }
}

/**
 * Gate passes one row could take as its Trip DO. Shorter than the shared
 * timeout, because this runs while somebody is typing — a late answer is one
 * they have already typed past.
 */
export async function fetchGatePassOptions(rowId: string, q: string): Promise<GatePassOption[]> {
  const { data } = await api.get<ApiEnvelope<GatePassOption[]>>(
    `${BASE}/${rowId}/gate-pass-options`,
    { params: q ? { q } : {}, timeout: 30_000 },
  )
  return data.data
}

export interface LinkRowArgs {
  rowId: string
  gatePassId: string
  /** The gate pass line the picker offered. */
  lineKey?: string
  qty?: number
}

export async function linkTripDoRow({ rowId, ...body }: LinkRowArgs): Promise<TripDoLinkResult> {
  const { data } = await api.patch<ApiEnvelope<TripDoLinkResult>>(`${BASE}/${rowId}/link`, body)
  return data.data
}

export interface BulkLinkArgs {
  rowIds: string[]
  gatePassId: string
  lineKey?: string
}

export async function bulkLinkTripDoRows(args: BulkLinkArgs): Promise<TripDoLinkResult> {
  const { data } = await api.post<ApiEnvelope<TripDoLinkResult>>(`${BASE}/bulk-link`, args)
  return data.data
}

export async function unlinkTripDoRow(rowId: string): Promise<{ qty: number }> {
  const { data } = await api.delete<ApiEnvelope<{ qty: number }>>(`${BASE}/${rowId}/link`)
  return data.data
}

export async function splitTripDoRow(args: {
  rowId: string
  parts: number[]
}): Promise<{ parts: number }> {
  const { data } = await api.post<ApiEnvelope<{ parts: number }>>(
    `${BASE}/${args.rowId}/split`,
    { parts: args.parts },
  )
  return data.data
}

export async function mergeTripDoRow(rowId: string): Promise<{ merged: number; qty: number }> {
  const { data } = await api.post<ApiEnvelope<{ merged: number; qty: number }>>(
    `${BASE}/${rowId}/merge`,
  )
  return data.data
}

export async function fetchGatePassTripDoStatus(gatePassId: string): Promise<GatePassTripDoStatus> {
  const { data } = await api.get<ApiEnvelope<GatePassTripDoStatus>>(
    `${BASE}/gate-passes/${gatePassId}`,
  )
  return data.data
}
