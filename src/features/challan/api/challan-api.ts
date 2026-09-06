import { api } from '@/lib/axios'
import type { ApiError, ApiErrorSource } from '@/lib/axios'
import type {
  ChallanBatchDetail,
  ChallanBatchListResult,
  ChallanBatchRecord,
  ChallanListParams,
  ChallanListResult,
  ChallanRecord,
  ChallanStats,
  ChallanSuggestionField,
  ChallanValues,
  DuplicateChallanCandidate,
  PageMeta,
  PageRangeAvailability,
  PageRangeProblem,
  SubmitChallanPayload,
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

const BASE = '/challans'
const BATCHES = '/challan-batches'

/**
 * What narrows the list, as query parameters. Empty values and `all` are
 * dropped rather than sent, so the request URL — and therefore the query cache
 * key — stays minimal.
 */
function filterParams(params: ChallanListParams): Record<string, string> {
  return {
    ...(params.search ? { search: params.search } : {}),
    ...(params.status !== 'all' ? { status: params.status } : {}),
    ...(params.location !== 'all' ? { location: params.location } : {}),
    ...(params.district ? { district: params.district } : {}),
    ...(params.customer ? { customer: params.customer } : {}),
    ...(params.product ? { product: params.product } : {}),
    ...(params.model ? { model: params.model } : {}),
    ...(params.zonePo ? { zonePo: params.zonePo } : {}),
    ...(params.batchId ? { batchId: params.batchId } : {}),
    ...(params.createdBy ? { createdBy: params.createdBy } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
  }
}

/** Filtering and pagination are server-side; see `filterParams`. */
export async function fetchChallans(params: ChallanListParams): Promise<ChallanListResult> {
  const { data } = await api.get<ApiListEnvelope<ChallanRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })

  return { records: data.data, meta: data.meta }
}

export async function fetchChallan(id: string): Promise<ChallanRecord> {
  const { data } = await api.get<ApiEnvelope<ChallanRecord>>(`${BASE}/${id}`)
  return data.data
}

export async function fetchChallanStats(): Promise<ChallanStats> {
  const { data } = await api.get<ApiEnvelope<ChallanStats>>(`${BASE}/stats`)
  return data.data
}

export async function fetchChallanSuggestions(
  field: ChallanSuggestionField,
  q: string,
): Promise<string[]> {
  const { data } = await api.get<ApiEnvelope<string[]>>(`${BASE}/suggestions`, {
    params: { field, q },
    // A type-ahead that hangs for a cold start would block the keystroke after
    // it. This one gives up quietly and the operator carries on typing.
    timeout: 12_000,
  })
  return data.data
}

export interface DuplicateProbe {
  sessionKey: string
  customerName: string
  receiverMobile: string
  model: string
  excludeId?: string
}

export async function fetchChallanDuplicates(
  probe: DuplicateProbe,
): Promise<DuplicateChallanCandidate[]> {
  const { data } = await api.get<ApiEnvelope<DuplicateChallanCandidate[]>>(`${BASE}/duplicates`, {
    params: {
      ...(probe.sessionKey ? { sessionKey: probe.sessionKey } : {}),
      ...(probe.customerName ? { customerName: probe.customerName } : {}),
      ...(probe.receiverMobile ? { receiverMobile: probe.receiverMobile } : {}),
      ...(probe.model ? { model: probe.model } : {}),
      ...(probe.excludeId ? { excludeId: probe.excludeId } : {}),
    },
  })
  return data.data
}

export interface PageRangeProbe {
  sessionKey: string
  sourcePageCount: number
  sourcePageStart: number
  sourcePageEnd: number
}

/**
 * Whether a page range is still free on the server.
 *
 * The session can see its own overlaps; only the collection knows about a
 * challan filed from this same PDF before a browser crash, or by the operator
 * yesterday. Answered as a 200 with a verdict rather than an error status,
 * because it is a question asked repeatedly while a range is being dragged.
 */
export async function checkPageRange(probe: PageRangeProbe): Promise<PageRangeAvailability> {
  const { data } = await api.get<ApiEnvelope<PageRangeAvailability>>(`${BASE}/page-range`, {
    params: probe,
    timeout: 20_000,
  })
  return data.data
}

// ---------------------------------------------------------------------------
// Submitting
// ---------------------------------------------------------------------------

/**
 * A submission the server refused with a question rather than a fault.
 *
 * The axios interceptor normalises every rejection to `ApiError` and drops the
 * fields it does not know about, so these narrow the raw body back out — in
 * the feature that owns the endpoint, exactly as `gate-pass-api.ts` does.
 * Nothing else in the app has any business knowing what a duplicate looks like.
 */
export class DuplicateChallanError extends Error {
  public readonly duplicates: DuplicateChallanCandidate[]

  constructor(message: string, duplicates: DuplicateChallanCandidate[]) {
    super(message)
    this.name = 'DuplicateChallanError'
    this.duplicates = duplicates
  }
}

