import { useQuery } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { fetchSuggestions } from '../api/gate-pass-api'
import type { SuggestionField } from '../types'

/**
 * What has been filed before under one field, offered while the operator types.
 *
 * The same customers, vehicles and models come back week after week, so this
 * is partly speed — but mostly it is consistency: a suggestion is what stops
 * one customer being recorded as "Bata Shoe Company (Bangladesh) Limited",
 * "Bata Shoe Co." and "BATA" across three gate passes, which no report can put
 * back together afterwards.
 */

/** Below this the prefix matches most of the collection and helps nobody. */
const MIN_QUERY_LENGTH = 2

/** Typing must not fire a request per keystroke. */
const DEBOUNCE_MS = 250

export interface Suggestions {
  values: string[]
  isLoading: boolean
}

export function useSuggestions(field: SuggestionField, input: string): Suggestions {
  const query = useDebouncedValue(input.trim(), DEBOUNCE_MS)
  const enabled = query.length >= MIN_QUERY_LENGTH

  const result = useQuery({
    queryKey: ['gate-passes', 'suggestions', field, query],
    queryFn: () => fetchSuggestions(field, query),
    enabled,
    /**
     * Long, deliberately. The distinct values behind a prefix barely move
     * within a session, and an operator working through a stack of challans
     * types the same few prefixes over and over — caching them makes the list
     * appear instantly after the first time.
     */
    staleTime: 5 * 60 * 1000,
    /**
     * No retry. A suggestion that arrives late is worse than none: the
     * operator has already typed past it, and a cold-start retry would spend
     * a minute answering a question nobody is asking any more.
     */
    retry: false,
  })

  return {
    values: enabled ? (result.data ?? []) : [],
    isLoading: enabled && result.isFetching,
  }
}
