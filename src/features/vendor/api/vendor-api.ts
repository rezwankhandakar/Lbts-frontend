import { api } from '@/lib/axios'
import type {
  ActivityRecord,
  AssignmentListParams,
  AssignmentRecord,
  DocumentListParams,
  DocumentOwnerType,
  DocumentRecord,
  DriverDetail,
  DriverListParams,
  DriverRecord,
  DriverStatus,
  ListResult,
  PageMeta,
  VehicleListParams,
  VehicleRecord,
  VehicleStatus,
  VendorDocumentType,
  VendorListParams,
  VendorOption,
  VendorRecord,
  VendorRemoval,
  VendorStats,
  VendorStatus,
  VendorSummary,
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

const VENDORS = '/vendors'
const VEHICLES = '/vehicles'
const DRIVERS = '/drivers'
const ASSIGNMENTS = '/vendor-assignments'
const DOCUMENTS = '/vendor-documents'

/**
 * Empty values and `all` are dropped rather than sent, so the request URL — and
 * therefore the query cache key — stays minimal. The same shape every other
 * list in this app uses.
 */
function clean(params: Record<string, string | number | undefined>): Record<string, string> {
  const result: Record<string, string> = {}

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '' || value === 'all') {
      continue
    }
    result[key] = String(value)
  }

  return result
}

// --- Vendor ----------------------------------------------------------------

export async function fetchVendors(
  params: VendorListParams,
): Promise<ListResult<VendorRecord>> {
  const { data } = await api.get<ApiListEnvelope<VendorRecord[]>>(VENDORS, {
    params: {
      page: params.page,
      limit: params.limit,
      ...clean({
        search: params.search,
        status: params.status,
        compliance: params.compliance,
        sort: params.sort,
      }),
    },
  })

  return { records: data.data, meta: data.meta }
}

export async function fetchVendorStats(): Promise<VendorStats> {
  const { data } = await api.get<ApiEnvelope<VendorStats>>(`${VENDORS}/stats`)
  return data.data
}

export async function fetchVendorOptions(operational = false): Promise<VendorOption[]> {
  const { data } = await api.get<ApiEnvelope<VendorOption[]>>(`${VENDORS}/options`, {
    params: clean({ operational: operational ? 'true' : undefined }),
  })
  return data.data
}

/**
 * The signed-in vendor account's own record.
 *
 * No id anywhere in the request — which is the point. A Vendor user never has
 * to know their own vendor id, and never sends one, so there is nothing for a
 * crafted request to point at: the server reads the link off the profile it
 * loaded from MongoDB.
 */
export async function fetchMyVendor(): Promise<VendorRecord> {
  const { data } = await api.get<ApiEnvelope<VendorRecord>>(`${VENDORS}/me`)
  return data.data
}

export async function fetchVendor(id: string): Promise<VendorRecord> {
  const { data } = await api.get<ApiEnvelope<VendorRecord>>(`${VENDORS}/${id}`)
  return data.data
}

export async function fetchVendorSummary(id: string): Promise<VendorSummary> {
  const { data } = await api.get<ApiEnvelope<VendorSummary>>(`${VENDORS}/${id}/summary`)
  return data.data
}

export async function fetchVendorActivity(id: string, limit = 20): Promise<ActivityRecord[]> {
  const { data } = await api.get<ApiEnvelope<ActivityRecord[]>>(`${VENDORS}/${id}/activity`, {
    params: { limit },
  })
  return data.data
}

export interface VendorInput {
  name: string
  mobile: string
  address: string
}

export async function createVendor(input: VendorInput): Promise<VendorRecord> {
  const { data } = await api.post<ApiEnvelope<VendorRecord>>(VENDORS, input)
  return data.data
}

export async function updateVendor({
  id,
  ...changes
}: VendorInput & { id: string }): Promise<VendorRecord> {
  const { data } = await api.patch<ApiEnvelope<VendorRecord>>(`${VENDORS}/${id}`, changes)
  return data.data
}

export interface VendorStatusArgs {
  id: string
  status: VendorStatus
  note?: string
}

