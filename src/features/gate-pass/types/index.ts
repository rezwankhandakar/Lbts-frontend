import type { UserRole } from '@/lib/roles'

/**
 * The Gate Pass API as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/gate-pass/gate-pass.serializer.ts`; the backend is
 * the source of truth. Change one, change both.
 */

export const GATE_PASS_STATUSES = ['Draft', 'Submitted', 'Verified', 'Rejected'] as const
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

/**
 * Whether this user may change this record at all — correct it, replace its
 * scan, or delete it. One rule, because the server applies one rule:
 * `assertCanEdit` and `assertCanDelete` in `gate-pass.access.ts` ask exactly
 * this, and they are the checks that actually decide.
 *
 * Status is deliberately absent. An operator corrects or removes their own
 * work whatever state it has reached, and Admin and Manager do the same for
 * anybody's. What a late correction costs is
 * `needsReverificationAfterEdit`'s business, not a reason to hide the button.
 */
export function canChangeGatePass(
  role: UserRole | null,
  record: { createdBy: ActorRef | null },
  currentUserId: string | null,
): boolean {
  if (!canWriteGatePasses(role)) {
    return false
  }
  return canManageAnyGatePass(role) || record.createdBy?.id === currentUserId
}

/**
 * Statuses carrying a reviewer's verdict about specific content. Correcting
 * one returns it to `Submitted` to be checked again — the server does that on
 * save; this is here so the form can say so before the operator commits.
 * Mirrors `REVERIFY_ON_EDIT_STATUSES` in `gate-pass.constants.ts`.
 */
export const REVERIFY_ON_EDIT_STATUSES: readonly GatePassStatus[] = ['Verified']

export function needsReverificationAfterEdit(status: GatePassStatus): boolean {
  return REVERIFY_ON_EDIT_STATUSES.includes(status)
}

/**
 * Whether the primary action on the entry form files the record or merely
 * saves a correction to one already filed. Submitting a record that has
 * already been submitted is not a legal move, so a correction there is a save.
 */
export function isFiledStatus(status: GatePassStatus): boolean {
  return status === 'Submitted' || status === 'Verified'
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

/**
 * A change to the filters. Never the page or the page size: narrowing a
 * result set always returns to page one, so the two are set together and
 * cannot be patched apart.
 */
export type FilterPatch = Partial<Omit<GatePassListParams, 'page' | 'limit'>>

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  /**
   * Every quantity on every matching record, not just the page on screen.
   * The figure is about the filters rather than the scroll position, so it is
   * summed server-side alongside the count and never added up in the browser
   * from ten rows that are all it ever holds.
   */
  totalQty: number
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
