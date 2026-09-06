/**
 * The `.ts` extension is deliberate and the only runtime import in this file.
 * The frontend test runner is `node --test` over TypeScript with the types
 * stripped, and Node resolves module specifiers literally — so a tested file
 * has to name what it imports the way Node reads it. `allowImportingTsExtensions`
 * in `tsconfig.app.json` is what lets Vite and `tsc` agree with that.
 */
import { checkRangeAgainst, unassignedRanges } from './page-ranges.ts'
import type { ClaimedRange, PageRange, RangeProblem } from './page-ranges.ts'

/**
 * The values transcribed off one challan, and the rows it carries.
 *
 * Declared here rather than in `../types` and re-exported from there, for the
 * same reason `page-ranges.ts` declares its own limits: this file is loaded
 * directly by `node --test`, which resolves modules the way Node does, and
 * `../types` reaches the rest of the app through a `@/` path alias that the
 * test configuration has no way to follow. A tested file imports only what
 * Node can find on its own.
 */

/**
 * One product line on a challan.
 *
 * The field is `model` here and `productModel` in MongoDB — the stored name
 * avoids a collision with Mongoose's own `Document.model()`. The same
 * arrangement Gate Pass uses.
 */
export interface ChallanItem {
  productName: string
  model: string
  qty: number
}

export interface ChallanValues {
  customerName: string
  deliveryAddress: string
  /**
   * The thana and district as transcribed, and both optional.
   *
   * A Walton challan does not always print them. They are stored exactly as
   * typed and the server separately matches them against the Location Master;
   * neither this text nor the absence of it stops a challan being filed.
   */
  thana: string
  district: string
  /**
   * The Location Master row the operator picked, if they picked one.
   *
   * An override rather than a value: the server validates the id against the
   * collection and reads the district, thana and location type off the row it
   * points at. Empty means "you work it out", which is the usual case.
   */
  locationId: string
  receiverMobile: string
  senderMobile: string
  zonePo: string
  /**
   * One row per product on the challan. A Walton challan routinely lists
   * several, so this is an array even when there is only one of them — the
   * shape does not change with the contents.
   */
  items: ChallanItem[]
}

/** What a filed entry keeps of the record it became. */
export interface FiledChallanRef {
  id: string
  challanNumber: string
  slNumber: number
}

/**
 * The processing session: one source PDF, and the challans being cut out of it.
 *
 * This is the state the business rules say must *not* be in the database. An
 * operator opening a 24-page WhatsApp file and working through it produces
 * nothing permanent until they submit; everything before that — which pages
 * belong to which challan, what has been typed so far, which one is on screen
 * — lives here, in memory, and is gone when the tab closes.
 *
 * It is written as pure transitions rather than inside a hook because this is
 * where the awkward decisions are: which challan comes next when one is
 * skipped, what happens to the queue when a range is widened, whether a
 * session with pages left over may be called finished. Those are worth testing
 * without a React renderer in the way.
 */

export type ChallanEntryStatus = 'pending' | 'submitted'

export interface ChallanEntry {
  id: string
  startPage: number
  endPage: number
  status: ChallanEntryStatus
  /** What has been typed so far. Kept per entry, so switching does not lose it. */
  values: ChallanValues | null
  /**
   * The idempotency key for this entry, generated once when the entry is
   * created rather than at submit time.
   *
   * That is the whole point of it: a key made at submit time would be new on
   * every click, and two clicks would be two keys and two challans. Made here,
   * a retried submission of the same entry carries the key the first attempt
   * used, and the server answers with the record it already produced.
   */
  submissionKey: string

  // --- Filled in once it has been filed ---------------------------------
  challanId: string | null
  challanNumber: string | null
  slNumber: number | null
}

export interface ChallanSession {
  entries: ChallanEntry[]
  activeId: string | null
  /** Pages in the source PDF. Fixed for the life of the session. */
  sourcePageCount: number
  /**
   * Pages that are not challans and never will be — a blank sheet, a cover
   * page, a duplicate.
   *
   * Without a way to say so a batch containing one could never be completed,
   * and only a completed batch can be printed as a single document. The
   * alternative would be filing a junk challan, with a serial and a barcode,
   * for a blank page. Marked pages count as accounted for and nothing else:
   * they produce no record, and the marking is reversible.
   */
  skippedPages: number[]
}

