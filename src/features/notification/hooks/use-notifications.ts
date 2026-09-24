import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { useAuthStore } from '@/stores/use-auth-store'
import {
  clearReadNotifications,
  dismissNotification,
  fetchNotificationPreferences,
  fetchNotificationSummary,
  fetchNotificationVocabulary,
  fetchNotifications,
  markAllNotificationsRead,
  saveNotificationPreferences,
  setNotificationRead,
} from '../api/notification-api'
import type {
  NotificationCategory,
  NotificationListParams,
  NotificationListResult,
  NotificationPreferences,
  NotificationSummary,
  NotificationVocabularyEntry,
} from '../types'

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params: NotificationListParams) => ['notifications', 'list', params] as const,
  summary: () => ['notifications', 'summary'] as const,
  vocabulary: () => ['notifications', 'vocabulary'] as const,
  preferences: () => ['notifications', 'preferences'] as const,
}

/**
 * Freshness, and why it is what it is.
 *
 * **The summary is polled, and that is a deliberate free-tier decision rather
 * than a shortcut.** A websocket needs a process that stays up; Render's free
 * tier spins this one down after fifteen minutes of inactivity, and a socket that
 * dies silently with the instance is worse than no socket at all — the badge
 * would confidently read zero while three things waited. So the browser asks.
 *
 * Three things keep the asking cheap, and all three matter on a shared M0
 * cluster behind a sleeping instance:
 *
 * - **A minute between polls**, not five seconds. Nothing in this operation is
 *   answered in seconds: a gate pass waiting to be verified, a certificate that
 *   lapsed this morning, a vendor paid an hour ago. A minute is well inside the
 *   time it takes anybody to act, and it is sixty times less traffic than the
 *   interval a chat app would pick.
 * - **Only while the tab is visible.** `refetchIntervalInBackground` is left off,
 *   so a laptop with this open on a second monitor overnight sends nothing.
 * - **And on focus**, which is what actually makes it feel live: coming back to
 *   the tab is exactly when somebody looks at the bell. That is the one query in
 *   this app that overrides the client-wide `refetchOnWindowFocus: false`,
 *   because here the default is wrong — the whole point of the badge is to be
 *   current when it is looked at.
 */
const SUMMARY_STALE_TIME = 30_000
const SUMMARY_POLL_MS = 60_000
const LIST_STALE_TIME = 15_000
/** The vocabulary changes about as often as the deployment does. */
const VOCABULARY_STALE_TIME = 10 * 60_000

/**
 * The badge's figure, the panel's list, and what the unread count is made of.
 *
 * Gated on there being a signed-in profile at all. The gate is on the **hook**
 * rather than on the component that draws it, for the reason the dashboard's own
 * stats hooks are: a component that calls a hook and *then* returns null has
 * already made the request, so the header would poll an endpoint that answers 401
 * on every sign-in screen.
 */
export function useNotificationSummary(): UseQueryResult<NotificationSummary, ApiError> {
  const signedIn = useAuthStore((state) => state.profile !== null)

  return useQuery({
    queryKey: notificationKeys.summary(),
    queryFn: fetchNotificationSummary,
    enabled: signedIn,
    staleTime: SUMMARY_STALE_TIME,
    refetchInterval: SUMMARY_POLL_MS,
    refetchOnWindowFocus: true,
    /**
     * One retry rather than the two the lists take. A poll that fails has
     * another one coming in a minute, and stacking retries against a waking
     * instance is how a cheap request becomes an expensive one.
     */
    retry: 1,
  })
}

export function useNotifications(
  params: NotificationListParams,
): UseQueryResult<NotificationListResult, ApiError> {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => fetchNotifications(params),
    staleTime: LIST_STALE_TIME,
    // Keeps the page on screen while the next one loads, so paging and filtering
    // never blank the list.
    placeholderData: keepPreviousData,
    retry: 2,
  })
}

export function useNotificationVocabulary(): UseQueryResult<
  NotificationVocabularyEntry[],
  ApiError
> {
  return useQuery({
    queryKey: notificationKeys.vocabulary(),
    queryFn: fetchNotificationVocabulary,
    staleTime: VOCABULARY_STALE_TIME,
    retry: 2,
  })
}

export function useNotificationPreferences(): UseQueryResult<NotificationPreferences, ApiError> {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: fetchNotificationPreferences,
    staleTime: VOCABULARY_STALE_TIME,
    retry: 2,
  })
}

/**
 * Marking one message read or unread.
 *
 * **Optimistic, and this is the one place in the app where it is clearly right.**
 * Everywhere else a write is a statement about the business and waiting for the
 * server is the honest thing to do; here the write is *"I have seen this"*, the
 * reader has demonstrably seen it, and a row that stays bold for the length of a
 * cold start reads as a click that did not register — so somebody clicks again.
 *
 * Both caches are patched rather than invalidated, for the same reason: a
 * refetch of the list and the summary against a waking instance is two round
 * trips to tell the screen what it already knows. The rollback puts both back if
 * the write turns out to have failed.
 */
