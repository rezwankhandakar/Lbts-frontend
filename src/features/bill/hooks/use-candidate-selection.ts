import { useCallback, useMemo, useState } from 'react'
import type { BillCandidateRow } from '../types'

export interface CandidateSelection {
  ids: string[]
  count: number
  qty: number
  amount: number
  isSelected: (id: string) => boolean
  toggle: (row: BillCandidateRow) => void
  /** Ticks every row given, or unticks them all. */
  setRows: (rows: readonly BillCandidateRow[], selected: boolean) => void
  clear: () => void
}

/**
 * The rows ticked to add. Held as records and kept across searches, because a
 * bill is built Trip DO by Trip DO off a stack of paper — typing the next DO
 * must not untick the last one before it was added.
 */
export function useCandidateSelection(): CandidateSelection {
  const [byId, setById] = useState<Map<string, BillCandidateRow>>(() => new Map())

  const toggle = useCallback((row: BillCandidateRow) => {
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

  const setRows = useCallback((rows: readonly BillCandidateRow[], selected: boolean) => {
    setById((current) => {
      const next = new Map(current)
      for (const row of rows) {
        if (selected) {
          next.set(row.id, row)
        } else {
          next.delete(row.id)
        }
      }
      return next
    })
  }, [])

  const clear = useCallback(() => setById(new Map()), [])
  const isSelected = useCallback((id: string) => byId.has(id), [byId])

  const summary = useMemo(() => {
    const rows = [...byId.values()]
    return {
      ids: rows.map((row) => row.id),
      qty: rows.reduce((sum, row) => sum + row.qty, 0),
      amount: Math.round(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0) * 100) / 100,
    }
  }, [byId])

  return { ...summary, count: summary.ids.length, isSelected, toggle, setRows, clear }
}