export class PageRangeConflictError extends Error {
  public readonly problem: PageRangeProblem

  constructor(message: string, problem: PageRangeProblem) {
    super(message)
    this.name = 'PageRangeConflictError'
    this.problem = problem
  }
}

function bodyOf(error: unknown): Record<string, unknown> | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  const apiError = error as Partial<ApiError>
  if (apiError.statusCode !== 409 || typeof apiError.body !== 'object' || apiError.body === null) {
    return null
  }

  return apiError.body as Record<string, unknown>
}

function narrowSubmissionError(error: unknown): unknown {
  const body = bodyOf(error)
  if (!body) {
    return error
  }

  const message = (error as ApiError).message

  if (Array.isArray(body.duplicates)) {
    return new DuplicateChallanError(message, body.duplicates as DuplicateChallanCandidate[])
  }

  if (typeof body.pageRangeProblem === 'object' && body.pageRangeProblem !== null) {
    return new PageRangeConflictError(message, body.pageRangeProblem as PageRangeProblem)
  }

  return error
}

export interface SubmitChallanArgs {
  payload: SubmitChallanPayload
  /** The pages cut out of the source PDF in the browser — never the whole file. */
  pages: File
  onProgress?: (percent: number) => void
}

/**
 * Files one challan.
 *
 * Multipart, because the values and the extracted pages have to arrive
 * together: the record and its document are created in one server-side
 * operation or not at all, so there is no earlier call to attach a file to.
 *
 * The whole payload is sent as form fields, including the numbers and the
 * booleans — the server coerces them back. That is the cost of putting a file
 * in the same request, and it is cheaper than the alternative, which is a
 * record that exists without its document while a second call is in flight.
 */
export async function submitChallan({
  payload,
  pages,
  onProgress,
}: SubmitChallanArgs): Promise<ChallanRecord> {
  const form = new FormData()
  form.append('pages', pages)

  for (const [key, value] of Object.entries(payload)) {
    /**
     * A multipart body has no notion of an array, and `String(items)` would
     * send the literal text "[object Object]". The product rows therefore
     * travel as one JSON field, which the server's schema unpacks before it
     * validates them — see `jsonArray` in `challan.validation.ts`.
     */
    form.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value))
  }

  try {
    const { data } = await api.post<ApiEnvelope<ChallanRecord>>(BASE, form, {
      /**
       * The shared instance defaults to application/json, and axios reads that
       * default before the adapter runs: left in place it would serialise the
       * FormData to JSON and the submission would arrive with no file at all.
       * The browser replaces this value with one carrying the real boundary.
       */
      headers: { 'Content-Type': 'multipart/form-data' },
      /**
       * Longer than the shared 60 seconds. A cold Render instance has to wake,
       * generate a barcode page, merge a PDF and write it to R2 before it can
       * answer — and a timeout here would leave the operator retrying a
       * submission that had in fact succeeded.
       */
      timeout: 120_000,
      onUploadProgress: (event) => {
        if (!onProgress || !event.total) {
          return
        }
        // Held below 100 until the response lands: bytes sent is not the same
        // as the server having built and stored the document.
        onProgress(Math.min(99, Math.round((event.loaded * 100) / event.total)))
      },
    })

    return data.data
  } catch (error) {
    throw narrowSubmissionError(error)
  }
}

export interface UpdateChallanArgs {
  id: string
  values: ChallanValues
}

export async function updateChallan({ id, values }: UpdateChallanArgs): Promise<ChallanRecord> {
  const { data } = await api.patch<ApiEnvelope<ChallanRecord>>(`${BASE}/${id}`, values, {
    // A correction regenerates the back page and rewrites the stored document,
    // so it costs what a submission costs.
    timeout: 120_000,
  })
  return data.data
}

export interface PrintedArgs {
  id: string
  /** False takes the mark back: it is a claim about a printer, not a fact. */
  printed: boolean
}

/**
 * Records that a challan was sent to a printer, or that it was not after all.
 *
 * Nothing else on a record says whether the paper exists. An operator working
 * through a filed stack, or coming back to a batch the next morning, has no
 * other way to tell which sheets are already on the counter — `Submitted`
 * means filed, not printed.
 */
export async function setChallanPrinted({ id, printed }: PrintedArgs): Promise<ChallanRecord> {
  const { data } = await api.patch<ApiEnvelope<ChallanRecord>>(`${BASE}/${id}/printed`, {
    printed,
  })
  return data.data
}

export interface SetChallanLocationArgs {
  id: string
  /** A Location Master id, or null to clear it back to pending. */
  locationId: string | null
}