/** Enough for a session; these ids never leave the browser. */
export function makeId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().replace(/-/g, '').slice(0, 16)
      : Math.random().toString(36).slice(2, 18)

  return `${prefix}-${random}`
}

export function newEntry(startPage: number, endPage: number): ChallanEntry {
  return {
    id: makeId('entry'),
    startPage,
    endPage,
    status: 'pending',
    values: null,
    submissionKey: makeId('submit'),
    challanId: null,
    challanNumber: null,
    slNumber: null,
  }
}

export function rangesOf(entries: ChallanEntry[]): PageRange[] {
  return entries.map((entry) => ({ startPage: entry.startPage, endPage: entry.endPage }))
}

/** Marked-blank pages as one-page ranges, so they feed the same arithmetic. */
function skippedRangesOf(session: ChallanSession): PageRange[] {
  return session.skippedPages.map((page) => ({ startPage: page, endPage: page }))
}

/**
 * The first page nothing in this session has claimed.
 *
 * What "Add the next challan" starts on, and what a fresh session's first
 * entry starts on. Falls back to the last page rather than to nothing, so the
 * button always produces a usable entry even on a fully assigned file — the
 * operator then adjusts it, or the overlap check tells them there is no room.
 */
export function firstUnassignedPage(session: ChallanSession): number {
  const gaps = unassignedRanges(
    [...rangesOf(session.entries), ...skippedRangesOf(session)],
    session.sourcePageCount,
  )
  return gaps[0]?.startPage ?? Math.max(1, session.sourcePageCount)
}

/**
 * A new session over a freshly opened PDF.
 *
 * It starts with one entry on page 1 rather than empty, because an empty
 * workspace with an "Add a challan" button asks the operator to do a step that
 * has exactly one sensible answer. A single-page first challan is the common
 * case and the range is adjusted in one drag when it is not.
 */
export function startSession(sourcePageCount: number): ChallanSession {
  const first = newEntry(1, Math.min(1, sourcePageCount))
  return { entries: [first], activeId: first.id, sourcePageCount, skippedPages: [] }
}

export function activeEntry(session: ChallanSession): ChallanEntry | null {
  return session.entries.find((entry) => entry.id === session.activeId) ?? null
}

export function selectEntry(session: ChallanSession, id: string): ChallanSession {
  return session.entries.some((entry) => entry.id === id) ? { ...session, activeId: id } : session
}

/**
 * Adds a challan, starting at the first page nothing has taken.
 *
 * The new entry becomes the active one: an operator who pressed "add" is about
 * to type into it, and leaving focus on the previous challan would mean the
 * next paste landed in the wrong record.
 */
export function addEntry(session: ChallanSession): ChallanSession {
  const start = firstUnassignedPage(session)
  const entry = newEntry(start, start)

  return { ...session, entries: [...session.entries, entry], activeId: entry.id }
}

/**
 * Moves an entry's page range.
 *
 * A submitted entry is left alone: its pages are already inside a document in
 * R2, and changing the number here would make the queue disagree with what was
 * filed. Correcting a filed challan's range is not an edit — it is a delete
 * and a resubmission, because the pages themselves are what changed.
 */
export function setRange(session: ChallanSession, id: string, range: PageRange): ChallanSession {
  return {
    ...session,
    entries: session.entries.map((entry) =>
      entry.id === id && entry.status === 'pending'
        ? { ...entry, startPage: range.startPage, endPage: range.endPage }
        : entry,
    ),
  }
}

/** Keeps what has been typed, so switching between challans loses nothing. */
export function setValues(
  session: ChallanSession,
  id: string,
  values: ChallanValues | null,
): ChallanSession {
  return {
    ...session,
    entries: session.entries.map((entry) => (entry.id === id ? { ...entry, values } : entry)),
  }
}

