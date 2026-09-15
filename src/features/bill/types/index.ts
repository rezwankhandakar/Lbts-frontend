import type { LocationType } from '@/features/location/types'
import type { Rate } from '@/features/product-rate/types'
import type { RowDeliveryStatus, TripDoRowKind } from '@/features/trip-do/types'
import type { UserRole } from '@/lib/roles'

/**
 * Bills as the client sees them. Mirrors
 * `LBTS-Backend/src/modules/bill/bill.constants.ts` and `bill.serializer.ts`;
 * the backend is the source of truth. Change one, change both.
 */

export const BILL_STATUSES = ['Draft', 'Finalized'] as const
export type BillStatus = (typeof BILL_STATUSES)[number]

/** Whether a challan's or a gate pass's Trip DO rows are on a bill. */
export const BILLING_STATUSES = ['Unbilled', 'Partial', 'Billed'] as const
export type BillingStatus = (typeof BILLING_STATUSES)[number]

/** The billing filter the challan and gate pass lists share. */
export type BillingFilter = 'all' | 'unbilled' | 'partial' | 'billed'

/**
 * Reading bills is everyone who reads the Trip DO sheet; preparing one is
 * everyone who writes it; finalizing and reopening is Admin and Manager. These
 * decide what the UI offers; the API decides what happens.
 */
export const BILL_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const BILL_WRITE_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'OpEx']
export const BILL_REVIEW_ROLES: readonly UserRole[] = ['Admin', 'Manager']

export function canWriteBill(role: UserRole | null): boolean {
  return role !== null && BILL_WRITE_ROLES.includes(role)
}

export function canReviewBill(role: UserRole | null): boolean {
  return role !== null && BILL_REVIEW_ROLES.includes(role)
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export interface ActorRef {
  id: string
  name: string
}

export interface BillRecord {
  id: string
  billNumber: string
  month: number
  year: number
  periodLabel: string
  unit: string
  note: string
  status: BillStatus
  lineCount: number
  tripDoCount: number
  challanCount: number
  totalQty: number
  totalAmount: number
  unpricedLines: number
  finalizedAt: string | null
  finalizedBy: ActorRef | null
  reopenedAt: string | null
  reopenedBy: ActorRef | null
  createdBy: ActorRef | null
  createdAt: string
  updatedBy: ActorRef | null
  updatedAt: string
}

/** Whether the Trip DO sheet row behind a line still says what the line copied. */
export type LineDrift = 'none' | 'changed' | 'missing'

export interface BillLineRecord {
  id: string
  tripDoLineId: string
  challanId: string
  gatePassId: string | null
  sl: number
  /** Rows the SL cell spans on its group's first row; 0 on the rest. */
  slRowSpan: number
  kind: TripDoRowKind
  remarks: string
  challanNumber: string
  challanSlNumber: number
  challanDate: string
  customerName: string
  deliveryAddress: string
  district: string
  thana: string
  locationType: LocationType | null
  receiverMobile: string
  productName: string
  model: string
  capacity: string
  qty: number
  rate: Rate | null
  amount: number | null
  tripDo: string
  tripDate: string
  gatePassNumber: string
  csd: string
  unit: string
  tripNumbers: string[]
  drift: LineDrift
  addedAt: string
  addedBy: ActorRef | null
}

export interface BillDetail {
  bill: BillRecord
  lines: BillLineRecord[]
  drift: { changed: number; missing: number }
}

export interface BillRef {
  billId: string
  billNumber: string
}

export interface BillCandidateRow {
  id: string
  kind: TripDoRowKind
  challanId: string
  challanNumber: string
  challanSlNumber: number
  customerName: string
  district: string
  thana: string
  locationType: LocationType | null
  productName: string
  model: string
  qty: number
  amount: number | null
  deliveryStatus: RowDeliveryStatus
  bill: BillRef | null
}

export interface BillCandidateGroup {
  tripDo: string
  tripDoKey: string
  tripDate: string
  gatePassNumbers: string[]
  csd: string
  unit: string
  unitMatches: boolean
  qty: number
  amount: number
  rows: BillCandidateRow[]
  addableRowIds: string[]
  onThisBill: number
  otherBills: string[]
}

export interface BillCandidates {
  mode: 'search' | 'month'
  groups: BillCandidateGroup[]
  truncated: boolean
}

export type BillStatusFilter = 'all' | BillStatus

export interface BillListParams {
  page: number
  limit: number
  search: string
  /** Null is any year or month. */
  year: number | null
  month: number | null
  unit: string
  status: BillStatusFilter
}

export type BillFilterPatch = Partial<Omit<BillListParams, 'page' | 'limit'>>

export interface BillPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  totalQty: number
  totalAmount: number
  draftBills: number
  finalizedBills: number
}

export interface BillListResult {
  records: BillRecord[]
  meta: BillPageMeta
}

export interface BillInput {
  month: number
  year: number
  unit: string
  note: string
}

export interface AddBillLinesResult {
  billNumber: string
  added: number
  skipped: number
  tripDoCount: number
}
