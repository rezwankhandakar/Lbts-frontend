import { create } from 'zustand'
import type { CarriedValues } from '../lib/carried-fields'

/**
 * The last gate pass this session filed, kept so the next one can offer its
 * repeated values.
 *
 * A store rather than state on the workspace, because filing a single gate
 * pass ends on that record's own page: the workspace unmounts, and without
 * somewhere outside it to leave them the values would only ever survive inside
 * one scanned stack. An operator filing sheets one at a time repeats the same
 * five values just as much as one working a batch.
 *
 * **Deliberately not persisted.** These are a customer's name and a lorry's
 * plate, and a gate PC is a shared machine; more to the point, a value left
 * over from last Tuesday prefilled into this morning's form is worse than an
 * empty box, because it looks exactly like a value somebody checked. Memory
 * for the length of a session is the honest lifetime for it — a reload clears
 * it, and so does signing out.
 */
export interface LastGatePassEntry {
  values: CarriedValues
  /** The gate pass those values were filed under, named in the form. */
  gatePassId: string
}

interface LastEntryState {
  last: LastGatePassEntry | null
  remember: (entry: LastGatePassEntry) => void
  forget: () => void
}

export const useLastEntryStore = create<LastEntryState>()((set) => ({
  last: null,
  remember: (last) => set({ last }),
  forget: () => set({ last: null }),
}))
