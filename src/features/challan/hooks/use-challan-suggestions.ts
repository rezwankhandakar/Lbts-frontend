import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { fetchChallanSuggestions } from '../api/challan-api'
import type { ChallanSuggestionField } from '../types'

/**
 * What has been filed before under one field, offered while the operator types.
 *
 * The same districts, thanas, products and models come back every day, so this
 * is partly speed — but mostly it is consistency: a suggestion is what stops
 * one district being recorded as "Dhaka", "DHAKA" and "Dhaka." across three
 * challans, which no report can put back together afterwards.
 */

/** Below this the prefix matches most of the collection and helps nobody. */
const MIN_QUERY_LENGTH = 2

/** Typing must not fire a request per keystroke. */
const DEBOUNCE_MS = 250

export interface Suggestions {
  values: string[]
  isLoading: boolean
}

export function useChallanSuggestions(field: ChallanSuggestionField, input: string): Suggestions {
  const query = useDebouncedValue(input.trim(), DEBOUNCE_MS)
  const enabled = query.length >= MIN_QUERY_LENGTH

  const result = useQuery({
    queryKey: ['challans', 'suggestions', field, query],
    queryFn: () => fetchChallanSuggestions(field, query),
    enabled,
    /**
     * Long, deliberately. The distinct values behind a prefix barely move
     * within a session, and an operator working through a PDF of challans
     * types the same few prefixes over and over.
     */
    staleTime: 5 * 60 * 1000,
    /**
     * No retry. A suggestion that arrives late is worse than none: the
     * operator has already typed past it, and a cold-start retry would spend a
     * minute answering a question nobody is asking any more.
     */
    retry: false,
  })

  return {
    values: enabled ? (result.data ?? []) : [],
    isLoading: enabled && result.isFetching,
  }
}
