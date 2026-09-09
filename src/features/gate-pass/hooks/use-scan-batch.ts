import { useCallback, useMemo, useState } from 'react'
import {
  EMPTY_BATCH,
  addItems,
  joinItems,
  markFiled as markFiledIn,
  newItem,
  progressOf,
  removeItem,
  removeItems,
  replaceWith as replaceWithItem,
  select as selectIn,
  skipItem,
  splitItem,
} from '../lib/batch-queue'
import type { BatchItem, BatchProgress, BatchState } from '../lib/batch-queue'
import type { ScannedDocument } from '../lib/scanner-agent'

export type { BatchItem, BatchItemStatus } from '../lib/batch-queue'

/**
 * The stack of scanned sheets waiting to be turned into gate passes.
 *
 * This is the shape of the real job. An operator does not scan one challan,
 * type it, walk back to the scanner and scan the next — they put ten sheets in
 * the feeder, take one pass, and then work through the images on screen. So a
 * scan produces a queue, the queue is worked front to back, and every sheet
 * that has been filed is marked so nobody types it twice.
 *
 * A queue of one behaves exactly like the single-document case, which is why
 * there is no mode to switch between.
 *
 * The transitions themselves live in `lib/batch-queue.ts`; this holds them in
 * React and nothing more.
 */
export interface ScanBatch extends BatchProgress {
  items: BatchItem[]
  activeId: string | null
  active: BatchItem | null
  /** Position of the active sheet in the stack, 1-based. 0 when empty. */
  activePosition: number
  add: (documents: ScannedDocument[]) => void
  /** Replaces the whole queue with one document — see `combineLast`. */
  replaceWith: (document: ScannedDocument) => void
  /**
   * Replaces the named sheets with the one document they were merged into.
   *
   * The merging itself is `lib/merge-documents.ts`; the queue is only told
   * what came out of it, so this stays a state transition and nothing else.
   */
  join: (ids: string[], document: ScannedDocument) => void
  /** Undoes a join, putting the original sheets back. */
  split: (id: string) => void
  select: (id: string) => void
  markFiled: (id: string, record: { id: string; gatePassId: string }, submitted: boolean) => void
  skip: (id: string) => void
  remove: (id: string) => void
  /** Discards several sheets at once — the tick-box mode's other verb. */
  removeMany: (ids: string[]) => void
  clear: () => void
}

export function useScanBatch(): ScanBatch {
  const [state, setState] = useState<BatchState>(EMPTY_BATCH)

  const add = useCallback((documents: ScannedDocument[]) => {
    const items = documents.map((document) => newItem(document.file, document.pageCount))
    setState((current) => addItems(current, items))
  }, [])

  const replaceWith = useCallback((document: ScannedDocument) => {
    setState(replaceWithItem(newItem(document.file, document.pageCount)))
  }, [])

  const join = useCallback((ids: string[], document: ScannedDocument) => {
    setState((current) => joinItems(current, ids, newItem(document.file, document.pageCount)))
  }, [])

  const split = useCallback((id: string) => {
    setState((current) => splitItem(current, id))
  }, [])

  const select = useCallback((id: string) => {
    setState((current) => selectIn(current, id))
  }, [])

  const markFiled = useCallback(
    (id: string, record: { id: string; gatePassId: string }, submitted: boolean) => {
      setState((current) => markFiledIn(current, id, record, submitted))
    },
    [],
  )

  const skip = useCallback((id: string) => {
    setState((current) => skipItem(current, id))
  }, [])

  const remove = useCallback((id: string) => {
    setState((current) => removeItem(current, id))
  }, [])

  const removeMany = useCallback((ids: string[]) => {
    setState((current) => removeItems(current, ids))
  }, [])

  const clear = useCallback(() => setState(EMPTY_BATCH), [])

  const { items, activeId } = state

  const active = useMemo(
    () => items.find((item) => item.id === activeId) ?? null,
    [items, activeId],
  )

  return {
    ...progressOf(items),
    items,
    activeId,
    active,
    activePosition: active ? items.indexOf(active) + 1 : 0,
    add,
    replaceWith,
    join,
    split,
    select,
    markFiled,
    skip,
    remove,
    removeMany,
    clear,
  }
}
