import type { UserRole } from '@/lib/roles'

/**
 * The Vendor module as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/vendor/vendor.constants.ts` and
 * `vendor.serializer.ts`; the backend is the source of truth. Change one,
 * change both.
 */

// --- Vocabulary ------------------------------------------------------------

export const VENDOR_STATUSES = ['Pending', 'Active', 'Inactive', 'Suspended'] as const
export type VendorStatus = (typeof VENDOR_STATUSES)[number]

export const VEHICLE_OWNERSHIP_TYPES = ['Vendor Owned', 'Rented'] as const
export type VehicleOwnershipType = (typeof VEHICLE_OWNERSHIP_TYPES)[number]

export const VEHICLE_STATUSES = [
  'Active',
  'Inactive',
  'Under Maintenance',
  'Suspended',
  'Expired',
] as const
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]

export const DRIVER_STATUSES = ['Active', 'Inactive', 'Suspended', 'On Leave'] as const
export type DriverStatus = (typeof DRIVER_STATUSES)[number]

export const ASSIGNMENT_STATUSES = ['Active', 'Ended'] as const
export type AssignmentStatus = (typeof ASSIGNMENT_STATUSES)[number]

export const VEHICLE_DOCUMENT_TYPES = [
  'Registration Certificate',
  'Fitness Certificate',
  'Tax Token',
  'Route Permit',
  'Insurance',
] as const
export const DRIVER_DOCUMENT_TYPES = ['Driving License', 'NID'] as const
export const DOCUMENT_TYPES = [...VEHICLE_DOCUMENT_TYPES, ...DRIVER_DOCUMENT_TYPES] as const
export type VendorDocumentType = (typeof DOCUMENT_TYPES)[number]

export type DocumentOwnerType = 'Vehicle' | 'Driver'

export function documentTypesFor(owner: DocumentOwnerType): readonly VendorDocumentType[] {
  return owner === 'Vehicle' ? VEHICLE_DOCUMENT_TYPES : DRIVER_DOCUMENT_TYPES
}

/**
 * Derived on the server from the expiry date and never stored — which is why
 * no form in this module offers it as a field.
 */
export const DOCUMENT_STATUSES = ['Valid', 'Expiring Soon', 'Expired'] as const
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number]

/** Mirrors `DOCUMENT_EXPIRY_SOON_DAYS`, for wording rather than for arithmetic. */
export const DOCUMENT_EXPIRY_SOON_DAYS = 30

// --- Permissions -----------------------------------------------------------

/**
 * Who the UI offers what. Mirrors `vendor.constants.ts`; the API decides what
 * actually happens, and every one of these is re-checked server-side.
 *
 * `Vendor` is in the read set and in no write set — and unlike every other role
 * its read is *scoped* to one vendor, which is enforced entirely on the server
 * from the account's own profile. Nothing the browser does is load-bearing
 * there; a Vendor user who edits a URL is answered 404 by the API.
 */
export const VENDOR_READ_ROLES: readonly UserRole[] = [
  'Admin',
  'Manager',
  'CEO',
  'OpEx',
  'Vendor',
]
export const VENDOR_MANAGE_ROLES: readonly UserRole[] = ['Admin', 'Manager']

export function canReadVendors(role: UserRole | null): boolean {
  return role !== null && VENDOR_READ_ROLES.includes(role)
}

export function canManageVendors(role: UserRole | null): boolean {
  return role !== null && VENDOR_MANAGE_ROLES.includes(role)
}

/** True for the one role whose view of this module is a single vendor. */
export function isVendorScopedRole(role: UserRole | null): boolean {
  return role === 'Vendor'
}

// --- Records ---------------------------------------------------------------

export interface ActorRef {
  id: string
  name: string
}

export interface VendorCounts {
  vehicles: number
  activeVehicles: number
  drivers: number
  activeDrivers: number
  expiredDocuments: number
  expiringDocuments: number
}

