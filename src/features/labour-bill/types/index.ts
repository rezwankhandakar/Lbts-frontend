import type { GroupTotals } from '../lib/labour-bill-math'
import type { Translator } from '@/lib/i18n'
import type { UserRole } from '@/lib/roles'

/**
 * The Walton Labour Bill as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/labour-bill/labour-bill.constants.ts` and
 * `labour-bill.serializer.ts`; the backend is the source of truth. Change one,
 * change both.
 *
 * The arithmetic is re-exported from `../lib/labour-bill-math`, which imports
 * nothing so `node --test` can load it. That direction is deliberate — the
 * alias-free file owns the value.
 */

export {
  cellText,
  groupLineIds,
  groupTotalsOf,
  isUnpricedLabourLine,
  labourBillYearOptions,
  lineTotal,
  parseCellInput,
  shortLabourBillNumber,
} from '../lib/labour-bill-math'
export type { CellParse, CellValue, GroupTotals } from '../lib/labour-bill-math'

export const LABOUR_BILL_STATUSES = ['Draft', 'Finalized'] as const
export type LabourBillStatus = (typeof LABOUR_BILL_STATUSES)[number]

/**
 * `Vendor` is out and every other role is in every set: a labour bill charges
 * figures nothing can derive, typed by whoever holds the paper, and it claims
 * no Trip DO row from anybody — which is why it is open where the Excel bill
 * beside it is Admin-only. Mirrors `labour-bill.constants.ts`. These decide
 * what the UI offers; the API decides what happens.
 */
export const LABOUR_BILL_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const LABOUR_BILL_WRITE_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const LABOUR_BILL_REVIEW_ROLES: readonly UserRole[] = [
  'Admin',
  'Manager',
  'CEO',
  'OpEx',
]

export function canWriteLabourBill(role: UserRole | null): boolean {
  return role !== null && LABOUR_BILL_WRITE_ROLES.includes(role)
}

export function canReviewLabourBill(role: UserRole | null): boolean {
  return role !== null && LABOUR_BILL_REVIEW_ROLES.includes(role)
}

/** The ceilings the request schemas enforce; the cells refuse anything past them first. */
export const MAX_LABOUR_AMOUNT = 10_000_000
export const MAX_FLOOR_NUMBER = 200

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

export interface LabourBillRecord {
  id: string
  billNumber: string
  month: number
  year: number
  /** "September 2026" — the whole of what the slot is. */
  periodLabel: string
  /** Seeds the Unit column of a newly scanned row; may be blank. */
  company: string
  note: string
  status: LabourBillStatus
  lineCount: number
  challanCount: number
  totalQty: number
  labourTotal: number
  floorTotal: number
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

/** Whether the Trip DO sheet row behind a labour bill row still says what it copied. */
export type LabourLineDrift = 'none' | 'changed' | 'missing'

export interface LabourBillLineRecord {
  id: string
  tripDoLineId: string
  challanId: string
  gatePassId: string | null
  sl: number
  /** Rows the SL cell spans on its challan's first row; 0 on the rest. */
  slRowSpan: number

  challanNumber: string
  challanSlNumber: number
  challanDate: string
  customerName: string
  deliveryAddress: string
  district: string
  thana: string
  receiverMobile: string
  productName: string
  model: string
  qty: number
  tripDo: string
  tripDate: string | null
  /** The CSD this row files itself under; blank while its Trip DO is unset. */
  csd: string
  gatePassNumber: string
  /** The gate pass's own unit, which seeds the company and stands behind it. */
  unit: string

  /** The Unit column on this sheet: a company name. */
  company: string
  labourAmount: number | null
  floorNo: number | null
  floorAmount: number | null
  total: number | null

