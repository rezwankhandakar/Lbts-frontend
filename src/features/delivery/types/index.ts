import type { UserRole } from '@/lib/roles'
import type {
  DocumentStatus,
  DriverStatus,
  VehicleOwnershipType,
  VehicleStatus,
  VendorStatus,
} from '@/features/vendor/types'
import type {
  CarryingKind,
  CartParty,
  DeliveryOutcome,
  LineChange,
  StoredTripChallan,
  TripChallanPayload,
  TripStatus,
} from '../lib/cart'

/**
 * Mirrors `LBTS-Backend/src/modules/delivery/delivery.constants.ts` and the
 * delivery serializer, and adds nothing but what a browser needs. Change one,
 * change both.
 *
 * The cart's own shapes live in `../lib/cart.ts`, which `node --test` loads
 * without the `@/` alias, and are re-exported from here — the alias-free file
 * owns the value.
 */

export type {
  CandidateTripRef,
  CarryingKind,
  ChallanChange,
  CartChallan,
  CartLine,
  CartOverage,
  CartParty,
  CartState,
  CartSummary,
  ChallanCandidate,
  ChallanLocation,
  DeliveryOutcome,
  LineAllocation,
  LineChange,
  ProductTally,
  ProductTallyRow,
  StoredTripChallan,
  TripChallanPayload,
  TripStatus,
} from '../lib/cart'

/**
 * Two states, and neither is a button. A trip is `Open` until every challan on
 * it has its signed copy in, and `Completed` after — see `TRIP_STATUSES` in
 * `delivery.constants.ts`, where the reasoning lives.
 */
export const TRIP_STATUSES = ['Open', 'Completed'] as const

export const DELIVERY_OUTCOMES = ['Pending', 'Complete'] as const

/** Mirrors `COMPLETION_METHODS`: why a delivery counts as complete. */
export const COMPLETION_METHODS = ['SignedCopy', 'Returned', 'CopyMissing'] as const
export type CompletionMethod = (typeof COMPLETION_METHODS)[number]

export const MAX_COPY_MISSING_REASON = 300

export const CARRYING_KINDS = ['Vehicle', 'Labour'] as const

/** Mirrors `MAX_CARRYING_ENTRIES` and `MAX_FLOOR`. */
export const MAX_CARRYING_ENTRIES = 12
export const MAX_FLOOR = 200

/** Mirrors `MAX_TRIP_CHARGE`: the ceiling on a trip's rent or labour bill. */
export const MAX_TRIP_CHARGE = 10_000_000

/** A trip's rent and labour bill; `null` is "not entered yet". */
export interface TripBillPayload {
  tripRent: number | null
  labourBill: number | null
}

/**
 * Only a trip still waiting on a signature can be edited or deleted. Once
 * every receiver has signed, the trip happened.
 */
export function tripIsEditable(status: TripStatus): boolean {
  return status === 'Open'
}

// --- Permissions -----------------------------------------------------------

/**
 * Mirrors `delivery.constants.ts`. `Vendor` is out and every other role is in
 * both sets; `MANAGE_ANY` equalling `WRITE` is what puts the ownership scope
 * away, so a trip is no longer anybody's private work.
 */
export const DELIVERY_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const DELIVERY_WRITE_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const DELIVERY_MANAGE_ANY_ROLES: readonly UserRole[] = [
  'Admin',
  'Manager',
  'CEO',
  'OpEx',
]

export function canReadDeliveries(role: UserRole | null): boolean {
  return role !== null && DELIVERY_READ_ROLES.includes(role)
}

export function canWriteDeliveries(role: UserRole | null): boolean {
  return role !== null && DELIVERY_WRITE_ROLES.includes(role)
}

/**
 * Whether this viewer may change this trip: its author, or Admin and Manager.
 * The same rule `assertCanChangeTrip` enforces — this only decides which
 * buttons are drawn.
 */
export function canChangeTrip(
  role: UserRole | null,
  currentUserId: string | null,
  trip: { createdBy: { id: string } | null },
): boolean {
  if (role === null || !DELIVERY_WRITE_ROLES.includes(role)) {
    return false
  }
  return DELIVERY_MANAGE_ANY_ROLES.includes(role) || trip.createdBy?.id === currentUserId
}

// --- The workspace's lookups -----------------------------------------------

