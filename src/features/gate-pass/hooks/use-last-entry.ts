import type { CarriedEntry } from '@/hooks/use-carry-over'
import { createLastEntryStore } from '@/lib/last-entry-store'
import type { CarriedField } from '../lib/carried-fields'

/**
 * The last gate pass this session filed, kept so the next one can offer its
 * repeated values. `sourceLabel` is the gate pass id, which the form names.
 *
 * The store and why it is not persisted are `lib/last-entry-store.ts`.
 */
export type LastGatePassEntry = CarriedEntry<CarriedField>

export const useLastEntryStore = createLastEntryStore<CarriedField>()
