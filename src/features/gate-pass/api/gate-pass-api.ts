import { api } from '@/lib/axios'
import type { ApiError, ApiErrorSource } from '@/lib/axios'
import type {
  DuplicateCandidate,
  GatePassInput,
  GatePassListParams,
  GatePassListResult,
  GatePassRecord,
  GatePassStats,
  GatePassStatus,
  PageMeta,
  SuggestionField,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: PageMeta
}

const BASE = '/gate-passes'

/**
 * What narrows the list, as query parameters. Shared by the list and the
 * export so a downloaded file can never describe a different set of records
 * from the one on screen. Empty values and `all` are dropped rather than sent,
 * so the request URL — and therefore the query cache key — stays minimal.
 */
function filterParams(params: GatePassListParams): Record<string, string> {
  return {
    ...(params.search ? { search: params.search } : {}),
    ...(params.status !== 'all' ? { status: params.status } : {}),
    ...(params.csd ? { csd: params.csd } : {}),
    ...(params.unit ? { unit: params.unit } : {}),
    ...(params.product ? { product: params.product } : {}),
    ...(params.referenceType !== 'all' ? { referenceType: params.referenceType } : {}),
    ...(params.reference ? { reference: params.reference } : {}),
    ...(params.createdBy ? { createdBy: params.createdBy } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  }
}

/** Filtering and pagination are server-side; see `filterParams`. */
export async function fetchGatePasses(params: GatePassListParams): Promise<GatePassListResult> {
  const { data } = await api.get<ApiListEnvelope<GatePassRecord[]>>(BASE, {
    params: {
      page: params.page,
      limit: params.limit,
      ...filterParams(params),
    },
  })

  return { records: data.data, meta: data.meta }
}

export interface GatePassExportFile {
  blob: Blob
  filename: string
}

/**
 * A cold instance has to wake, read every matching record and build a
 * workbook before the first byte arrives, which is longer than the shared
 * 60-second timeout allows for.
 */
const EXPORT_TIMEOUT = 120_000

/**
 * The current filters, as a spreadsheet.
 *
 * Bytes rather than JSON, so this goes through axios for the same reason the
 * scanned document does: the endpoint is authenticated and only the request
 * interceptor attaches the Firebase token. The page number is deliberately not
 * sent — an export of page one of four would be a trap.
 */
export async function exportGatePasses(params: GatePassListParams): Promise<GatePassExportFile> {
  try {
    const response = await api.get<Blob>(`${BASE}/export`, {
      params: filterParams(params),
      responseType: 'blob',
      timeout: EXPORT_TIMEOUT,
    })

    return {
      blob: response.data,
      filename: filenameFrom(response.headers['content-disposition']),
    }
  } catch (error) {
    throw await withBlobMessage(error)
  }
}

/** The name the server chose, or a plain one if the header is unreadable. */
function filenameFrom(disposition: unknown): string {
  const match =
    typeof disposition === 'string' ? /filename="?([^"';]+)"?/.exec(disposition) : null
  return match?.[1]?.trim() || 'gate-passes.xlsx'
}

/**
 * Recovers the message from a failed download.
 *
 * A request that asked for a blob gets a blob back even when the server
 * answered with an error, so the interceptor — which reads `data.message` —
 * finds nothing and falls back to "Request failed with status code 400". The
 * body really is JSON; it just arrived in the wrong wrapper, and the operator
 * needs to read "that is 8,000 gate passes, narrow the filters" rather than a
 * status code.
 */
async function withBlobMessage(error: unknown): Promise<unknown> {
  if (typeof error !== 'object' || error === null) {
    return error
  }

  const apiError = error as ApiError
  if (!(apiError.body instanceof Blob)) {
    return error
  }

  try {
    const parsed = JSON.parse(await apiError.body.text()) as {
      message?: string
      errorSources?: ApiErrorSource[]
    }

    return {
      ...apiError,
      message: parsed.message ?? apiError.message,
      errorSources: parsed.errorSources ?? [],
      body: parsed,
    } satisfies ApiError
  } catch {
    // Not JSON after all — an empty body, or a proxy's own error page.
    return error
  }
}

export async function fetchGatePass(id: string): Promise<GatePassRecord> {
  const { data } = await api.get<ApiEnvelope<GatePassRecord>>(`${BASE}/${id}`)
  return data.data
}

export async function fetchGatePassStats(): Promise<GatePassStats> {
  const { data } = await api.get<ApiEnvelope<GatePassStats>>(`${BASE}/stats`)
  return data.data
}

export async function createGatePass(input: GatePassInput): Promise<GatePassRecord> {
  const { data } = await api.post<ApiEnvelope<GatePassRecord>>(BASE, input)
  return data.data
}

export interface UpdateGatePassArgs {
  id: string
  input: GatePassInput
}

export async function updateGatePass({ id, input }: UpdateGatePassArgs): Promise<GatePassRecord> {
  const { data } = await api.patch<ApiEnvelope<GatePassRecord>>(`${BASE}/${id}`, input)
  return data.data
}

export interface DuplicateProbe {
  tripDo: string
  tripDate: string
  vehicleNo: string
  model: string
  excludeId?: string
}

export async function fetchDuplicates(probe: DuplicateProbe): Promise<DuplicateCandidate[]> {
  const { data } = await api.get<ApiEnvelope<DuplicateCandidate[]>>(`${BASE}/duplicates`, {
    params: {
      ...(probe.tripDo ? { tripDo: probe.tripDo } : {}),
      ...(probe.tripDate ? { tripDate: probe.tripDate } : {}),
      ...(probe.vehicleNo ? { vehicleNo: probe.vehicleNo } : {}),
      ...(probe.model ? { model: probe.model } : {}),
      ...(probe.excludeId ? { excludeId: probe.excludeId } : {}),
    },
  })
  return data.data
}

/**
 * A rejected submission that carries duplicate candidates.
 *
 * The API answers a possible duplicate with a 409 and the matching records,
 * because it is a question rather than a failure. The axios interceptor
 * normalises every rejection to ApiError and drops unknown fields, so this
 * narrows the raw body back out — see `submitGatePass`.
 */
export interface DuplicateRejection {
  message: string
  duplicates: DuplicateCandidate[]
}

export class DuplicateSubmissionError extends Error {
  public readonly duplicates: DuplicateCandidate[]

  constructor(rejection: DuplicateRejection) {
    super(rejection.message)
    this.name = 'DuplicateSubmissionError'
    this.duplicates = rejection.duplicates
  }
}

export interface SubmitGatePassArgs {
  id: string
  /** The operator confirming they have looked at the matching records. */
  acknowledgeDuplicate?: boolean
}

export async function submitGatePass({
  id,
  acknowledgeDuplicate = false,
}: SubmitGatePassArgs): Promise<GatePassRecord> {
  try {
    const { data } = await api.post<ApiEnvelope<GatePassRecord>>(`${BASE}/${id}/submit`, {
      acknowledgeDuplicate,
    })
    return data.data
  } catch (error) {
    const duplicates = duplicatesFrom(error)
    if (duplicates) {
      throw new DuplicateSubmissionError({
        message: (error as ApiError).message,
        duplicates,
      })
    }
    throw error
  }
}

/**
 * Narrows the raw 409 body back out.
 *
 * `ApiError` carries the response body precisely so an endpoint like this one
 * can read what it knows is there. The narrowing lives here, in the feature
 * that owns the endpoint, rather than in lib/axios — nothing else in the app
 * has any business knowing what a duplicate looks like.
 */
function duplicatesFrom(error: unknown): DuplicateCandidate[] | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  const apiError = error as Partial<ApiError>
  if (apiError.statusCode !== 409 || typeof apiError.body !== 'object' || apiError.body === null) {
    return null
  }

  const duplicates = (apiError.body as { duplicates?: unknown }).duplicates
  return Array.isArray(duplicates) ? (duplicates as DuplicateCandidate[]) : null
}