export interface TripDriverRef {
  id: string
  driverCode: string
  name: string
  mobile: string
  photoUrl: string | null
  licenseNumber: string
  licenseExpiry: string | null
  licenceStatus: DocumentStatus | null
  licencePhrase: string | null
  status: DriverStatus
  /** Null when this driver may take a trip; otherwise why not. */
  blocker: string | null
}

export interface TripVendorRef {
  id: string
  vendorCode: string
  name: string
  mobile: string
  status: VendorStatus
}

export interface TripVehicleRef {
  id: string
  vehicleCode: string
  registrationNo: string
  brand: string
  model: string
  photoUrl: string | null
  ownershipType: VehicleOwnershipType
  status: VehicleStatus
  documents: { total: number; expiringSoon: number; expired: number }
}

export type PlateMatch = 'exact' | 'tail' | 'contains'

export interface TripVehicleOption {
  vehicle: TripVehicleRef
  vendor: TripVendorRef
  currentDriver: TripDriverRef | null
  openTrips: { id: string; tripNumber: string; status: TripStatus }[]
  match: PlateMatch
  blocker: string | null
}

export interface UnavailableVehicle {
  id: string
  registrationNo: string
  vendorName: string
  reason: string
}

export interface VehicleSearchResult {
  results: TripVehicleOption[]
  unavailable: UnavailableVehicle[]
  unavailableCount: number
}

// --- Trips -----------------------------------------------------------------

export interface ActorRef {
  id: string
  name: string
}

export interface TripLineRecord {
  sourceIndex: number | null
  source: { productName: string; model: string; qty: number } | null
  productName: string
  model: string
  qty: number
  change: LineChange
}

/** One product line that went out and came back. */
export interface ReturnedLineRecord {
  productName: string
  model: string
  qty: number
  reason: string
}

/** Something hired for the last few metres, and what it cost. */
export interface CarryingChargeRecord {
  kind: CarryingKind
  description: string
  amount: number
}

/**
 * The receiver's signed copy.
 *
 * `url` is an **API path**, not something the browser may put in an `src`: the
 * object is private, so it is fetched through axios — the only thing that
 * attaches the Firebase token — and rendered as an object URL the caller then
 * owns and must revoke. The same contract a gate pass scan has.
 */
export interface ReceivedCopyRecord {
  url: string
  mimeType: string
  size: number
  originalName: string
  pageCount: number | null
  uploadedAt: string
}

export interface TripChallanRecord extends StoredTripChallan {
  edited: (keyof CartParty)[]
  lines: TripLineRecord[]
  /** What went out and came back. Released for another trip, never cut. */
  returned: ReturnedLineRecord[]
  returnedQty: number
  /** What actually stayed with the receiver: `totalQty` less what came back. */
  deliveredQty: number
  floorNo: number | null
  carrying: CarryingChargeRecord[]
  carryingTotal: number
  deliveryNote: string
  receivedCopy: ReceivedCopyRecord | null
  /** Derived from the signed copy, never a field anybody sets. */
  outcome: DeliveryOutcome
  /** Signed copy in, returned in full, or its copy declared lost. Null while pending. */
  completionMethod: CompletionMethod | null
  copyMissing: boolean
  copyMissingReason: string
  completedAt: string | null
  completedBy: ActorRef | null
  totalQty: number
  changedLines: number
}

/** What an operator records when a delivery comes back. */
export interface CompletionPayload {
  returned: { lineIndex: number; qty: number; reason: string }[]
  floorNo: number | null
  carrying: CarryingChargeRecord[]
  deliveryNote: string
}

/** Where a scanned signed copy belongs. */
export interface ReceiptScanResult {
  trip: TripRecord
  challanId: string
  challanNumber: string
  otherTrips: { id: string; tripNumber: string; tripDate: string; outcome: DeliveryOutcome }[]
}

/** What a trip held back on a challan for a later one. */
export type ReservedRecord = StoredTripChallan['reserved'][number]

