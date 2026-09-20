import { MULTIPART, api } from '@/lib/axios'
import type { DriverDetail } from '@/features/vendor/types'
import type { DriverInput } from '@/features/vendor/api/vendor-api'
import type {
  ChallanCandidate,
  ChallanDispatchDetail,
  CompletionPayload,
  ReceiptScanResult,
  TripBillPayload,
  TripListParams,
  TripListResult,
  TripOverage,
  TripPageMeta,
  TripPayload,
  TripRecord,
  TripStats,
  TripVehicleOption,
  VehicleSearchResult,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: TripPageMeta
}

const BASE = '/deliveries'

/**
 * Empty values and `all` are dropped rather than sent, so the request URL — and
 * therefore the query cache key — stays minimal. The same shape every list in
 * this app uses.
 */
function filterParams(params: TripListParams): Record<string, string> {
  return {
    ...(params.search ? { search: params.search } : {}),
    ...(params.status !== 'all' ? { status: params.status } : {}),
    ...(params.vendorId ? { vendorId: params.vendorId } : {}),
    ...(params.from ? { from: params.from } : {}),
    ...(params.to ? { to: params.to } : {}),
    ...(params.bill !== 'all' ? { bill: params.bill } : {}),
  }
}

// --- Trips -----------------------------------------------------------------

export async function fetchTrips(params: TripListParams): Promise<TripListResult> {
  const { data } = await api.get<ApiListEnvelope<TripRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })
  return { records: data.data, meta: data.meta }
}

/** `today` is the viewer's own calendar day — a trip date is a day, not an instant. */
export async function fetchTripStats(today: string): Promise<TripStats> {
  const { data } = await api.get<ApiEnvelope<TripStats>>(`${BASE}/stats`, { params: { today } })
  return data.data
}

export async function fetchTrip(id: string): Promise<TripRecord> {
  const { data } = await api.get<ApiEnvelope<TripRecord>>(`${BASE}/${id}`)
  return data.data
}

/**
 * Confirming a trip. The submission key is generated when the workspace opens,
 * not when the button is pressed — a key made at click time would be new on
 * every click, which is exactly the double trip it exists to prevent.
 */
export async function createTrip(
  payload: TripPayload & { submissionKey: string },
): Promise<TripRecord> {
  const { data } = await api.post<ApiEnvelope<TripRecord>>(BASE, payload)
  return data.data
}

export async function updateTrip({
  id,
  ...payload
}: TripPayload & { id: string }): Promise<TripRecord> {
  const { data } = await api.patch<ApiEnvelope<TripRecord>>(`${BASE}/${id}`, payload)
  return data.data
}

// --- Completing a delivery -------------------------------------------------

/**
 * What came back, how far up it went, and what that cost.
 *
 * Deliberately a different call from the signed copy below. This is what
 * somebody types while looking at the returned goods; that is what a scanner
 * produces, and it is the one that completes the delivery. Keeping them apart
 * means a return can be recorded while the copy is still in the van.
 */
export async function saveCompletion(args: {
  tripId: string
  challanId: string
  payload: CompletionPayload
}): Promise<TripRecord> {
  const { data } = await api.patch<ApiEnvelope<TripRecord>>(
    `${BASE}/${args.tripId}/challans/${args.challanId}/completion`,
    args.payload,
  )
  return data.data
}

/**
 * The signed copy, which is what completes the delivery.
 *
 * Multipart, and the page count travels beside the file because only the
 * scanner agent knows how many sheets it fed — a file chosen off a disk sends
 * nothing, and a page count nobody measured is worse than none.
 */
export async function uploadReceivedCopy(args: {
  tripId: string
  challanId: string
  file: Blob
  fileName: string
  pageCount?: number | null
}): Promise<TripRecord> {
  const body = new FormData()
  body.append('document', args.file, args.fileName)
  if (args.pageCount) {
    body.append('pageCount', String(args.pageCount))
  }

  const { data } = await api.post<ApiEnvelope<TripRecord>>(
    `${BASE}/${args.tripId}/challans/${args.challanId}/received-copy`,
    body,
    MULTIPART,
  )
  return data.data
}

/** Taking the signed copy back off, which reopens the delivery. */
export async function removeReceivedCopy(args: {
  tripId: string
  challanId: string
}): Promise<TripRecord> {
  const { data } = await api.delete<ApiEnvelope<TripRecord>>(
    `${BASE}/${args.tripId}/challans/${args.challanId}/received-copy`,
  )
  return data.data
}

/** The trip's rent and labour bill, both sent together. */
export async function saveTripBill(args: {
  tripId: string
  payload: TripBillPayload
}): Promise<TripRecord> {
  const { data } = await api.patch<ApiEnvelope<TripRecord>>(`${BASE}/${args.tripId}/bill`, args.payload)
  return data.data
}

/** The signed copy is lost: complete the delivery without it, with a reason. */
export async function markCopyMissing(args: {
  tripId: string
  challanId: string
  reason: string
}): Promise<TripRecord> {
  const { data } = await api.put<ApiEnvelope<TripRecord>>(
    `${BASE}/${args.tripId}/challans/${args.challanId}/copy-missing`,
    { reason: args.reason },
  )
  return data.data
}