  drift: LabourLineDrift
  addedAt: string
  addedBy: ActorRef | null
  updatedAt: string
  updatedBy: ActorRef | null
}

/**
 * One CSD's worth of the month: its own SL series, its own total, and its own
 * worksheet in the export. The pending section is the same shape, holding the
 * rows nothing has matched to a gate pass yet.
 */
export interface LabourCsdGroupRecord {
  csd: string
  key: string
  /** The CSD, or "Trip DO pending". */
  label: string
  isPending: boolean
  /** What this CSD's own bill comes to. */
  totals: GroupTotals
  lines: LabourBillLineRecord[]
}

export interface LabourBillDetail {
  bill: LabourBillRecord
  /** The month split by CSD, in CSD order with pending last. */
  groups: LabourCsdGroupRecord[]
  /** Rows whose sheet row has changed, and rows whose sheet row is gone. */
  drift: { changed: number; missing: number }
  /** Rows still waiting for a Trip DO, so they belong to no CSD yet. */
  pendingLines: number
}

/** What one barcode read did to the bill. */
export interface LabourScanResult {
  billNumber: string
  challanId: string
  challanNumber: string
  challanSlNumber: number
  customerName: string
  added: string[]
  skipped: string[]
  /** The CSDs this scan filed rows under, so the toast can say where they went. */
  csds: string[]
  /** Models with no Trip DO yet, which land in the pending section and wait there. */
  withoutTripDo: string[]
  detail: LabourBillDetail
}

export type LabourBillStatusFilter = 'all' | LabourBillStatus

export interface LabourBillListParams {
  page: number
  limit: number
  search: string
  /** Null is any year or month. */
  year: number | null
  month: number | null
  status: LabourBillStatusFilter
}

export type LabourBillFilterPatch = Partial<Omit<LabourBillListParams, 'page' | 'limit'>>

export interface LabourBillPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  totalQty: number
  labourTotal: number
  floorTotal: number
  totalAmount: number
  unpricedLines: number
  draftBills: number
  finalizedBills: number
}

export interface LabourBillListResult {
  records: LabourBillRecord[]
  meta: LabourBillPageMeta
}

export interface LabourBillInput {
  month: number
  year: number
  company: string
  note: string
}

/** The four cells a row accepts. `null` clears one back to "not typed". */
export interface LabourBillLinePatch {
  company?: string
  labourAmount?: number | null
  floorNo?: number | null
  floorAmount?: number | null
}

/**
 * One receiver's signed copy, as it is filed against one trip. Mirrors
 * `LabourSignedCopyRef` in `labour-bill.copies.ts`; `url` is the authenticated
 * Delivery path the browser fetches through axios, never an object key and
 * never something the browser can put in an `src`.
 */
export interface LabourSignedCopyRef {
  tripId: string
  tripNumber: string
  tripDate: string
  url: string
  mimeType: string
  size: number
  originalName: string
  pageCount: number | null
  uploadedAt: string
}

/** One challan of the bill, and what paper has come back for it. */
export interface LabourSignedCopyChallan {
  challanId: string
  challanNumber: string
  challanSlNumber: number
  customerName: string
  /** The SL it carries in its own section. */
  sl: number
  copies: LabourSignedCopyRef[]
  /** Trips carrying it whose copy has not come back yet. */
  awaiting: number
  declaredMissing: number
  returnedInFull: number
  trips: number
}

/** One CSD section's worth — which is one bill the office sends. */
export interface LabourSignedCopySection {
  key: string
  label: string
  isPending: boolean
  challans: LabourSignedCopyChallan[]
  withCopy: number
  withoutCopy: number
  copyCount: number
}

export interface LabourSignedCopyList {
  billId: string
  billNumber: string
  periodLabel: string
  sections: LabourSignedCopySection[]
  challanCount: number
  withCopy: number
  withoutCopy: number
  copyCount: number
  /** What one download may assemble, so a refusal can be explained before it happens. */
  maxPerDownload: number
}

/**
 * Why a challan has no signed copy, in the Delivery module's own vocabulary —
 * so the sheet says "still on the road" and "declared lost" apart rather than
 * drawing the same blank for both.
 */
export function signedCopyGapOf(challan: LabourSignedCopyChallan, t: Translator): string {
  if (challan.trips === 0) {
    return t('labourBill.copies.noTrip')
  }
  if (challan.awaiting > 0) {
    return t('labourBill.copies.notBack')
  }
  if (challan.declaredMissing > 0) {
    return t('labourBill.copies.declaredLost')
  }
  return t('labourBill.copies.allReturned')
}
