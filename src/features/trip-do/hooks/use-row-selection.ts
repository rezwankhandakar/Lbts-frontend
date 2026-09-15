import { useCallback, useMemo, useState } from 'react'
import type { TripDoRowRecord } from '../types'

export interface RowSelection {
  selected: TripDoRowRecord[]
  count: number
  qty: number
  isSelected: (id: string) => boolean
  toggle: (row: TripDoRowRecord) => void
  /** Ticks every row given, or unticks them all when they already are. */
  toggleAll: (rows: readonly TripDoRowRecord[]) => void
  clear: () => void
}

/**
 * The rows ticked for a bulk Trip DO.
 *
 * Held as records rather than ids, and kept across pages, because the rows one
 * gate pass covers are rarely all on one page — and the bar at the bottom has
 * to say what is ticked even when those rows have scrolled out of the query.
 */
export function useRowSelection(): RowSelection {
  const [byId, setById] = useState<Map<string, TripDoRowRecord>>(() => new Map())

  const toggle = useCallback((row: TripDoRowRecord) => {
    setById((current) => {
      const next = new Map(current)
      if (next.has(row.id)) {
        next.delete(row.id)
      } else {
        next.set(row.id, row)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback((rows: readonly TripDoRowRecord[]) => {
    setById((current) => {
      const next = new Map(current)
      const everyTicked = rows.length > 0 && rows.every((row) => next.has(row.id))
      for (const row of rows) {
        if (everyTicked) {
          next.delete(row.id)
        } else {
          next.set(row.id, row)
        }
      }
      return next
    })
  }, [])

  const clear = useCallback(() => setById(new Map()), [])
  const isSelected = useCallback((id: string) => byId.has(id), [byId])

  const selected = useMemo(() => [...byId.values()], [byId])
  const qty = useMemo(() => selected.reduce((sum, row) => sum + row.qty, 0), [selected])

  return { selected, count: selected.length, qty, isSelected, toggle, toggleAll, clear }
}
