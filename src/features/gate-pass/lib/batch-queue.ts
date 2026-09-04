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
  return { id, file, pageCount, status: 'pending', gatePassId: null, recordId: null }
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

export function removeItem(state: BatchState, id: string): BatchState {
  const items = state.items.filter((item) => item.id !== id)

  return {
    items,
    activeId:
      state.activeId === id
        ? (items.find((item) => item.status === 'pending')?.id ?? null)
        : state.activeId,
  }
}

export interface BatchProgress {
  total: number
  filed: number
  remaining: number
  /** True once every sheet has been filed or skipped, and there was work. */
  isComplete: boolean
  /** True while more than one sheet is in play, which is what shows the tray. */
  isBatch: boolean
}

export function progressOf(items: BatchItem[]): BatchProgress {
  return {
    total: items.length,
    filed: items.filter((item) => item.status === 'draft' || item.status === 'submitted').length,
    remaining: items.filter((item) => item.status === 'pending').length,
    isComplete: items.length > 0 && items.every(isHandled),
    isBatch: items.length > 1,
  }
}