export async function changeVendorStatus({
  id,
  status,
  note,
}: VendorStatusArgs): Promise<VendorRecord> {
  const { data } = await api.patch<ApiEnvelope<VendorRecord>>(`${VENDORS}/${id}/status`, {
    status,
    ...(note ? { note } : {}),
  })
  return data.data
}

export async function deleteVendor(id: string): Promise<VendorRemoval> {
  const { data } = await api.delete<ApiEnvelope<VendorRemoval>>(`${VENDORS}/${id}`)
  return data.data
}

/**
 * A photo upload.
 *
 * The Content-Type header is deliberately not set: the browser has to add the
 * multipart boundary itself, and naming the type by hand produces a body the
 * parser cannot read. The shared instance sends `application/json`, so it is
 * cleared rather than overridden.
 */
const MULTIPART = { headers: { 'Content-Type': undefined } } as const

export async function uploadVendorPhoto(id: string, file: File): Promise<VendorRecord> {
  const body = new FormData()
  body.append('photo', file)

  const { data } = await api.post<ApiEnvelope<VendorRecord>>(
    `${VENDORS}/${id}/photo`,
    body,
    MULTIPART,
  )
  return data.data
}

export async function removeVendorPhoto(id: string): Promise<VendorRecord> {
  const { data } = await api.delete<ApiEnvelope<VendorRecord>>(`${VENDORS}/${id}/photo`)
  return data.data
}

// --- Vehicles --------------------------------------------------------------

export async function fetchVehicles(
  vendorId: string,
  params: VehicleListParams,
): Promise<ListResult<VehicleRecord>> {
  const { data } = await api.get<ApiListEnvelope<VehicleRecord[]>>(
    `${VENDORS}/${vendorId}/vehicles`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        ...clean({
          search: params.search,
          status: params.status,
          ownershipType: params.ownershipType,
          brand: params.brand,
        }),
      },
    },
  )

  return { records: data.data, meta: data.meta }
}

/** The vehicles an assignment may actually name — active ones only. */
export async function fetchAssignableVehicles(vendorId: string): Promise<VehicleRecord[]> {
  const { data } = await api.get<ApiEnvelope<VehicleRecord[]>>(
    `${VENDORS}/${vendorId}/vehicles/assignable`,
  )
  return data.data
}

export async function fetchVehicle(id: string): Promise<VehicleRecord> {
  const { data } = await api.get<ApiEnvelope<VehicleRecord>>(`${VEHICLES}/${id}`)
  return data.data
}

export async function fetchVehicleAssignments(id: string): Promise<AssignmentRecord[]> {
  const { data } = await api.get<ApiEnvelope<AssignmentRecord[]>>(`${VEHICLES}/${id}/assignments`)
  return data.data
}

export async function fetchVehicleDocuments(id: string): Promise<DocumentRecord[]> {
  const { data } = await api.get<ApiEnvelope<DocumentRecord[]>>(`${VEHICLES}/${id}/documents`)
  return data.data
}

export interface VehicleInput {
  registrationNo: string
  brand: string
  model: string
  ownershipType: string
}

export async function createVehicle(
  vendorId: string,
  input: VehicleInput,
): Promise<VehicleRecord> {
  const { data } = await api.post<ApiEnvelope<VehicleRecord>>(
    `${VENDORS}/${vendorId}/vehicles`,
    input,
  )
  return data.data
}

export async function updateVehicle({
  id,
  ...changes
}: VehicleInput & { id: string }): Promise<VehicleRecord> {
  const { data } = await api.patch<ApiEnvelope<VehicleRecord>>(`${VEHICLES}/${id}`, changes)
  return data.data
}

export async function changeVehicleStatus(args: {
  id: string
  status: VehicleStatus
  note?: string
}): Promise<VehicleRecord> {
  const { data } = await api.patch<ApiEnvelope<VehicleRecord>>(`${VEHICLES}/${args.id}/status`, {
    status: args.status,
    ...(args.note ? { note: args.note } : {}),
  })
  return data.data
}