export interface ReviewGatePassArgs {
  id: string
  status: Extract<GatePassStatus, 'Verified' | 'Rejected'>
  note?: string
}

export async function reviewGatePass({
  id,
  status,
  note,
}: ReviewGatePassArgs): Promise<GatePassRecord> {
  const { data } = await api.post<ApiEnvelope<GatePassRecord>>(`${BASE}/${id}/review`, {
    status,
    ...(note ? { note } : {}),
  })
  return data.data
}

export interface UploadDocumentArgs {
  id: string
  file: File
  /** Only ever a real count, from the scanner agent. Never guessed. */
  pageCount?: number | null
  onProgress?: (percent: number) => void
}

export async function uploadGatePassDocument({
  id,
  file,
  pageCount,
  onProgress,
}: UploadDocumentArgs): Promise<GatePassRecord> {
  const formData = new FormData()
  formData.append('document', file)
  if (pageCount && pageCount > 1) {
    formData.append('pageCount', String(pageCount))
  }

  const { data } = await api.post<ApiEnvelope<GatePassRecord>>(`${BASE}/${id}/document`, formData, {
    /**
     * The shared instance defaults to application/json, and axios reads that
     * default before the adapter runs: left in place it would serialise the
     * FormData to JSON and the upload would arrive with no file at all. The
     * browser replaces this value with one carrying the real boundary.
     */
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) {
        return
      }
      // Held below 100 until the response lands: bytes sent is not the same as
      // the server having stored them.
      onProgress(Math.min(99, Math.round((event.loaded * 100) / event.total)))
    },
  })

  return data.data
}

/**
 * The scanned document, as bytes.
 *
 * It has to come through axios rather than an `<img src>`: the endpoint is
 * authenticated, and only the request interceptor attaches the Firebase token.
 * The caller owns the blob and is responsible for revoking the object URL it
 * makes from it.
 */
export async function fetchGatePassDocument(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`${BASE}/${id}/document`, { responseType: 'blob' })
  return data
}

/**
 * Values already on record for one field, for the entry form's type-ahead.
 *
 * The same customers, vehicles and models come back week after week, so
 * offering what has been filed before is both faster to type and the thing
 * that stops one customer being recorded three different ways.
 */
export async function fetchSuggestions(field: SuggestionField, q: string): Promise<string[]> {
  const { data } = await api.get<ApiEnvelope<string[]>>(`${BASE}/suggestions`, {
    params: { field, q },
    // A type-ahead that hangs for a cold start would block the keystroke after
    // it. This one gives up quietly and the operator carries on typing.
    timeout: 12_000,
  })
  return data.data
}

export async function deleteGatePass(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${BASE}/${id}`)
  return data.data
}
