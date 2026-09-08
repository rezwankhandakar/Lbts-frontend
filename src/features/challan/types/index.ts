import type { UserRole } from '@/lib/roles'
import { isReviewableLocation } from '@/features/location/types'
import type {
  LocationStatus,
  LocationType,
  ResolvedLocationRef,
} from '@/features/location/types'
import type { Rate } from '@/features/product-rate/types'

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
 * Whether this challan's location is waiting on a person.
 *
 * The union of the two working lists: nothing determined, or something
 * determined by inference that nobody has read. It is what decides whether a
 * row is drawn with a mark and whether it joins the review queue in the
 * dialog, so both answer the same question the `pending` and `review` filters
 * do — one predicate rather than three that could come to disagree.
 */
export function needsLocationAttention(record: {
  locationStatus: LocationStatus
  resolvedLocation: ResolvedLocationRef | null
}): boolean {
  return record.locationStatus === 'Pending' || isReviewableLocation(record.resolvedLocation)
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

/**
 * What one filed product line was charged, and on whose authority.
 *
 * Mirrors `ChallanItemRate` in `challan.serializer.ts`. A reference plus a
 * copy: `masterId` says which row of the rate card answered, and the figures
 * beside it are what that row said at the time — so correcting the card
 * changes what is charged next and never rewrites this.
 */
export interface ChallanItemRate {
  masterId: string
  /** Which column of the card was used, which is the challan's location type. */
  locationType: LocationType
  rate: Rate
  /** This line's charge, tiered arithmetic already done. */
  amount: number
  appliedAt: string
}

/**
 * A product line as it comes back on a filed record.
 *
 * Deliberately a different type from the `ChallanItem` the entry form edits,
 * rather than two optional fields bolted onto one. A form line is three things
 * somebody types; a filed line also carries what the system worked out about
 * it, and neither of those two extra values is ever entered by hand. Keeping
 * them apart is what stops a rate becoming something a form could send.
 */
export interface ChallanRecordItem extends ChallanItem {
  /** The rate card's capacity band, or blank when no row answered. */
  capacity: string
  /**
   * What this line was charged, or null because nothing costed it — a product
   * the rate card does not carry, or a challan whose location is still
   * Pending. Null is ordinary and never blocks anything.
   */
  rate: ChallanItemRate | null
}

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
  /**
   * The thana and district **as they were transcribed**, and possibly blank.
   *
   * Never rewritten by resolution: what the paper said is a fact about the
   * paper, and the generated back page prints it. Where the system decided
   * that actually is, once it could tell, is `resolvedLocation`.
   */
  thana: string
  district: string
  receiverMobile: string
  senderMobile: string | null
  zonePo: string | null

  /**
   * Where this went, matched against the Location Master — or null because
   * nobody has determined it yet.
   *
   * Null is an ordinary state. It never stopped the challan being filed, it
   * never stops it being printed, and an administrator can set it at any
   * point afterwards.
   */
  resolvedLocation: ResolvedLocationRef | null
  /** `Verified` exactly when `resolvedLocation` is set. */
  locationStatus: LocationStatus

  /** One line per product on the challan; always at least one. */
  items: ChallanRecordItem[]
  /** Every quantity added up, so a list can show one number. */
  totalQty: number
  /**
   * Every charged line added up, or null because nothing on this challan could
   * be priced.
   *
   * Null rather than zero, and the distinction is the point: zero is a challan
   * that costs nothing, null is a challan nobody has costed.
   */
  totalAmount: number | null
  /** How many lines carry no rate, so a total never pretends to cover them. */
  unpricedItems: number

  document: ChallanDocumentRef

  createdBy: ActorRef | null
  submittedBy: ActorRef | null
  updatedBy: ActorRef | null
  createdAt: string
  updatedAt: string
  submittedAt: string
  amendedAt: string | null

  /**
   * When this challan was last sent to a printer, or null if nobody has.
   *
   * It records a dispatch rather than a sheet of paper: the browser hands the
   * document to a print dialog and never learns whether Print or Cancel was
   * pressed. So it is a claim, which is why the UI always offers a way to
   * clear it and why nothing is ever refused because of it.
   */
  printedAt: string | null
  printedBy: ActorRef | null
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
  /** How many of this batch's challans have been sent to a printer. */
  printedChallanCount: number
  /** True once every challan in it has. A batch with none is never printed. */
  isPrinted: boolean
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
  /**
   * Where the match was found, so the dialog can say how close it is. Both
   * mean the same four values matched — the customer, the address, the
   * receiver's number and the model — and differ only in scope: `batch` is the
   * source PDF being worked through right now, `recent` is anywhere in the
   * last three months.
   */
  matchedOn: 'batch' | 'recent'
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

/**
 * What state the location is in. Two of the four are working lists.
 *
 * `pending` is "nothing was determined" — the reason leaving a location blank
 * is a workable outcome rather than a record quietly lost. `review` is
 * "something was determined by inference and nobody has read it", which is a
 * different job: not choosing, but agreeing or correcting. A wrong district on
 * a filed challan is invisible to everything downstream, so the second list
 * matters as much as the first.
 */
export type ChallanLocationFilter = 'all' | 'verified' | 'pending' | 'review'

/**
 * What state the charges are in. Mirrors the `amount` filter in
 * `challan.validation.ts`, which reads the stored `chargeStatus`.
 *
 * Two working lists again, and for the same reason the location filter has
 * two: `unpriced` is the rows whose Amount column is a dash, which is at least
 * visibly nothing. `partial` is the quieter one — a figure that looks complete
 * and covers three lines of four — and folding it into the first would bury it
 * under rows that are obviously blank.
 */
export type ChallanAmountFilter = 'all' | 'unpriced' | 'partial'

export interface ChallanListParams {
  page: number
  limit: number
  search: string
  status: ChallanStatusFilter
  location: ChallanLocationFilter
  amount: ChallanAmountFilter
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
  /**
   * Every charge on every matching record, summed by the server for the same
   * reason `totalQty` is: the browser holds one page, so anything added up
   * here would be the total of ten rows pretending to be the total of a month.
   *
   * It is **understated** by any line nothing could price, which is why
   * `unpricedChallans` travels beside it and the toolbar refuses to show one
   * without the other.
   */
  totalAmount?: number
  /** How many matching challans carry a line nobody could price. */
  unpricedChallans?: number
  /**
   * The three backlogs the toolbar draws as chips, counted over the same
   * matching set as the totals beside them — so every figure in that row
   * answers the same question. Each one is also a filter, which is what makes
   * a chip a way in rather than a number to look at.
   */
  blankAmount?: number
  partialAmount?: number
  locationPending?: number
  locationReview?: number
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
  /**
   * The batch being resumed, sent only when this workspace joined one instead
   * of starting it.
   *
   * A resumed session's key is new and names no batch, so without this the
   * second half of a source PDF would open a second batch for a file that
   * already has one. It is a reference the server checks — who may add to that
   * batch, and whether the file is even the same size — never a value it
   * takes on trust.
   */
  batchId?: string
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