export interface TripRecord {
  id: string
  tripNumber: string
  vendorTripSerial: number
  status: TripStatus
  tripDate: string
  vendor: { id: string; vendorCode: string; name: string; mobile: string }
  vehicle: {
    id: string
    vehicleCode: string
    registrationNo: string
    brand: string
    model: string
    ownershipType: VehicleOwnershipType
  }
  driver: {
    id: string
    driverCode: string
    name: string
    mobile: string
    licenseNumber: string
    licenseExpiry: string | null
  }
  assignedDriver: { id: string; driverCode: string; name: string } | null
  driverIsOverride: boolean
  note: string
  challanCount: number
  totalQty: number
  changedLines: number
  challanPreview: { challanNumber: string; customerName: string }[]
  challans?: TripChallanRecord[]
  /** Derived from the challans: set when the last signed copy came in. */
  completedAt: string | null
  /** Challans on the trip whose signed copy is in. */
  completedChallans: number
  /** Pieces that went out and came back, across the whole trip. */
  returnedQty: number
  /** What the trip actually left with its receivers. */
  deliveredQty: number
  /** Every carrying charge on the trip, added up. */
  carryingTotal: number
  /** The lorry's rent, whole taka. Null until somebody enters it. */
  tripRent: number | null
  /** The loading and unloading bill, whole taka. Null until entered. */
  labourBill: number | null
  billTotal: number
  billUpdatedAt: string | null
  billUpdatedBy: ActorRef | null
  createdBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

/** A line the server refused to over-send without being asked. */
export interface TripOverage {
  challanId: string
  challanNumber: string
  index: number
  productName: string
  model: string
  ordered: number
  onOtherTrips: number
  onThisTrip: number
}

export interface TripPayload {
  vehicleId: string
  driverId: string
  tripDate: string
  note: string
  challans: TripChallanPayload[]
  acknowledgeOverage: boolean
}

/** One challan line, with how much of it has gone out. */
export interface DispatchedLine {
  productName: string
  model: string
  ordered: number
  dispatched: number
  remaining: number
  /** Pieces that went out and came back — still ordered, waiting for a lorry. */
  returned: number
}

/** One product that came back off one trip. */
export interface DispatchReturn {
  tripId: string
  tripNumber: string
  productName: string
  model: string
  qty: number
  reason: string
}

/** A trip carrying a challan, as the challan's own page lists it. */
export interface ChallanTripRef {
  id: string
  tripNumber: string
  status: TripStatus
  tripDate: string
  registrationNo: string
  driverName: string
  /** What this trip left with the receiver — carried, less what came back. */
  qty: number
  /** What went out on this trip and came back. */
  returnedQty: number
  outcome: DeliveryOutcome
}

/** What a trip changed about a challan's goods, from its own line sources. */
export interface DispatchCorrection {
  tripId: string
  tripNumber: string
  productName: string
  model: string
  from: number
  to: number
  /** The model it replaced, when the trip stood a different one in. */
  replaced: string | null
}

/** How much of one challan has gone out, and on which trips. */
export interface ChallanDispatchDetail {
  challanId: string
  status: DispatchStatus
  ordered: number
  dispatched: number
  remaining: number
  lines: DispatchedLine[]
  trips: ChallanTripRef[]
  returns: DispatchReturn[]
  corrections: DispatchCorrection[]
}

/** Mirrors `DISPATCH_STATUSES` in `delivery.constants.ts`. */
export const DISPATCH_STATUSES = ['Pending', 'Partial', 'Dispatched', 'Delivered'] as const
export type DispatchStatus = (typeof DISPATCH_STATUSES)[number]

export interface TripStats {
  total: number
  /** Trips with a challan still waiting for its signed copy. */
  open: number
  /** Trips whose every challan has been signed for. */
  completed: number
  today: number
  todayQty: number
}

export interface TripPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  totalQty?: number
  totalChallans?: number
  /** Trip rents across every matching trip. */
  totalRent?: number
  /** Labour bills across every matching trip. */
  totalLabour?: number
  /** Matching trips with no rent entered yet. */
  blankRent?: number
  /** Matching trips with no labour bill entered yet. */
  blankLabour?: number
}

/** Mirrors `TRIP_BILL_FILTERS`: the trip bill backlog as a list filter. */
export const TRIP_BILL_FILTERS = ['all', 'no-rent', 'no-labour'] as const
export type TripBillFilter = (typeof TRIP_BILL_FILTERS)[number]

export type TripStatusFilter = TripStatus | 'all'

export interface TripListParams {
  page: number
  limit: number
  search: string
  status: TripStatusFilter
  vendorId: string
  from: string
  to: string
  bill: TripBillFilter
}

export type TripFilterPatch = Partial<Omit<TripListParams, 'page' | 'limit'>>

export interface TripListResult {
  records: TripRecord[]
  meta: TripPageMeta
}