/**
 * The next challan to work on after finishing the one at `index`.
 *
 * Searches forward and wraps, so an entry skipped early in the stack is
 * reached again rather than stranded behind the operator. The same rule the
 * Gate Pass scan tray uses, and for the same reason. Null when nothing is
 * left.
 */
export function nextPendingAfter(entries: ChallanEntry[], index: number): string | null {
  const order = [...entries.slice(index + 1), ...entries.slice(0, index + 1)]
  return order.find((entry) => entry.status === 'pending')?.id ?? null
}

/**
 * Marks an entry filed and moves on.
 *
 * Marking and advancing happen in one transition rather than two, or a render
 * lands between them showing a finished challan as though it were still the
 * job in hand.
 *
 * When nothing is left pending but the file still has unclaimed pages, a fresh
 * entry is opened on the first of them — which is the loop the operator is
 * actually in: file this one, and the next one is already waiting on the next
 * page. A fully assigned file adds nothing, and the session is complete.
 */
export function markSubmitted(
  session: ChallanSession,
  id: string,
  record: FiledChallanRef,
): ChallanSession {
  const index = session.entries.findIndex((entry) => entry.id === id)
  if (index === -1) {
    return session
  }

  const entries = session.entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          status: 'submitted' as const,
          challanId: record.id,
          challanNumber: record.challanNumber,
          slNumber: record.slNumber,
        }
      : entry,
  )

  const next = nextPendingAfter(entries, index)
  if (next) {
    return { ...session, entries, activeId: next }
  }

  // Nothing else is queued, so open one on the next page nobody has spoken
  // for — filed or marked blank.
  return openNextIfIdle({ ...session, entries, activeId: null })
}

/**
 * Drops a challan that has not been filed.
 *
 * A submitted one cannot be removed here: it is a permanent record now, and
 * removing it is a delete against the API rather than a change to a queue.
 */
export function removeEntry(session: ChallanSession, id: string): ChallanSession {
  const target = session.entries.find((entry) => entry.id === id)
  if (!target || target.status === 'submitted') {
    return session
  }

  const entries = session.entries.filter((entry) => entry.id !== id)

  return {
    ...session,
    entries,
    activeId:
      session.activeId === id
        ? (entries.find((entry) => entry.status === 'pending')?.id ?? null)
        : session.activeId,
  }
}

export interface SessionProgress {
  total: number
  submitted: number
  pending: number
  assignedPages: number
  unassignedPages: number
  unassigned: PageRange[]
  /** 0-100 over pages, which is the only quantity both sides agree on. */
  percent: number
  /** Every page of the source belongs to a submitted challan. */
  isComplete: boolean
  /** More than one challan in play, which is what shows the queue. */
  isBatch: boolean
}

/**
 * Where the session has got to.
 *
 * Progress is measured over pages that have been **submitted**, not over
 * entries that exist: an operator who has drawn fifteen ranges and filed two
 * of them is two challans in, not fifteen. That is also what makes the
 * completion test honest — the session is finished when every page of the file
 * belongs to something permanent.
 */
export function progressOf(session: ChallanSession): SessionProgress {
  const submitted = session.entries.filter((entry) => entry.status === 'submitted')

  /**
   * Filed *and* marked-blank pages both count as accounted for. That is the
   * same definition the server uses for whether a batch is complete, so the
   * bar here and the batch status there can never disagree.
   */
  const unassigned = unassignedRanges(
    [...rangesOf(submitted), ...skippedRangesOf(session)],
    session.sourcePageCount,
  )
  const unassignedPages = unassigned.reduce(
    (total, range) => total + (range.endPage - range.startPage + 1),
    0,
  )
  const assignedPages = Math.max(session.sourcePageCount - unassignedPages, 0)

  return {
    total: session.entries.length,
    submitted: submitted.length,
    pending: session.entries.length - submitted.length,
    assignedPages,
    unassignedPages,
    unassigned,
    percent:
      session.sourcePageCount > 0 ? Math.round((assignedPages / session.sourcePageCount) * 100) : 0,
    isComplete: session.sourcePageCount > 0 && unassignedPages === 0,
    isBatch: session.entries.length > 1,
  }
}