/**
 * Sets or clears a filed challan's district and thana.
 *
 * The end of the line for every challan the resolver could not settle. It
 * sends an id and nothing else: the district, thana and location type are all
 * read from the row it points at, server-side, so this request cannot describe
 * a location the master list does not contain.
 *
 * Deliberately cheap, unlike a correction — it does not regenerate the stored
 * PDF. The back page prints the delivery address and the thana and district as
 * transcribed, which a location correction does not touch, so there is nothing
 * on the printed sheet this could make untrue.
 */
export async function setChallanLocation({
  id,
  locationId,
}: SetChallanLocationArgs): Promise<ChallanRecord> {
  const { data } = await api.patch<ApiEnvelope<ChallanRecord>>(`${BASE}/${id}/location`, {
    locationId,
  })
  return data.data
}

export async function deleteChallan(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${BASE}/${id}`)
  return data.data
}

/**
 * The generated challan document, as bytes.
 *
 * It has to come through axios rather than an `<iframe src>`: the endpoint is
 * authenticated, and only the request interceptor attaches the Firebase token.
 * The caller owns the blob and is responsible for revoking the object URL it
 * makes from it.
 */
export async function fetchChallanDocument(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`${BASE}/${id}/document`, { responseType: 'blob' })
  return data
}

// ---------------------------------------------------------------------------
// Batches
// ---------------------------------------------------------------------------

export interface BatchListParams {
  page: number
  limit: number
  status: 'all' | 'Processing' | 'Completed'
  search: string
}

export async function fetchChallanBatches(
  params: BatchListParams,
): Promise<ChallanBatchListResult> {
  const { data } = await api.get<ApiListEnvelope<ChallanBatchRecord[]>>(BATCHES, {
    params: {
      page: params.page,
      limit: params.limit,
      ...(params.status !== 'all' ? { status: params.status } : {}),
      ...(params.search ? { search: params.search } : {}),
    },
  })

  return { records: data.data, meta: data.meta }
}

export async function fetchChallanBatch(id: string): Promise<ChallanBatchDetail> {
  const { data } = await api.get<ApiEnvelope<ChallanBatchDetail>>(`${BATCHES}/${id}`)
  return data.data
}

export interface SkippedPagesArgs {
  batchId: string
  /** The whole list, every time — see the server's schema for why. */
  pages: number[]
}

/**
 * Marks pages of a source PDF as not being challans, or unmarks them.
 *
 * A WhatsApp file occasionally carries a blank sheet or a cover page. Without
 * this the batch could never be completed, and a completed batch is the only
 * one that can be downloaded and printed as a single document — so the
 * operator would have to file a junk challan, with a serial and a barcode, for
 * a blank page.
 */
export async function setBatchSkippedPages({
  batchId,
  pages,
}: SkippedPagesArgs): Promise<ChallanBatchDetail> {
  const { data } = await api.patch<ApiEnvelope<ChallanBatchDetail>>(
    `${BATCHES}/${batchId}/skipped-pages`,
    { pages },
  )
  return data.data
}

export interface BatchPrintedArgs {
  batchId: string
  printed: boolean
}

/**
 * The same for every challan in one batch, which is what follows a batch
 * print: they came out of the printer together because they were printed
 * together, so they are marked in one statement rather than fifteen.
 */
export async function setBatchPrinted({
  batchId,
  printed,
}: BatchPrintedArgs): Promise<ChallanBatchDetail> {
  const { data } = await api.patch<ApiEnvelope<ChallanBatchDetail>>(
    `${BATCHES}/${batchId}/printed`,
    { printed },
  )
  return data.data
}

export interface BatchDownload {
  blob: Blob
  filename: string
}

/**
 * A completed batch as one PDF — the bytes behind both Download and Print.
 *
 * One endpoint for both, because printing a batch and saving one are the same
 * document: the alternative would be a second assembly path that could quietly
 * come to disagree with the first about what a batch contains.
 *
 * The server merges every challan document in source order, which means
 * reading each of them out of R2 first — so this is the slowest request in the
 * module and gets a timeout to match. The server refuses an unfinished batch
 * outright, and that refusal arrives here as JSON inside a blob, which is what
 * `withBlobMessage` recovers.
 */
export async function downloadChallanBatch(id: string): Promise<BatchDownload> {
  try {
    const response = await api.get<Blob>(`${BATCHES}/${id}/download`, {
      responseType: 'blob',
      timeout: 180_000,
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
  const match = typeof disposition === 'string' ? /filename="?([^"';]+)"?/.exec(disposition) : null
  return match?.[1]?.trim() || 'lbts-challan-batch.pdf'
}

/**
 * Recovers the message from a failed download.
 *
 * A request that asked for a blob gets a blob back even when the server
 * answered with an error, so the interceptor — which reads `data.message` —
 * finds nothing and falls back to "Request failed with status code 409". The
 * body really is JSON; it just arrived in the wrong wrapper, and the operator
 * needs to read "three pages have not been filed yet" rather than a status
 * code. The same treatment `gate-pass-api.ts` gives its export.
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
