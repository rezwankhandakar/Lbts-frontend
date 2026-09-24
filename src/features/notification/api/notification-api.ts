import { api } from '@/lib/axios'
import type {
  NotificationCategory,
  NotificationListParams,
  NotificationListResult,
  NotificationPageMeta,
  NotificationPreferences,
  NotificationRecord,
  NotificationSummary,
  NotificationVocabularyEntry,
} from '../types'

interface ApiEnvelope<T> {
  success: boolean
  statusCode: number
  message: string
  data: T
}

interface ApiListEnvelope<T> extends ApiEnvelope<T> {
  meta: NotificationPageMeta
}

const BASE = '/notifications'

/**
 * The filters, as one object the list shares with nothing else — there is no
 * export here, so unlike Gate Pass or Activity this has only one caller. It is
 * still a function rather than inline, because empty values and `all` are
 * *dropped* rather than sent: the request URL is the query cache key, so a
 * default that travelled would make two identical views two cache entries.
 */
function filterParams(params: NotificationListParams): Record<string, string> {
  return {
    ...(params.state !== 'all' ? { state: params.state } : {}),
    ...(params.module !== 'all' ? { module: params.module } : {}),
    ...(params.category !== 'all' ? { category: params.category } : {}),
    ...(params.priority !== 'all' ? { priority: params.priority } : {}),
    ...(params.event !== 'all' ? { event: params.event } : {}),
    ...(params.search ? { search: params.search } : {}),
  }
}

export async function fetchNotifications(
  params: NotificationListParams,
): Promise<NotificationListResult> {
  const { data } = await api.get<ApiListEnvelope<NotificationRecord[]>>(BASE, {
    params: { page: params.page, limit: params.limit, ...filterParams(params) },
  })

  return { records: data.data, meta: data.meta }
}

/**
 * The header's one request.
 *
 * **A short timeout, deliberately, and it is the only one in this app.** CLAUDE.md
 * sets the shared 60-second timeout because a cold Render instance takes most of
 * a minute to wake, and explicitly allows a shorter one "on a specific call where
 * failing fast genuinely beats waiting". This is that call: it runs on every page
 * load and then on a timer, so a request that hangs for a minute is one that is
 * still hanging when the next tick fires. A badge that is briefly wrong is
 * nothing; a queue of stacked polls against a sleeping instance is a page that
 * feels broken. The list beside it keeps the full timeout, because somebody
 * waiting on the page they opened would rather wait than see an error.
 */
const SUMMARY_TIMEOUT = 20_000

export async function fetchNotificationSummary(): Promise<NotificationSummary> {
  const { data } = await api.get<ApiEnvelope<NotificationSummary>>(`${BASE}/summary`, {
    timeout: SUMMARY_TIMEOUT,
  })
  return data.data
}

/** What this deployment can announce, with each event's label. */
export async function fetchNotificationVocabulary(): Promise<NotificationVocabularyEntry[]> {
  const { data } = await api.get<ApiEnvelope<{ events: NotificationVocabularyEntry[] }>>(
    `${BASE}/vocabulary`,
  )
  return data.data.events
}

export async function setNotificationRead(
  id: string,
  read: boolean,
): Promise<NotificationRecord> {
  const { data } = await api.patch<ApiEnvelope<NotificationRecord>>(`${BASE}/${id}`, { read })
  return data.data
}

/**
 * Marks everything read, up to what the reader has actually seen.
 *
 * `before` is what makes the button safe on a list somebody is looking at: a
 * message that arrived between the page rendering and the press would otherwise
 * be marked read unseen, which is the one way a notification system can lose
 * something. The caller sends the newest timestamp it has drawn.
 */
export async function markAllNotificationsRead(before?: string): Promise<{ updated: number }> {
  const { data } = await api.patch<ApiEnvelope<{ updated: number }>>(`${BASE}/read-all`, {
    ...(before ? { before } : {}),
  })
  return data.data
}

export async function dismissNotification(id: string): Promise<{ id: string }> {
  const { data } = await api.delete<ApiEnvelope<{ id: string }>>(`${BASE}/${id}`)
  return data.data
}

/** Clears what has been read. Unread rows are dismissed one at a time. */
export async function clearReadNotifications(): Promise<{ removed: number }> {
  const { data } = await api.delete<ApiEnvelope<{ removed: number }>>(`${BASE}/read`)
  return data.data
}

export async function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await api.get<ApiEnvelope<NotificationPreferences>>(`${BASE}/preferences`)
  return data.data
}

/**
 * A whole-list replace rather than a toggle per category — idempotent, and
 * undoing is the same call with one value removed. The shape
 * `PATCH /challan-batches/:id/skipped-pages` takes.
 */
export async function saveNotificationPreferences(
  mutedCategories: NotificationCategory[],
): Promise<NotificationPreferences> {
  const { data } = await api.put<ApiEnvelope<NotificationPreferences>>(`${BASE}/preferences`, {
    mutedCategories,
  })
  return data.data
}