/**
 * Marks an entry's pages as not being a challan, and drops it from the queue.
 *
 * This is what an operator does with the blank sheet that turns up in the
 * middle of a WhatsApp file. The pages become accounted for without becoming a
 * record — no serial, no barcode, no PDF — which is what lets the batch finish
 * and be printed as one document. It is reversible, and the batch page lists
 * exactly which pages were marked.
 *
 * A submitted entry is refused: its pages are inside a filed challan, and
 * calling them blank would make the batch count them twice.
 */
export function skipEntry(session: ChallanSession, id: string): ChallanSession {
  const target = session.entries.find((entry) => entry.id === id)
  if (!target || target.status === 'submitted') {
    return session
  }

  const pages = new Set(session.skippedPages)
  for (let page = target.startPage; page <= target.endPage; page += 1) {
    if (page >= 1 && page <= session.sourcePageCount) {
      pages.add(page)
    }
  }

  return openNextIfIdle({
    ...removeEntry(session, id),
    skippedPages: [...pages].sort((a, b) => a - b),
  })
}

/**
 * Opens a challan on the next unclaimed page when nothing is left to work on.
 *
 * Skipping the only entry in the queue would otherwise leave the workspace
 * with no form at all — and the operator's next move is almost always the
 * challan after the blank page, so it is already waiting.
 */
function openNextIfIdle(session: ChallanSession): ChallanSession {
  if (session.entries.some((entry) => entry.status === 'pending')) {
    return session
  }

  const gaps = unassignedRanges(
    [...rangesOf(session.entries), ...skippedRangesOf(session)],
    session.sourcePageCount,
  )

  if (gaps.length === 0) {
    return { ...session, activeId: null }
  }

  const next = newEntry(gaps[0].startPage, gaps[0].startPage)
  return { ...session, entries: [...session.entries, next], activeId: next.id }
}

/** Unmarks every page, which is how the workspace offers an undo. */
export function clearSkipped(session: ChallanSession): ChallanSession {
  return { ...session, skippedPages: [] }
}

/**
 * Whether one entry's range is usable, against the rest of the session and
 * against whatever the server says is already filed.
 *
 * Both sources matter and neither is enough alone. The session knows about the
 * range being dragged right now, which the server has never heard of; the
 * server knows about a challan filed from this file before a browser crash,
 * which this session has no memory of.
 */
export function checkEntryRange(
  session: ChallanSession,
  entryId: string,
  claimedOnServer: ClaimedRange[] = [],
): RangeProblem | null {
  const entry = session.entries.find((item) => item.id === entryId)
  if (!entry) {
    return null
  }

  const others: ClaimedRange[] = session.entries
    .filter((other) => other.id !== entryId)
    .map((other) => ({
      startPage: other.startPage,
      endPage: other.endPage,
      challanNumber: other.challanNumber ?? labelFor(session, other.id),
    }))

  // A challan filed from this session is in both lists; keeping the server's
  // copy means the message names it by its real challan number.
  const filedHere = new Set(
    session.entries.map((other) => other.challanNumber).filter((value): value is string => !!value),
  )

  const claimed = [
    ...others.filter((other) => !filedHere.has(other.challanNumber)),
    ...claimedOnServer,
  ]

  return checkRangeAgainst(
    { startPage: entry.startPage, endPage: entry.endPage },
    session.sourcePageCount,
    claimed,
  )
}

/** "Challan 03" — what an unfiled entry is called before it has a number. */
export function labelFor(session: ChallanSession, id: string): string {
  const index = session.entries.findIndex((entry) => entry.id === id)
  return index === -1 ? 'Challan' : `Challan ${String(index + 1).padStart(2, '0')}`
}

/**
 * Whether the session holds work that would be lost.
 *
 * Typed values in an unfiled entry are the real cost — the ranges can be drawn
 * again in seconds, and the submitted challans are safe on the server. So an
 * untouched queue does not raise a warning, and one with a half-typed challan
 * in it does.
 */
export function hasUnsavedWork(session: ChallanSession): boolean {
  return session.entries.some((entry) => entry.status === 'pending' && entry.values !== null)
}
