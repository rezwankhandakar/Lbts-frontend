import { createContext, useContext } from 'react'
import type { EntryDraft, EntryKind, EntryRecord } from '../types'

export interface EntryDialogRequest {
  kind: EntryKind
  /** Values the caller already knows — the vendor and month being paid, the advance being settled. */
  preset?: Partial<EntryDraft>
  /** Present to correct a saved entry. */
  entry?: EntryRecord
  /** Fields the caller fixed, shown as a summary rather than a control. */
  locked?: (keyof EntryDraft)[]
  /** How a locked trip reads, since the form has no list to find it in. */
  tripSummary?: { label: string; detail: string }
}

export interface EntryDialogContextValue {
  open: (request: EntryDialogRequest) => void
  edit: (entry: EntryRecord) => void
}

export const EntryDialogContext = createContext<EntryDialogContextValue | null>(null)

/** Opens the module's one entry form. Only available inside `AccountsShell`. */
export function useEntryDialog(): EntryDialogContextValue {
  const context = useContext(EntryDialogContext)
  if (!context) {
    throw new Error('useEntryDialog must be used inside EntryDialogProvider.')
  }
  return context
}
