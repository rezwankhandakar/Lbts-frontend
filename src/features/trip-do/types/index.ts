import type { LocationType } from '@/features/location/types'
import type { Rate } from '@/features/product-rate/types'
import type { ColumnFilterValue, ColumnValuesResult } from '@/lib/column-filters'
import type { UserRole } from '@/lib/roles'

/**
 * The Trip DO sheet as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/trip-do/trip-do.constants.ts` and
 * `trip-do.serializer.ts`; the backend is the source of truth. Change one,
 * change both.
 */

/** An order line, pieces that came back off a trip, or pieces a later trip re-sent. */
export const TRIP_DO_ROW_KINDS = ['Order', 'Return', 'Resent'] as const
export type TripDoRowKind = (typeof TRIP_DO_ROW_KINDS)[number]

export const ROW_DELIVERY_STATUSES = [
  'Pending',
  'Partial',
  'Dispatched',
  'Delivered',
  'Returned',
] as const
export type RowDeliveryStatus = (typeof ROW_DELIVERY_STATUSES)[number]

export const GATE_PASS_PRODUCT_STATUSES = [
  'Unlinked',
  'Pending',
  'Returned',
  'Resent',
  'Partial',
  'Dispatched',
  'Delivered',
] as const
export type GatePassProductStatus = (typeof GATE_PASS_PRODUCT_STATUSES)[number]

/**
 * Reading the sheet is everyone who reads challans and gate passes; **changing
 * it is Admin alone**. A Trip DO link is what an Excel bill is built from and
 * what a gate pass line counts its delivered pieces against, so a link set
 * wrongly is money charged to the wrong unit. Mirrors `trip-do.constants.ts`.
 * These decide what the UI offers; the API decides what happens.
 */
export const TRIP_DO_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const TRIP_DO_WRITE_ROLES: readonly UserRole[] = ['Admin']

export function canWriteTripDo(role: UserRole | null): boolean {
  return role !== null && TRIP_DO_WRITE_ROLES.includes(role)
}

export { MAX_SPLIT_PARTS } from '../lib/split-parts'

export interface ActorRef {
  id: string
  name: string
}

export interface TripDoLinkRef {
  gatePassId: string
  gatePassNumber: string
  tripDo: string
  tripDate: string
  csd: string
  unit: string
  /** The gate pass line's model, which may be written differently from the row's. */
  model: string
  linkedAt: string
  linkedBy: ActorRef | null
}

export interface TripDoRowRecord {
  id: string
  challanId: string
  challanNumber: string
  slNumber: number
  date: string
  kind: TripDoRowKind
  tripNumbers: string[]
  deliveryStatus: RowDeliveryStatus
  customerName: string
  deliveryAddress: string
  district: string
  thana: string
  locationType: LocationType | null
  receiverMobile: string
  zonePo: string | null
  productName: string
  model: string
  qty: number
  lineQty: number
  rate: Rate | null
  amount: number | null
  capacity: string
  link: TripDoLinkRef | null
  /** The bill this row is on. A billed row is fixed on the sheet until it is taken off. */
  bill: { billId: string; billNumber: string } | null
  partCount: number
  splitIndex: number
}

/** How well a gate pass line agrees with a row — `trip-do.matching.ts`. */
export type MatchLevel = 'exact' | 'close' | 'different'

/** One gate pass line the picker offers. A gate pass with two close lines is two options. */
export interface GatePassOption {
  /** The gate pass. */
  id: string
  /** The line on it, sent back when linking. */
  lineKey: string
  /** Unique across the list. */
  optionKey: string
  gatePassNumber: string
  tripDo: string
  tripDate: string
  csd: string
  unit: string
  customerName: string
  vehicleNo: string
  status: string
  productName: string
  model: string
  qty: number
  allocatedQty: number
  /** For a return or re-sent row, the whole line — those do not use it up. */
  remainingQty: number
  countsTowardQty: boolean
  modelMatch: MatchLevel
  customerMatch: MatchLevel
  isCurrent: boolean
  /** A return or re-sent row: the Trip DO its order row already has. */
  isOrderTripDo: boolean
}

export interface GatePassLinkedRow {
  id: string
  challanId: string
  challanNumber: string
  slNumber: number
  customerName: string
  district: string
  thana: string
  kind: TripDoRowKind
  qty: number
  deliveryStatus: RowDeliveryStatus
  tripNumbers: string[]
}

export interface GatePassProductLine {
  productName: string
  model: string
  qty: number
  linkedQty: number
  /** Order rows' first delivery, less linked returns, plus linked re-sends. */
  deliveredQty: number
  remainingQty: number
  status: GatePassProductStatus
  rows: GatePassLinkedRow[]
}

export interface GatePassTripDoStatus {
  gatePassId: string
  gatePassNumber: string
  tripDo: string
  status: GatePassProductStatus
  totalQty: number
  linkedQty: number
  lines: GatePassProductLine[]
}

export type TripDoKindFilter = 'all' | TripDoRowKind
export type TripDoLinkFilter = 'all' | 'linked' | 'unlinked'
export type TripDoStatusFilter = 'all' | RowDeliveryStatus
/** Mirrors `TRIP_DO_COLUMN_IDS` in `trip-do.columns.ts`. */
export const TRIP_DO_COLUMN_IDS = [
  'sl',
  'date',
  'trip',
  'status',
  'customer',
  'address',
  'district',
  'thana',
  'location',
  'receiver',
  'zone',
  'product',
  'model',
  'qty',
  'rate',
  'amount',
  'capacity',
  'csd',
  'unit',
  'bill',
  'tripDo',
] as const
export type TripDoColumnId = (typeof TRIP_DO_COLUMN_IDS)[number]

/** One value a column dropdown offers. `null` is `(Blanks)`. */
export type ColumnValue = ColumnFilterValue

/** Ticked values by column. A column absent here is not filtered. */
export type ColumnFilters = Partial<Record<TripDoColumnId, ColumnValue[]>>

export type { ColumnValuesResult }

export interface TripDoListParams {
  page: number
  limit: number
  search: string
  kind: TripDoKindFilter
  link: TripDoLinkFilter
  from: string
  to: string
  columns: ColumnFilters
}

export type TripDoFilterPatch = Partial<Omit<TripDoListParams, 'page' | 'limit'>>

export interface TripDoPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  totalQty: number
  totalAmount: number
  linkedRows: number
  unlinkedRows: number
  linkedQty: number
  unlinkedQty: number
  returnRows: number
  resentRows: number
}

export interface TripDoListResult {
  records: TripDoRowRecord[]
  meta: TripDoPageMeta
}

export interface TripDoLinkResult {
  gatePassNumber: string
  tripDo: string
  csd: string
  unit: string
  qty: number
  remainderQty: number
  rows: number
}

/**
 * What the Trip DO picker is setting: one row, or several ticked rows of one
 * model. A bulk target links every row whole and cannot split.
 */
export interface LinkTarget {
  rowIds: string[]
  /** The row the gate pass options are asked for. */
  anchorRowId: string
  productName: string
  model: string
  qty: number
  /** "LBTS-CH-2026-000012", or "3 rows" for a bulk target. */
  label: string
  currentGatePassId: string | null
  canSplit: boolean
}