export interface VendorRecord {
  id: string
  vendorCode: string
  name: string
  mobile: string
  address: string
  photoUrl: string | null
  status: VendorStatus
  statusNote: string | null
  statusChangedAt: string | null
  statusChangedBy: ActorRef | null
  /** Present on a list row, absent on a single record — the summary answers it. */
  counts?: VendorCounts
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

export interface VendorOption {
  id: string
  vendorCode: string
  name: string
  status: VendorStatus
}

export interface DocumentTally {
  total: number
  valid: number
  expiringSoon: number
  expired: number
}

export interface CurrentDriverRef {
  assignmentId: string
  driverId: string
  driverCode: string
  name: string
  mobile: string
  assignedFrom: string
}

export interface CurrentVehicleRef {
  assignmentId: string
  vehicleId: string
  vehicleCode: string
  registrationNo: string
  assignedFrom: string
}

export interface VehicleRecord {
  id: string
  vehicleCode: string
  vendorId: string
  registrationNo: string
  brand: string
  model: string
  ownershipType: VehicleOwnershipType
  status: VehicleStatus
  statusNote: string | null
  /** Resolved from the assignment collection, never stored on the vehicle. */
  currentDriver: CurrentDriverRef | null
  documents: DocumentTally
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

export interface DriverRecord {
  id: string
  driverCode: string
  vendorId: string
  name: string
  mobile: string
  photoUrl: string | null
  licenseNumber: string
  licenseExpiry: string | null
  licenceStatus: DocumentStatus | null
  /** "Expires in 12 days", phrased by the server so every surface agrees. */
  licencePhrase: string | null
  status: DriverStatus
  statusNote: string | null
  currentVehicle: CurrentVehicleRef | null
  documents: DocumentTally
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

/**
 * The one driver somebody has opened. The NID and the address are here and not
 * on the list shape, because a table of eighteen drivers has no use for
 * eighteen national ID numbers.
 */
export interface DriverDetail extends DriverRecord {
  nidNumber: string
  address: string
}

export interface AssignmentRecord {
  id: string
  vendorId: string
  vehicle: { id: string; vehicleCode: string; registrationNo: string } | null
  driver: { id: string; driverCode: string; name: string; mobile: string } | null
  assignedFrom: string
  assignedUntil: string | null
  status: AssignmentStatus
  note: string | null
  endedAt: string | null
  endedBy: ActorRef | null
  createdBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

export interface DocumentAttachment {
  mimeType: string
  size: number
  originalName: string
  uploadedAt: string
}

export interface DocumentRecord {
  id: string
  vendorId: string
  ownerType: DocumentOwnerType
  ownerId: string
  ownerLabel: string
  documentType: VendorDocumentType
  documentNumber: string
  issueDate: string | null
  expiryDate: string | null
  status: DocumentStatus
  daysRemaining: number | null
  expiryPhrase: string
  attachment: DocumentAttachment | null
  note: string | null
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

export interface ActivityRecord {
  id: string
  action: string
  entityType: string
  entityId: string | null
  entityLabel: string
  summary: string
  actor: ActorRef | null
  createdAt: string
}

// --- Summary ---------------------------------------------------------------

export interface VehicleSummary {
  total: number
  active: number
  inactive: number
  maintenance: number
  suspended: number
  expired: number
}

export interface DriverSummary {
  total: number
  active: number
  inactive: number
  suspended: number
  onLeave: number
}

export interface ComplianceSummary {
  total: number
  valid: number
  expiringSoon: number
  expired: number
}

/**
 * One thing that wants attention, and where to go about it.
 *
 * `tab` and `filter` are what make an alert actionable rather than an
 * announcement — pressing one lands on the rows it counted rather than on a tab
 * somebody then has to narrow by hand.
 */
export interface ComplianceAlert {
  id: string
  severity: 'critical' | 'warning'
  tab: 'documents' | 'vehicles' | 'drivers'
  filter: Record<string, string>
  title: string
  detail: string
  count: number
}

export interface VendorSummary {
  vehicles: VehicleSummary
  drivers: DriverSummary
  documents: ComplianceSummary
  alerts: ComplianceAlert[]
  moreAlerts: number
  activeAssignments: number
  recentAssignments: AssignmentRecord[]
  expiringDocuments: DocumentRecord[]
  recentActivity: ActivityRecord[]
}

export interface VendorStats {
  total: number
  active: number
  pending: number
  inactive: number
  suspended: number
  vehicles: number
  drivers: number
  expiredDocuments: number
  expiringDocuments: number
}

// --- List parameters -------------------------------------------------------

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type VendorStatusFilter = VendorStatus | 'all'
export type ComplianceFilter = 'all' | 'expired' | 'expiring' | 'clear'
export type VendorSort = 'name' | 'recent' | 'vehicles' | 'drivers'

export interface VendorListParams {
  page: number
  limit: number
  search: string
  status: VendorStatusFilter
  compliance: ComplianceFilter
  sort: VendorSort
}

export type VendorFilterPatch = Partial<Omit<VendorListParams, 'page' | 'limit'>>

export interface VehicleListParams {
  page: number
  limit: number
  search: string
  status: VehicleStatus | 'all'
  ownershipType: VehicleOwnershipType | 'all'
  brand: string
}

export type VehicleFilterPatch = Partial<Omit<VehicleListParams, 'page' | 'limit'>>

export interface DriverListParams {
  page: number
  limit: number
  search: string
  status: DriverStatus | 'all'
  licence: 'all' | 'expired' | 'expiring'
}

export type DriverFilterPatch = Partial<Omit<DriverListParams, 'page' | 'limit'>>

export interface AssignmentListParams {
  page: number
  limit: number
  status: AssignmentStatus | 'all'
  vehicleId: string
  driverId: string
  from: string
  to: string
}

export type AssignmentFilterPatch = Partial<Omit<AssignmentListParams, 'page' | 'limit'>>

export interface DocumentListParams {
  page: number
  limit: number
  ownerType: DocumentOwnerType | 'all'
  ownerId: string
  documentType: VendorDocumentType | 'all'
  status: DocumentStatus | 'all'
  search: string
}

export type DocumentFilterPatch = Partial<Omit<DocumentListParams, 'page' | 'limit'>>

export interface ListResult<T> {
  records: T[]
  meta: PageMeta
}

/** What removing a vendor actually did — see `removeVendor` on the server. */
export interface VendorRemoval {
  id: string
  deactivated: boolean
  vehicles: number
  drivers: number
  assignments: number
  linkedUsers: number
}

/** The tabs on the details page, in the order they are drawn. */
export const VENDOR_TABS = [
  'overview',
  'vehicles',
  'drivers',
  'assignments',
  'documents',
  'activity',
] as const
export type VendorTab = (typeof VENDOR_TABS)[number]

export function isVendorTab(value: string): value is VendorTab {
  return (VENDOR_TABS as readonly string[]).includes(value)
}
