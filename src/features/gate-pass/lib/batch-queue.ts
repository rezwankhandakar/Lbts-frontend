/**
 * The stack of scanned sheets, as pure state transitions.
 *
 * Separated from the hook that holds it because this is where the awkward
 * decisions live — which sheet comes next when one is skipped, what "finished"
 * means when some were discarded — and those are worth testing without a
 * React renderer in the way.
 */

export type BatchItemStatus = 'pending' | 'draft' | 'submitted' | 'skipped'

export interface BatchItem {
  id: string
  file: File
  /** Pages inside this one file. Only ever a real count from the agent. */
  pageCount: number
  status: BatchItemStatus
  /** The gate pass this sheet became, once it became one. */
  gatePassId: string | null
  recordId: string | null
  /**
   * The sheets this one was joined from, when it was joined from several.
   *
   * Empty for an ordinary sheet, and the only reason it is kept is undo: a
   * challan spanning three pages is joined by eye off a strip of thumbnails,
   * so joining the wrong two is an ordinary mistake and it should cost a click
   * rather than another trip to the scanner.
   */
  parts: BatchItem[]
}

/**
 * The queue and the sheet being worked on are one value, not two.
 *
 * Filing a sheet both marks it and moves to the next one, and those have to
 * happen together or a render lands between them showing a finished sheet as
 * if it were still the current job.
 */
export interface BatchState {
  items: BatchItem[]
  activeId: string | null
}

export const EMPTY_BATCH: BatchState = { items: [], activeId: null }

const HANDLED: BatchItemStatus[] = ['draft', 'submitted', 'skipped']

export function isHandled(item: BatchItem): boolean {
  return HANDLED.includes(item.status)
}

/** Enough for a session; these ids never leave the browser. */
export function makeItemId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export function newItem(file: File, pageCount: number, id = makeItemId()): BatchItem {
  return {
    id,
    file,
    pageCount,
    status: 'pending',
    gatePassId: null,
    recordId: null,
    parts: [],
  }
}

/**
 * The next sheet to work on after finishing the one at `index`.
 *
 * Searches forward and wraps, so a sheet skipped early in the stack is still
 * reached rather than stranded behind the operator. Null when nothing is left.
 */
export function nextPendingAfter(items: BatchItem[], index: number): string | null {
  const order = [...items.slice(index + 1), ...items.slice(0, index + 1)]
  return order.find((item) => item.status === 'pending')?.id ?? null
}

export function addItems(state: BatchState, items: BatchItem[]): BatchState {
  if (items.length === 0) {
    return state
  }

  return {
    items: [...state.items, ...items],
    // A fresh scan is what the operator is looking at, so it takes focus —
    // but only if they are not part-way through an earlier sheet.
    activeId: state.activeId ?? items[0].id,
  }
}

/** Replaces the whole stack with one document — see "these are one gate pass". */
export function replaceWith(item: BatchItem): BatchState {
  return { items: [item], activeId: item.id }
}

/**
 * Whether these sheets may be joined into one gate pass.
 *
 * Two or more, and every one of them still pending. A sheet that has already
 * become a gate pass is not a candidate: folding it into a different document
 * would leave a record pointing at pages it no longer claims, and the record
 * is the thing that has to stay true.
 */
export function canJoin(items: BatchItem[], ids: string[]): boolean {
  const selected = items.filter((item) => ids.includes(item.id))
  return selected.length >= 2 && selected.every((item) => item.status === 'pending')
}

/**
 * Replaces the selected sheets with the one document they were merged into.
 *
 * The merged sheet takes the position of the first one selected, so the stack
 * keeps the order it came off the feeder in, and it becomes the sheet being
 * worked on — joining is something an operator does *about* the challan in
 * front of them.
 *
 * The parts are flattened, so joining a sheet onto an already-joined one still
 * splits back into single sheets rather than into a tree nobody asked for.
 */
export function joinItems(state: BatchState, ids: string[], joined: BatchItem): BatchState {
  if (!canJoin(state.items, ids)) {
    return state
  }

  const selected = state.items.filter((item) => ids.includes(item.id))
  const at = state.items.findIndex((item) => item.id === selected[0].id)
  const rest = state.items.filter((item) => !ids.includes(item.id))
  const parts = selected.flatMap((item) => (item.parts.length > 0 ? item.parts : [item]))

  return {
    // Every item before `at` was unselected, so `rest` still holds all of them
    // in order and splicing at the same index puts the join where the first
    // selected sheet was.
    items: [...rest.slice(0, at), { ...joined, parts }, ...rest.slice(at)],
    activeId: joined.id,
  }
}

/** Undoes a join, putting the original sheets back where the merged one sat. */
export function splitItem(state: BatchState, id: string): BatchState {
  const index = state.items.findIndex((item) => item.id === id)
  const item = index === -1 ? null : state.items[index]

  if (!item || item.parts.length === 0 || item.status !== 'pending') {
    return state
  }

  return {
    items: [...state.items.slice(0, index), ...item.parts, ...state.items.slice(index + 1)],
    activeId: item.parts[0].id,
  }
}

export function select(state: BatchState, id: string): BatchState {
  return { ...state, activeId: id }
}

/** Applies a status to one sheet and moves to the next one still pending. */
function settle(
  state: BatchState,
  id: string,
  change: (item: BatchItem) => BatchItem,
): BatchState {
  const index = state.items.findIndex((item) => item.id === id)
  if (index === -1) {
    return state
  }

  const items = state.items.map((item) => (item.id === id ? change(item) : item))
  return { items, activeId: nextPendingAfter(items, index) }
}

export function markFiled(
  state: BatchState,
  id: string,
  record: { id: string; gatePassId: string },
  submitted: boolean,
): BatchState {
  return settle(state, id, (item) => ({
    ...item,
    status: submitted ? 'submitted' : 'draft',
    gatePassId: record.gatePassId,
    recordId: record.id,
  }))
}

export function skipItem(state: BatchState, id: string): BatchState {
  return settle(state, id, (item) => ({ ...item, status: 'skipped' }))
}

/**
 * Discards several sheets at once.
 *
 * The plural is the real operation and `removeItem` is the one-sheet case of
 * it: sheets are discarded from the same tick-box mode they are joined from,
 * and a feeder that pulled two blank pages is one gesture rather than two.
 */
export function removeItems(state: BatchState, ids: string[]): BatchState {
  const items = state.items.filter((item) => !ids.includes(item.id))

  return {
    items,
    activeId:
      state.activeId !== null && ids.includes(state.activeId)
        ? (items.find((item) => item.status === 'pending')?.id ?? null)
        : state.activeId,
  }
}

export function removeItem(state: BatchState, id: string): BatchState {
  return removeItems(state, [id])
}

export interface BatchProgress {
  total: number
  filed: number
  remaining: number
  /** True once every sheet has been filed or skipped, and there was work. */
  isComplete: boolean
  /** True while more than one sheet is in play, which is what shows the tray. */
  isBatch: boolean
  /**
   * True when any sheet is several sheets joined together.
   *
   * The tray is shown for this as well as for a stack, because joining a whole
   * two-sheet scan leaves exactly one item — and the button that undoes it
   * lives in the tray.
   */
  hasJoined: boolean
}

export function progressOf(items: BatchItem[]): BatchProgress {
  return {
    total: items.length,
    filed: items.filter((item) => item.status === 'draft' || item.status === 'submitted').length,
    remaining: items.filter((item) => item.status === 'pending').length,
    isComplete: items.length > 0 && items.every(isHandled),
    isBatch: items.length > 1,
    hasJoined: items.some((item) => item.parts.length > 0),
  }
}
