import { create } from 'zustand'
import type { StoreApi, UseBoundStore } from 'zustand'
import type { CarriedEntry } from '@/hooks/use-carry-over'

/**
 * Where a module keeps what its last filed record left, for the carry-over
 * tick boxes — see `hooks/use-carry-over.ts`.
 *
 * A store rather than state on a workspace, because filing a single record
 * ends on that record's own page: the form unmounts, and without somewhere
 * outside it to leave them the values would only ever survive inside one
 * scanned stack or one source PDF. Somebody filing one sheet at a time repeats
 * the same values just as much.
 *
 * **Deliberately not persisted.** These are a customer's name, a plate, a zone
 * — and more to the point, a value left over from last Tuesday offered against
 * this morning's sheet is worse than nothing, because it looks exactly like a
 * value somebody checked. Memory for the length of a session is the honest
 * lifetime for it: a reload clears it, and so does signing out.
 */
export interface LastEntryState<F extends string> {
  last: CarriedEntry<F> | null
  remember: (entry: CarriedEntry<F>) => void
  forget: () => void
}

export function createLastEntryStore<F extends string>(): UseBoundStore<
  StoreApi<LastEntryState<F>>
> {
  return create<LastEntryState<F>>()((set) => ({
    last: null,
    remember: (last) => set({ last }),
    forget: () => set({ last: null }),
  }))
}
