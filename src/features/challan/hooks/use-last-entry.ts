import type { CarriedEntry } from '@/hooks/use-carry-over'
import { createLastEntryStore } from '@/lib/last-entry-store'
import type { CarriedField } from '../lib/carried-fields'

/**
 * The last challan this session filed, kept so the next one can offer its
 * repeated values. `sourceLabel` is the challan number, which the form names.
 *
 * Outside the session on purpose, unlike the queue: a session is one source
 * PDF, and the next file opened is usually the next twenty deliveries for the
 * same customer. The store and why it is not persisted are
 * `lib/last-entry-store.ts`.
 */
export type LastChallanEntry = CarriedEntry<CarriedField>

export const useLastEntryStore = createLastEntryStore<CarriedField>()
