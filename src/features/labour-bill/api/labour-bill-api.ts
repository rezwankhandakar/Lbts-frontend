import { api } from '@/lib/axios'
import { filenameFrom, withBlobMessage } from '@/lib/download-error'
import type {
  LabourBillDetail,
  LabourBillInput,
  LabourBillLinePatch,
  LabourBillLineRecord,
  LabourBillListParams,
  LabourBillListResult,
  LabourBillPageMeta,
  LabourBillRecord,
  LabourScanResult,
  LabourSignedCopyList,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: LabourBillPageMeta
}

const BASE = '/labour-bills'

/** Empty values and `all` are dropped, which keeps the query cache key minimal. */
function filterParams(params: LabourBillListParams): Record<string, string | number> {
  const result: Record<string, string | number> = { page: params.page, limit: params.limit }
  if (params.search) result.search = params.search
  if (params.year !== null) result.year = params.year
  if (params.month !== null) result.month = params.month
  if (params.status !== 'all') result.status = params.status
  return result
}

export async function fetchLabourBills(
  params: LabourBillListParams,
): Promise<LabourBillListResult> {
  const { data } = await api.get<ApiListEnvelope<LabourBillRecord[]>>(BASE, {
    params: filterParams(params),
  })
  return { records: data.data, meta: data.meta }
}

export async function fetchLabourBillCompanies(): Promise<string[]> {
  const { data } = await api.get<ApiEnvelope<string[]>>(`${BASE}/companies`)
  return data.data
}

export async function createLabourBill(input: LabourBillInput): Promise<LabourBillRecord> {
  const { data } = await api.post<ApiEnvelope<LabourBillRecord>>(BASE, input)
  return data.data
}

export async function fetchLabourBill(id: string): Promise<LabourBillDetail> {
  const { data } = await api.get<ApiEnvelope<LabourBillDetail>>(`${BASE}/${id}`)
  return data.data
}

export async function updateLabourBill(args: {
  id: string
  input: Partial<LabourBillInput>
}): Promise<LabourBillRecord> {
  const { data } = await api.patch<ApiEnvelope<LabourBillRecord>>(`${BASE}/${args.id}`, args.input)
  return data.data
}

export async function deleteLabourBill(
  id: string,
): Promise<{ billNumber: string; removed: number }> {
  const { data } = await api.delete<ApiEnvelope<{ billNumber: string; removed: number }>>(
    `${BASE}/${id}`,
  )
  return data.data
}

/**
 * One barcode read. The answer carries the whole sheet back, because a scan is
 * the one moment the page changes wholesale — a challan of three models adds
 * three rows and moves every total — and a refetch behind it would be a second
 * wait on an instance that may have been asleep.
 */
export async function scanOntoLabourBill(args: {
  id: string
  code: string
}): Promise<LabourScanResult> {
  const { data } = await api.post<ApiEnvelope<LabourScanResult>>(`${BASE}/${args.id}/scan`, {
    code: args.code,
  })
  return data.data
}

export async function updateLabourBillLine(args: {
  id: string
  lineId: string
  patch: LabourBillLinePatch
}): Promise<{ bill: LabourBillRecord; line: LabourBillLineRecord }> {
  const { data } = await api.patch<
    ApiEnvelope<{ bill: LabourBillRecord; line: LabourBillLineRecord }>
  >(`${BASE}/${args.id}/lines/${args.lineId}`, args.patch)
  return data.data
}

export async function removeLabourBillLines(args: {
  id: string
  lineIds: string[]
}): Promise<{ billNumber: string; removed: number }> {
  const { data } = await api.post<ApiEnvelope<{ billNumber: string; removed: number }>>(
    `${BASE}/${args.id}/lines/remove`,
    { lineIds: args.lineIds },
  )
  return data.data
}

export async function refreshLabourBill(
  id: string,
): Promise<{ billNumber: string; updated: number; removed: number }> {
  const { data } = await api.post<
    ApiEnvelope<{ billNumber: string; updated: number; removed: number }>
  >(`${BASE}/${id}/refresh`)
  return data.data
}

export async function finalizeLabourBill(id: string): Promise<LabourBillRecord> {
  const { data } = await api.post<ApiEnvelope<LabourBillRecord>>(`${BASE}/${id}/finalize`)
  return data.data
}

export async function reopenLabourBill(id: string): Promise<LabourBillRecord> {
  const { data } = await api.post<ApiEnvelope<LabourBillRecord>>(`${BASE}/${id}/reopen`)
  return data.data
}

/** Longer than the shared timeout: a cold instance builds the whole workbook first. */
const EXPORT_TIMEOUT = 120_000

export async function exportLabourBill(id: string): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await api.get<Blob>(`${BASE}/${id}/export`, {
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT,
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition'], 'labour-bill.xlsx'),
    }
  } catch (error) {
    throw await withBlobMessage(error)
  }
}

/**
 * Which of the bill's challans have a receiver's signed copy, in the sheet's
 * own sections and SL order.
 *
 * Its own read rather than part of the bill, because it is a fact about trips
 * rather than about the sheet: a copy filed this afternoon changes this answer
 * and nothing about the rows.
 */
export async function fetchLabourBillSignedCopies(id: string): Promise<LabourSignedCopyList> {
  const { data } = await api.get<ApiEnvelope<LabourSignedCopyList>>(`${BASE}/${id}/signed-copies`)
  return data.data
}

/**
 * Those copies as one PDF — the whole bill, or one CSD section of it.
 *
 * The same long timeout the workbook takes: every copy is read out of storage
 * and merged before a byte is sent, and a cold instance has to wake first.
 */
export async function downloadLabourBillSignedCopies(args: {
  id: string
  /** A section key, or undefined for the whole bill. */
  csd?: string
}): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await api.get<Blob>(`${BASE}/${args.id}/signed-copies/download`, {
      params: args.csd === undefined ? undefined : { csd: args.csd },
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT,
    })
    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition'], 'signed-copies.pdf'),
    }
  } catch (error) {
    throw await withBlobMessage(error)
  }
}
