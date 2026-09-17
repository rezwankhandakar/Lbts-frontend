import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { EntryDialogContext } from '../hooks/use-entry-dialog'
import type { EntryDialogRequest } from '../hooks/use-entry-dialog'
import type { EntryRecord } from '../types'
import { EntryDialog } from './entry-dialog'

/**
 * One entry form for the whole module, opened from anywhere inside it.
 *
 * Every page offers the same few actions — add money, pay a vendor, record an
 * expense — often from a row that already knows half the answer. A provider
 * means each of those is one call with a preset, rather than every page
 * mounting its own copy of an eight-kind form.
 */
export function EntryDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<EntryDialogRequest | null>(null)
  // A fresh key per opening, so every form mounts clean with its own submission key.
  const [opening, setOpening] = useState(0)

  const open = useCallback((next: EntryDialogRequest) => {
    setRequest(next)
    setOpening((count) => count + 1)
  }, [])

  const edit = useCallback((entry: EntryRecord) => open({ kind: entry.kind, entry }), [open])
  const value = useMemo(() => ({ open, edit }), [open, edit])

  return (
    <EntryDialogContext.Provider value={value}>
      {children}
      <EntryDialog key={opening} request={request} onClose={() => setRequest(null)} />
    </EntryDialogContext.Provider>
  )
}