/** Withdrawing the lost-copy mark, which reopens the delivery. */
export async function clearCopyMissing(args: {
  tripId: string
  challanId: string
}): Promise<TripRecord> {
  const { data } = await api.delete<ApiEnvelope<TripRecord>>(
    `${BASE}/${args.tripId}/challans/${args.challanId}/copy-missing`,
  )
  return data.data
}

/**
 * The stored signed copy as bytes.
 *
 * Through axios because the endpoint is authenticated and axios is the only
 * thing that attaches the Firebase token — which is also why the blob it
 * returns has to be turned into an object URL by the caller, who then owns it
 * and must revoke it. The same contract a gate pass scan has.
 */
export async function fetchReceivedCopy(path: string): Promise<Blob> {
  const { data } = await api.get<Blob>(path, { responseType: 'blob' })
  return data
}

/**
 * One barcode read on the deliveries page: which delivery is this signed copy
 * the receipt for?
 *
 * The opposite question to `scanChallan`, which asks what is still to go so a
 * challan can be put on a lorry — two endpoints rather than one, because a
 * scan that meant different things depending on which page was open is exactly
 * the sort of thing somebody discovers at a gate.
 */
export async function scanReceipt(code: string): Promise<ReceiptScanResult> {
  const { data } = await api.get<ApiEnvelope<ReceiptScanResult>>(`${BASE}/receipts/scan`, {
    params: { code },
  })
  return data.data
}

/**
 * One barcode read off a **printed manifest**: which trip is this sheet?
 *
 * The third scan question the module asks, and the third endpoint — the paper
 * in somebody's hand is what says which one is being asked, rather than which
 * page happened to be open. It answers with the whole trip rather than an id,
 * so opening it costs no second round trip on a sleeping instance.
 */
export async function scanTripManifest(code: string): Promise<TripRecord> {
  const { data } = await api.get<ApiEnvelope<TripRecord>>(`${BASE}/trips/scan`, {
    params: { code },
  })
  return data.data
}

export async function deleteTrip(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${BASE}/${id}`)
  return data.data
}

/**
 * The over-allocation question, if that is what a refusal was.
 *
 * A `409` from confirm or update carries `overages` when the trip would take a
 * challan line past what the paper ordered. Narrowed here, in the feature that
 * owns the endpoint, as the Gate Pass and Vendor modules narrow theirs.
 */
export function overagesFrom(body: unknown): TripOverage[] | null {
  if (typeof body !== 'object' || body === null || !('overages' in body)) {
    return null
  }
  const overages = (body as { overages: unknown }).overages
  return Array.isArray(overages) ? (overages as TripOverage[]) : null
}

// --- The workspace's lookups -----------------------------------------------

export async function searchTripVehicles(
  q: string,
  signal?: AbortSignal,
): Promise<VehicleSearchResult> {
  const { data } = await api.get<ApiEnvelope<VehicleSearchResult>>(`${BASE}/vehicles`, {
    params: { q },
    signal,
  })
  return data.data
}

export async function fetchTripVehicle(id: string): Promise<TripVehicleOption> {
  const { data } = await api.get<ApiEnvelope<TripVehicleOption>>(`${BASE}/vehicles/${id}`)
  return data.data
}

export async function searchChallanCandidates(
  q: string,
  excludeTripId?: string,
  signal?: AbortSignal,
): Promise<ChallanCandidate[]> {
  const { data } = await api.get<ApiEnvelope<ChallanCandidate[]>>(`${BASE}/challan-candidates`, {
    params: { q, ...(excludeTripId ? { excludeTripId } : {}) },
    signal,
  })
  return data.data
}

export async function fetchChallanCandidates(
  ids: string[],
  excludeTripId?: string,
): Promise<ChallanCandidate[]> {
  const { data } = await api.get<ApiEnvelope<ChallanCandidate[]>>(`${BASE}/challan-candidates`, {
    params: { ids: ids.join(','), ...(excludeTripId ? { excludeTripId } : {}) },
  })
  return data.data
}

/**
 * How much of one challan has gone out, and on which trips — read by the
 * challan's own page. Addressed by challan because that is what the reader has
 * in front of them; served by Delivery because every word of it is about trips.
 */
export async function fetchChallanDispatch(challanId: string): Promise<ChallanDispatchDetail> {
  const { data } = await api.get<ApiEnvelope<ChallanDispatchDetail>>(
    `${BASE}/by-challan/${challanId}`,
  )
  return data.data
}

export async function scanChallan(code: string, excludeTripId?: string): Promise<ChallanCandidate> {
  const { data } = await api.get<ApiEnvelope<ChallanCandidate>>(
    `${BASE}/challan-candidates/scan`,
    { params: { code, ...(excludeTripId ? { excludeTripId } : {}) } },
  )
  return data.data
}

/**
 * Adding a driver from inside a trip. The body names the vehicle and nothing
 * about a vendor — the server reads the vendor off the vehicle.
 */
export async function createTripDriver(
  input: DriverInput & { vehicleId: string },
): Promise<DriverDetail> {
  const { data } = await api.post<ApiEnvelope<DriverDetail>>(`${BASE}/drivers`, input)
  return data.data
}

export async function uploadTripDriverPhoto(id: string, file: File): Promise<DriverDetail> {
  const body = new FormData()
  body.append('photo', file)

  const { data } = await api.post<ApiEnvelope<DriverDetail>>(`${BASE}/drivers/${id}/photo`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data.data
}
