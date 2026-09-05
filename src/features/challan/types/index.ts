import type { UserRole } from '@/lib/roles'

/**
 * The Challan API as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/challan/challan.serializer.ts` and
 * `challan.constants.ts`; the backend is the source of truth. Change one,
 * change both.
 */

/**
 * There is no `Draft`, because nothing is written until an operator submits
 * one challan. Unfinished entries live in the browser's workspace session,
 * which is state this app owns and the API has never heard of.
 *
 * `Amended` is a fact rather than a stage: a filed challan that was corrected
 * had its barcode back page and its stored PDF regenerated, and saying so is
 * what keeps "the document matches the record" checkable.
 */
export const CHALLAN_STATUSES = ['Submitted', 'Amended'] as const
export type ChallanStatus = (typeof CHALLAN_STATUSES)[number]

export const CHALLAN_BATCH_STATUSES = ['Processing', 'Completed'] as const
export type ChallanBatchStatus = (typeof CHALLAN_BATCH_STATUSES)[number]

/**
 * Module permissions, mirroring `challan.constants.ts`. These decide what the
 * UI offers; the API decides what actually happens. Hiding a button is
 * courtesy, and the route that refuses the request is the boundary.
 */
export const CHALLAN_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO', 'OpEx']
export const CHALLAN_WRITE_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'OpEx']
export const CHALLAN_MANAGE_ANY_ROLES: readonly UserRole[] = ['Admin', 'Manager']

export function canReadChallans(role: UserRole | null): boolean {
  return role !== null && CHALLAN_READ_ROLES.includes(role)
}

export function canWriteChallans(role: UserRole | null): boolean {
  return role !== null && CHALLAN_WRITE_ROLES.includes(role)
}

export function canManageAnyChallan(role: UserRole | null): boolean {
  return role !== null && CHALLAN_MANAGE_ANY_ROLES.includes(role)
}

/**
 * Whether this user may correct or delete this challan. One rule, because the
 * server applies one rule: `assertCanEdit` and `assertCanDelete` ask exactly
 * this, and they are the checks that decide.
 *
 * Status is deliberately absent. An operator corrects their own work whenever
 * the error is spotted, and Admin and Manager do the same for anybody's. What
 * a late correction costs is a regenerated document, not a refusal.
 */
export function canChangeChallan(
  role: UserRole | null,
  record: { createdBy: ActorRef | null },
  currentUserId: string | null,
): boolean {
  if (!canWriteChallans(role)) {
    return false
  }
  return canManageAnyChallan(role) || record.createdBy?.id === currentUserId
}

/**
 * The two page limits live in `../lib/page-ranges`, which is import-free so
 * that `node --test` can load it, and are re-exported here so the rest of the
 * feature has one place to import module constants from.
 */
export { MAX_CHALLAN_PAGES, MAX_SOURCE_PAGES } from '../lib/page-ranges'

/** Mirrors MAX_CHALLAN_ITEMS in the backend's `challan.constants.ts`. */
export const MAX_CHALLAN_ITEMS = 30

/**
 * The ten transcribed values live in `../lib/challan-session`, which is
 * import-free so that `node --test` can load it, and are re-exported here so
 * the rest of the feature has one place to import the module's types from.
 */
export type { ChallanItem, ChallanValues } from '../lib/challan-session'
import type { ChallanValues } from '../lib/challan-session'
import type { ChallanItem } from '../lib/challan-session'

/** Mirrors MAX_CHALLAN_UPLOAD_BYTES: what one extracted range may weigh. */
export const MAX_CHALLAN_UPLOAD_BYTES = 15 * 1024 * 1024

/**
 * How large a source PDF this workspace will open.
 *
 * Purely a browser limit and deliberately generous: the file never leaves this
 * machine, so the only cost is memory here. It exists to fail fast on a file
 * that would lock the tab up rather than to enforce anything.
 */
export const MAX_SOURCE_FILE_BYTES = 80 * 1024 * 1024

export interface ActorRef {
  id: string
  name: string
}

export interface ChallanDocumentRef {
  /**
   * An API path, not a Cloudflare URL: the document is stored privately and
   * streamed by the API. It cannot be dropped into an `src` attribute, because
   * that request would carry no Authorization header — the viewer fetches it
   * through axios and renders an object URL.
   */
  url: string
  mimeType: 'application/pdf'
  size: number
  /** Front pages plus the one generated back page. */
  pageCount: number
  generatedAt: string
}