export function useSetNotificationRead(): UseMutationResult<
  unknown,
  ApiError,
  { id: string; read: boolean },
  { previous: [readonly unknown[], unknown][] }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => setNotificationRead(id, read),

    onMutate: async ({ id, read }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })

      const previous = queryClient.getQueriesData({ queryKey: notificationKeys.all })
      const readAt = read ? new Date().toISOString() : null
      const delta = read ? -1 : 1

      queryClient.setQueriesData<NotificationListResult>(
        { queryKey: ['notifications', 'list'] },
        (current) =>
          current
            ? {
                records: current.records.map((record) =>
                  record.id === id ? { ...record, readAt } : record,
                ),
                meta: {
                  ...current.meta,
                  unreadTotal: Math.max(0, current.meta.unreadTotal + delta),
                },
              }
            : current,
      )

      queryClient.setQueryData<NotificationSummary>(notificationKeys.summary(), (current) => {
        if (!current) {
          return current
        }

        const target = current.recent.find((record) => record.id === id)
        // Already in the state being asked for: the figures must not move twice.
        if (target && (target.readAt === null) !== read) {
          return {
            ...current,
            recent: current.recent.map((record) =>
              record.id === id ? { ...record, readAt } : record,
            ),
          }
        }

        return {
          ...current,
          unread: Math.max(0, current.unread + delta),
          ...(target
            ? {
                byCategory: {
                  ...current.byCategory,
                  [target.category]: Math.max(0, current.byCategory[target.category] + delta),
                },
                byPriority: {
                  ...current.byPriority,
                  [target.priority]: Math.max(0, current.byPriority[target.priority] + delta),
                },
              }
            : {}),
          recent: current.recent.map((record) =>
            record.id === id ? { ...record, readAt } : record,
          ),
        }
      })

      return { previous }
    },

    onError: (error, _variables, context) => {
      for (const [key, value] of context?.previous ?? []) {
        queryClient.setQueryData(key, value)
      }
      reportNotificationError(error)
    },
  })
}

/**
 * Marking everything read.
 *
 * `before` is the newest timestamp the caller has actually drawn, so a message
 * that arrived while somebody was reading is not cleared unseen. Invalidated
 * rather than patched, unlike the single toggle: this changes every row on every
 * page, and reconstructing that in the cache would be a second implementation of
 * the query it is standing in for.
 */
export function useMarkAllRead(): UseMutationResult<
  { updated: number },
  ApiError,
  string | undefined
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (before?: string) => markAllNotificationsRead(before),
    onSuccess: ({ updated }) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      if (updated > 0) {
        toast.success(`${updated} ${updated === 1 ? 'notification' : 'notifications'} marked read`)
      }
    },
    onError: reportNotificationError,
  })
}

export function useDismissNotification(): UseMutationResult<{ id: string }, ApiError, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onSuccess: () => {
      /**
       * Invalidated rather than patched: removing a row changes what belongs on
       * this page and on every page after it, and a cache that quietly held nine
       * rows where the server has ten is how a message goes missing.
       */
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
    onError: reportNotificationError,
  })
}

export function useClearRead(): UseMutationResult<{ removed: number }, ApiError, void> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearReadNotifications,
    onSuccess: ({ removed }) => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all })
      toast.success(
        removed === 0
          ? 'There was nothing read to clear'
          : `${removed} read ${removed === 1 ? 'notification' : 'notifications'} cleared`,
      )
    },
    onError: reportNotificationError,
  })
}

export function useSaveNotificationPreferences(): UseMutationResult<
  NotificationPreferences,
  ApiError,
  NotificationCategory[]
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (mutedCategories: NotificationCategory[]) =>
      saveNotificationPreferences(mutedCategories),
    onSuccess: (preferences) => {
      queryClient.setQueryData(notificationKeys.preferences(), preferences)
      toast.success(
        preferences.mutedCategories.length === 0
          ? 'You will hear about everything'
          : `${preferences.mutedCategories.length} ${
              preferences.mutedCategories.length === 1 ? 'category' : 'categories'
            } switched off`,
        {
          /**
           * Said out loud because it is the one thing about a mute that surprises
           * people: it applies to what arrives next, not to what is already here.
           * Muting at delivery is what keeps the badge and the list agreeing with
           * each other — see `withoutMuted` on the server.
           */
          description: 'This applies to new notifications. What is already here stays.',
        },
      )
    },
    onError: reportNotificationError,
  })
}

/**
 * The generic top-level message for a failure tells a reader nothing, so where
 * the API itemised what was wrong the first entry is shown underneath — the
 * treatment every other module gives its errors.
 */
export function reportNotificationError(error: ApiError): void {
  const detail = error.errorSources?.find(
    (source) => source.message && source.message !== error.message,
  )

  toast.error(error.message, {
    description: detail
      ? detail.path
        ? `${detail.path}: ${detail.message}`
        : detail.message
      : undefined,
  })
}