export async function deleteVehicle(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${VEHICLES}/${id}`)
  return data.data
}

// --- Drivers ---------------------------------------------------------------

export async function fetchDrivers(
  vendorId: string,
  params: DriverListParams,
): Promise<ListResult<DriverRecord>> {
  const { data } = await api.get<ApiListEnvelope<DriverRecord[]>>(
    `${VENDORS}/${vendorId}/drivers`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        ...clean({ search: params.search, status: params.status, licence: params.licence }),
      },
    },
  )

  return { records: data.data, meta: data.meta }
}

export async function fetchAssignableDrivers(vendorId: string): Promise<DriverRecord[]> {
  const { data } = await api.get<ApiEnvelope<DriverRecord[]>>(
    `${VENDORS}/${vendorId}/drivers/assignable`,
  )
  return data.data
}

export async function fetchDriver(id: string): Promise<DriverDetail> {
  const { data } = await api.get<ApiEnvelope<DriverDetail>>(`${DRIVERS}/${id}`)
  return data.data
}

export async function fetchDriverAssignments(id: string): Promise<AssignmentRecord[]> {
  const { data } = await api.get<ApiEnvelope<AssignmentRecord[]>>(`${DRIVERS}/${id}/assignments`)
  return data.data
}

export async function fetchDriverDocuments(id: string): Promise<DocumentRecord[]> {
  const { data } = await api.get<ApiEnvelope<DocumentRecord[]>>(`${DRIVERS}/${id}/documents`)
  return data.data
}

export interface DriverInput {
  name: string
  mobile: string
  nidNumber: string
  address: string
  licenseNumber: string
  licenseExpiry: string | null
}

export async function createDriver(vendorId: string, input: DriverInput): Promise<DriverDetail> {
  const { data } = await api.post<ApiEnvelope<DriverDetail>>(
    `${VENDORS}/${vendorId}/drivers`,
    input,
  )
  return data.data
}

export async function updateDriver({
  id,
  ...changes
}: DriverInput & { id: string }): Promise<DriverDetail> {
  const { data } = await api.patch<ApiEnvelope<DriverDetail>>(`${DRIVERS}/${id}`, changes)
  return data.data
}

export async function changeDriverStatus(args: {
  id: string
  status: DriverStatus
  note?: string
}): Promise<DriverDetail> {
  const { data } = await api.patch<ApiEnvelope<DriverDetail>>(`${DRIVERS}/${args.id}/status`, {
    status: args.status,
    ...(args.note ? { note: args.note } : {}),
  })
  return data.data
}

export async function uploadDriverPhoto(id: string, file: File): Promise<DriverDetail> {
  const body = new FormData()
  body.append('photo', file)

  const { data } = await api.post<ApiEnvelope<DriverDetail>>(
    `${DRIVERS}/${id}/photo`,
    body,
    MULTIPART,
  )
  return data.data
}

export async function removeDriverPhoto(id: string): Promise<DriverDetail> {
  const { data } = await api.delete<ApiEnvelope<DriverDetail>>(`${DRIVERS}/${id}/photo`)
  return data.data
}

export async function deleteDriver(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${DRIVERS}/${id}`)
  return data.data
}

// --- Assignments -----------------------------------------------------------

export async function fetchAssignments(
  vendorId: string,
  params: AssignmentListParams,
): Promise<ListResult<AssignmentRecord>> {
  const { data } = await api.get<ApiListEnvelope<AssignmentRecord[]>>(
    `${VENDORS}/${vendorId}/assignments`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        ...clean({
          status: params.status,
          vehicleId: params.vehicleId,
          driverId: params.driverId,
          from: params.from,
          to: params.to,
        }),
      },
    },
  )

  return { records: data.data, meta: data.meta }
}

export interface AssignmentInput {
  vehicleId: string
  driverId: string
  assignedFrom: string
  assignedUntil: string | null
  /**
   * Confirmation rather than permission. A request that would displace a live
   * assignment and does not carry this is refused with the assignment it would
   * have closed, so the dialog can say what is about to happen and ask again.
   */
  replaceActive?: boolean
  note?: string
}

export async function createAssignment(
  vendorId: string,
  input: AssignmentInput,
): Promise<AssignmentRecord> {
  const { data } = await api.post<ApiEnvelope<AssignmentRecord>>(
    `${VENDORS}/${vendorId}/assignments`,
    input,
  )
  return data.data
}

