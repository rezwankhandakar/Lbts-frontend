import { api } from '@/lib/axios'
import { filenameFrom, withBlobMessage } from '@/lib/download-error'
import type {
  AddBillLinesResult,
  BillCandidates,
  BillDetail,
  BillInput,
  BillListParams,
  BillListResult,
  BillPageMeta,
  BillRecord,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: BillPageMeta
}

const BASE = '/bills'

/** Empty values and `all` are dropped, which keeps the query cache key minimal. */
function filterParams(params: BillListParams): Record<string, string | number> {
  const result: Record<string, string | number> = { page: params.page, limit: params.limit }
  if (params.search) result.search = params.search
  if (params.year !== null) result.year = params.year
  if (params.month !== null) result.month = params.month
  if (params.unit) result.unit = params.unit
  if (params.status !== 'all') result.status = params.status
  return result
}

export async function fetchBills(params: BillListParams): Promise<BillListResult> {
  const { data } = await api.get<ApiListEnvelope<BillRecord[]>>(BASE, { params: filterParams(params) })
  return { records: data.data, meta: data.meta }
}

export async function fetchBillUnits(): Promise<string[]> {
  const { data } = await api.get<ApiEnvelope<string[]>>(`${BASE}/units`)
  return data.data
}

export async function createBill(input: BillInput): Promise<BillRecord> {
  const { data } = await api.post<ApiEnvelope<BillRecord>>(BASE, input)
  return data.data
}

export async function fetchBill(id: string): Promise<BillDetail> {
  const { data } = await api.get<ApiEnvelope<BillDetail>>(`${BASE}/${id}`)
  return data.data
}

export async function updateBill(args: { id: string; input: Partial<BillInput> }): Promise<BillRecord> {
  const { data } = await api.patch<ApiEnvelope<BillRecord>>(`${BASE}/${args.id}`, args.input)
  return data.data
}

export async function deleteBill(id: string): Promise<{ billNumber: string; released: number }> {
  const { data } = await api.delete<ApiEnvelope<{ billNumber: string; released: number }>>(`${BASE}/${id}`)
  return data.data
}

/**
 * Trip DO rows the bill could take. Shorter than the shared timeout, because it
 * runs while somebody is typing — a late answer is one they have typed past.
 */
export async function fetchBillCandidates(id: string, q: string): Promise<BillCandidates> {
  const { data } = await api.get<ApiEnvelope<BillCandidates>>(`${BASE}/${id}/candidates`, {
    params: q ? { q } : {},
    timeout: 30_000,
  })
  return data.data
}

export async function addBillLines(args: { id: string; rowIds: string[] }): Promise<AddBillLinesResult> {
  const { data } = await api.post<ApiEnvelope<AddBillLinesResult>>(`${BASE}/${args.id}/lines`, {
    rowIds: args.rowIds,
  })
  return data.data
}

export async function removeBillLines(args: {
  id: string
  lineIds: string[]
}): Promise<{ billNumber: string; removed: number }> {
  const { data } = await api.post<ApiEnvelope<{ billNumber: string; removed: number }>>(
    `${BASE}/${args.id}/lines/remove`,
    { lineIds: args.lineIds },
  )
  return data.data
}

export async function refreshBill(id: string): Promise<{ billNumber: string; updated: number; removed: number }> {
  const { data } = await api.post<ApiEnvelope<{ billNumber: string; updated: number; removed: number }>>(
    `${BASE}/${id}/refresh`,
  )
  return data.data
}

export async function finalizeBill(id: string): Promise<BillRecord> {
  const { data } = await api.post<ApiEnvelope<BillRecord>>(`${BASE}/${id}/finalize`)
  return data.data
}

export async function reopenBill(id: string): Promise<BillRecord> {
  const { data } = await api.post<ApiEnvelope<BillRecord>>(`${BASE}/${id}/reopen`)
  return data.data
}

/** Longer than the shared timeout: a cold instance builds the whole workbook first. */
const EXPORT_TIMEOUT = 120_000

export async function exportBill(id: string): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await api.get<Blob>(`${BASE}/${id}/export`, {
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT,
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition'], 'bill.xlsx'),
    }
  } catch (error) {
    throw await withBlobMessage(error)
  }
}
