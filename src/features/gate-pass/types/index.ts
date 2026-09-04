import type { UserRole } from '@/lib/roles'

/**
 * The Gate Pass API as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/gate-pass/gate-pass.serializer.ts`; the backend is
 * the source of truth. Change one, change both.
 */

export const GATE_PASS_STATUSES = [
  'Draft',
  'Submitted',
  'Verified',
  'Rejected',
  'Cancelled',
] as const
export type GatePassStatus = (typeof GATE_PASS_STATUSES)[number]

export const GATE_PASS_REFERENCE_TYPES = ['None', 'Zone', 'PO'] as const
export type GatePassReferenceType = (typeof GATE_PASS_REFERENCE_TYPES)[number]

/**
 * Module permissions, mirroring `gate-pass.constants.ts`. These decide what the
 * UI offers; the API decides what actually happens. Hiding a button is
 * courtesy, and the route that refuses the request is the boundary.
 */
export const GATE_PASS_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const GATE_PASS_WRITE_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'OpEx']
export const GATE_PASS_REVIEW_ROLES: readonly UserRole[] = ['Admin', 'Manager']
export const GATE_PASS_MANAGE_ANY_ROLES: readonly UserRole[] = ['Admin', 'Manager']

export function canReadGatePasses(role: UserRole | null): boolean {
  return role !== null && GATE_PASS_READ_ROLES.includes(role)
}

export function canWriteGatePasses(role: UserRole | null): boolean {
  return role !== null && GATE_PASS_WRITE_ROLES.includes(role)
}

export function canReviewGatePasses(role: UserRole | null): boolean {
  return role !== null && GATE_PASS_REVIEW_ROLES.includes(role)
}

export function canManageAnyGatePass(role: UserRole | null): boolean {
  return role !== null && GATE_PASS_MANAGE_ANY_ROLES.includes(role)
}

/** Content may only be changed while the record is still open. */
export const EDITABLE_GATE_PASS_STATUSES: readonly GatePassStatus[] = ['Draft', 'Rejected']

export function isEditableStatus(status: GatePassStatus): boolean {
  return EDITABLE_GATE_PASS_STATUSES.includes(status)
}

export interface ActorRef {
  id: string
  name: string
}

/**
 * One product line on a gate pass.
 *
 * A challan routinely carries several — the indoor and outdoor halves of an
 * air conditioner arrive as two lines with their own quantities — so this is
 * an array on the record even when there is only one of them.
 */
export interface GatePassItem {
  productName: string
  model: string
  qty: number
}

/** Fields the entry form offers type-ahead for, from what is already on record. */
export const SUGGESTION_FIELDS = ['customerName', 'vehicleNo', 'productName', 'model'] as const
export type SuggestionField = (typeof SUGGESTION_FIELDS)[number]

export interface GatePassDocumentRef {
  /**
   * An API path, not a Cloudflare URL: the document is stored privately and
   * streamed by the API. It cannot be dropped into an `src` attribute, because
   * that request would carry no Authorization header — the viewer fetches it
   * through axios and renders an object URL.
   */
  url: string
  mimeType: string
  size: number
  originalName: string
  uploadedAt: string
  pageCount: number | null
}

export interface GatePassRecord {
  id: string
  gatePassId: string

  tripDo: string
  /** YYYY-MM-DD. A trip date is a calendar day, not an instant. */
  tripDate: string
  csd: string
  unit: string

  customerName: string
  vehicleNo: string

  referenceType: GatePassReferenceType
  zone: string | null
  po: string | null

  /** One line per product on the vehicle; always at least one. */
  items: GatePassItem[]
  /** Every quantity added up, so a list can show one number. */
  totalQty: number

  status: GatePassStatus
  document: GatePassDocumentRef | null

  submittedAt: string | null
  statusChangedAt: string | null
  statusChangedBy: ActorRef | null
  statusNote: string | null

  createdBy: ActorRef | null
  createdAt: string
  updatedBy: ActorRef | null
  updatedAt: string
}

export interface DuplicateCandidate {
  id: string
  gatePassId: string
  tripDo: string
  tripDate: string
  customerName: string
  vehicleNo: string
  /** The first product line, which is enough to recognise the delivery. */
  productName: string
  model: string
  /** How many more lines the record carries beyond the one shown. */
  moreItems: number
  status: GatePassStatus
  matchedOn: 'tripDo' | 'trip'
}

export interface GatePassStats {
  total: number
  draft: number
  submitted: number
  verified: number
  rejected: number
  today: number
}

export type StatusFilter = GatePassStatus | 'all'
export type ReferenceTypeFilter = GatePassReferenceType | 'all'

export interface GatePassListParams {
  page: number
  limit: number
  search: string
  status: StatusFilter
  csd: string
  unit: string
  product: string
  referenceType: ReferenceTypeFilter
  reference: string
  createdBy: string
  from: string
  to: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface GatePassListResult {
  records: GatePassRecord[]
  meta: PageMeta
}

/** The body both create and update send. `tripDate` is YYYY-MM-DD. */
export interface GatePassInput {
  tripDo: string
  tripDate: string
  csd: string
  unit: string
  customerName: string
  vehicleNo: string
  referenceType: GatePassReferenceType
  zone: string
  po: string
  items: GatePassItem[]
}