export interface ChallanRecord {
  id: string
  slNumber: number
  challanNumber: string
  status: ChallanStatus

  batchId: string
  sourceFileName: string
  sourcePageStart: number
  sourcePageEnd: number
  sourcePageCount: number

  customerName: string
  deliveryAddress: string
  thana: string
  district: string
  receiverMobile: string
  senderMobile: string | null
  zonePo: string | null

  /** One line per product on the challan; always at least one. */
  items: ChallanItem[]
  /** Every quantity added up, so a list can show one number. */
  totalQty: number

  document: ChallanDocumentRef

  createdBy: ActorRef | null
  submittedBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
  submittedAt: string
  amendedAt: string | null
}

export interface PageRange {
  startPage: number
  endPage: number
}

export interface ChallanBatchRecord {
  id: string
  sourceFileName: string
  sourcePageCount: number
  sourceFileSize: number | null
  status: ChallanBatchStatus
  challanCount: number
  /** Filed plus marked-blank: everything the operator has accounted for. */
  assignedPages: number
  unassignedPages: number
  /** Pages the operator said are not challans, in ascending order. */
  skippedPages: number[]
  percent: number
  isComplete: boolean
  completedAt: string | null
  createdBy: ActorRef | null
  createdAt: string
  updatedAt: string
}

export interface ChallanBatchDetail extends ChallanBatchRecord {
  challans: ChallanRecord[]
  /**
   * Pages nobody has accounted for — neither filed nor marked blank. Empty for
   * a finished batch, and the list the batch page asks to have resolved.
   */
  unassignedRanges: PageRange[]
  /** The marked-blank pages, collapsed the same way, so they can be undone. */
  skippedRanges: PageRange[]
}

export interface DuplicateChallanCandidate {
  id: string
  slNumber: number
  challanNumber: string
  customerName: string
  deliveryAddress: string
  receiverMobile: string
  /** The first product line, which is enough to recognise the delivery. */
  product: string
  model: string
  qty: number
  /** How many more lines the record carries beyond the one shown. */
  moreItems: number
  sourceFileName: string
  sourcePageStart: number
  sourcePageEnd: number
  /** Which probe matched, so the dialog can say why it is asking. */
  matchedOn: 'customer' | 'mobile'
}

export interface ChallanStats {
  total: number
  today: number
  totalQty: number
  batchesProcessing: number
  batchesCompleted: number
}

/** Fields the entry form offers type-ahead for, from what is already on record. */
export const CHALLAN_SUGGESTION_FIELDS = [
  'customerName',
  'thana',
  'district',
  'product',
  'model',
  'zonePo',
] as const
export type ChallanSuggestionField = (typeof CHALLAN_SUGGESTION_FIELDS)[number]

export type ChallanStatusFilter = ChallanStatus | 'all'

export interface ChallanListParams {
  page: number
  limit: number
  search: string
  status: ChallanStatusFilter
  district: string
  customer: string
  product: string
  model: string
  zonePo: string
  batchId: string
  createdBy: string
  from: string
  to: string
}

/**
 * A change to the filters. Never the page or the page size: narrowing a result
 * set always returns to page one, so the two are set together and cannot be
 * patched apart.
 */
export type ChallanFilterPatch = Partial<Omit<ChallanListParams, 'page' | 'limit'>>

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  /** Every quantity on every matching record, not just the page on screen. */
  totalQty?: number
}

export interface ChallanListResult {
  records: ChallanRecord[]
  meta: PageMeta
}

export interface ChallanBatchListResult {
  records: ChallanBatchRecord[]
  meta: PageMeta
}

/** Everything one submission carries besides the extracted pages themselves. */
export interface SubmitChallanPayload extends ChallanValues {
  sessionKey: string
  sourceFileName: string
  sourcePageCount: number
  sourcePageStart: number
  sourcePageEnd: number
  submissionKey: string
  acknowledgeDuplicate: boolean
}

/** What the server said about a range, when it was asked. */
export interface PageRangeProblem {
  code: 'not-a-page' | 'reversed' | 'out-of-bounds' | 'too-many-pages' | 'overlap'
  message: string
  conflicts?: (PageRange & { challanNumber: string })[]
}

export interface PageRangeAvailability {
  available: boolean
  problem: PageRangeProblem | null
  claimed: (PageRange & { challanNumber: string })[]
}