export async function endAssignment(args: {
  id: string
  assignedUntil?: string
  note?: string
}): Promise<AssignmentRecord> {
  const { data } = await api.patch<ApiEnvelope<AssignmentRecord>>(
    `${ASSIGNMENTS}/${args.id}/end`,
    {
      ...(args.assignedUntil ? { assignedUntil: args.assignedUntil } : {}),
      ...(args.note ? { note: args.note } : {}),
    },
  )
  return data.data
}

export async function deleteAssignment(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${ASSIGNMENTS}/${id}`)
  return data.data
}

/**
 * The assignment a 409 was about.
 *
 * `ApiError.body` is deliberately `unknown`, so it is narrowed in the feature
 * that owns the endpoint — the same arrangement `gate-pass-api.ts` uses for a
 * possible duplicate. Nothing else in the app reads this shape.
 */
export function activeAssignmentFrom(body: unknown): AssignmentRecord | null {
  if (typeof body !== 'object' || body === null || !('current' in body)) {
    return null
  }

  const current = (body as { current: unknown }).current

  return typeof current === 'object' && current !== null
    ? (current as AssignmentRecord)
    : null
}

// --- Documents -------------------------------------------------------------

export async function fetchDocuments(
  vendorId: string,
  params: DocumentListParams,
): Promise<ListResult<DocumentRecord>> {
  const { data } = await api.get<ApiListEnvelope<DocumentRecord[]>>(
    `${VENDORS}/${vendorId}/documents`,
    {
      params: {
        page: params.page,
        limit: params.limit,
        ...clean({
          ownerType: params.ownerType,
          ownerId: params.ownerId,
          documentType: params.documentType,
          status: params.status,
          search: params.search,
        }),
      },
    },
  )

  return { records: data.data, meta: data.meta }
}

export interface DocumentInput {
  documentType: VendorDocumentType
  documentNumber: string
  issueDate: string | null
  expiryDate: string | null
  note?: string
  /** Optional: a row may carry its dates before anybody finds the scanner. */
  file?: File | null
}

function documentFormData(input: Partial<DocumentInput>): FormData {
  const body = new FormData()

  if (input.documentType) {
    body.append('documentType', input.documentType)
  }
  if (input.documentNumber !== undefined) {
    body.append('documentNumber', input.documentNumber)
  }
  // Empty rather than omitted: the server reads "" as "no date", which is how a
  // date can be cleared as well as set.
  if (input.issueDate !== undefined) {
    body.append('issueDate', input.issueDate ?? '')
  }
  if (input.expiryDate !== undefined) {
    body.append('expiryDate', input.expiryDate ?? '')
  }
  if (input.note !== undefined) {
    body.append('note', input.note)
  }
  if (input.file) {
    body.append('file', input.file)
  }

  return body
}

export async function createDocument(
  ownerType: DocumentOwnerType,
  ownerId: string,
  input: DocumentInput,
): Promise<DocumentRecord> {
  const base = ownerType === 'Vehicle' ? VEHICLES : DRIVERS

  const { data } = await api.post<ApiEnvelope<DocumentRecord>>(
    `${base}/${ownerId}/documents`,
    documentFormData(input),
    MULTIPART,
  )
  return data.data
}

export async function updateDocument({
  id,
  ...changes
}: Partial<DocumentInput> & { id: string }): Promise<DocumentRecord> {
  const { data } = await api.patch<ApiEnvelope<DocumentRecord>>(
    `${DOCUMENTS}/${id}`,
    documentFormData(changes),
    MULTIPART,
  )
  return data.data
}

export async function deleteDocument(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${DOCUMENTS}/${id}`)
  return data.data
}

/**
 * A document's file, as bytes.
 *
 * Fetched through axios rather than put in an `href`, because the endpoint is
 * authenticated and only axios attaches the Firebase token — the same reason
 * Gate Pass and Challan fetch their documents into a blob. The caller owns the
 * object URL it makes from this and must revoke it.
 */
export async function fetchDocumentFile(id: string): Promise<Blob> {
  const { data } = await api.get<Blob>(`${DOCUMENTS}/${id}/file`, { responseType: 'blob' })
  return data
}
