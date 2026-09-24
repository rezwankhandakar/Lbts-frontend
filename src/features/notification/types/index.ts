/**
 * The notification system as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/notification/notification.constants.ts` and
 * `notification.serializer.ts`; the backend is the source of truth. Change one,
 * change both.
 *
 * **The event strings are deliberately not mirrored here**, the same decision
 * the activity feature makes. Modules, categories and priorities *are* — they
 * name icons, colours, filter chips and preference switches, so the UI has to
 * know them by name — but the events behind them are data, and
 * `GET /notifications/vocabulary` serves them with their labels. A hand-copied
 * event list is one chance per value to drift, and the one thing a filter must
 * not do is quietly match nothing.
 *
 * There are no role constants either, and that is not an omission: this is the
 * one feature in the app every signed-in account reaches, because every route
 * behind it reads the caller off the verified token and takes no user id. What
 * keeps a `Vendor` account away from the operating modules' messages is the
 * audience the server chose when it wrote them — so there is nothing for a route
 * guard here to decide.
 */

/** Which part of the system a message came from. */
export const NOTIFICATION_MODULES = [
  'Account',
  'Gate Pass',
  'Delivery',
  'Vendor',
  'Billing',
  'Accounts',
] as const
export type NotificationModule = (typeof NOTIFICATION_MODULES)[number]

/**
 * What kind of interruption it is — what somebody mutes, and what the panel
 * groups by. Categories rather than events, because muting is a decision about
 * a kind of message and never about one sentence.
 */
export const NOTIFICATION_CATEGORIES = [
  'approvals',
  'review',
  'compliance',
  'operations',
  'money',
  'account',
] as const
export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number]

/**
 * How loudly a message asks to be read. `urgent` is about being hard to undo or
 * already wrong rather than about volume — an expired certificate on a lorry
 * that is out today, an account that has stopped working.
 */
export const NOTIFICATION_PRIORITIES = ['info', 'attention', 'urgent'] as const
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]

/** The kinds of record a message can point at. */
export const NOTIFICATION_ENTITY_TYPES = [
  'User',
  'GatePass',
  'Challan',
  'Trip',
  'Vendor',
  'Vehicle',
  'Driver',
  'Document',
  'Bill',
  'LabourBill',
  'AccountsEntry',
] as const
export type NotificationEntityType = (typeof NOTIFICATION_ENTITY_TYPES)[number]

/**
 * One message.
 *
 * `module`, `category` and `priority` are derived server-side from the event, so
 * the client never computes them — and there is deliberately **no `link`**:
 * where a record lives is a fact about this router, so the path is worked out
 * here by `notificationPath`. A URL stored in June is a URL that silently breaks
 * when a route is renamed in September, in every row at once.
 */
export interface NotificationRecord {
  id: string
  event: string
  module: NotificationModule
  category: NotificationCategory
  priority: NotificationPriority
  /** A short noun phrase for the event, drawn as the row's kicker. */
  eventLabel: string

  title: string
  body: string

  entityType: NotificationEntityType | null
  entityId: string | null
  entityLabel: string

  /** Null for a message nobody caused — the compliance sweep's rows. */
  actor: { id: string | null; name: string; role: string } | null

  /** Null is unread. The client draws the distinction; it never invents one. */
  readAt: string | null
  createdAt: string
}

export function isUnread(record: NotificationRecord): boolean {
  return record.readAt === null
}

/** The list response's paging half, plus the badge's own figure. */
export interface NotificationPageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  /**
   * Unread across the **whole** inbox rather than within the filters. It is the
   * badge's figure, so somebody who has filtered to one category still sees that
   * four other things arrived.
   */
  unreadTotal: number
}

export interface NotificationListResult {
  records: NotificationRecord[]
  meta: NotificationPageMeta
}

/**
 * Everything the header needs, in one request.
 *
 * One call rather than four because this runs on every page load and then on a
 * timer — it is the most-called endpoint in the application, and on a sleeping
 * Render instance four round trips are four cold starts stacked behind each
 * other.
 */
export interface NotificationSummary {
  unread: number
  byCategory: Record<NotificationCategory, number>
  byPriority: Record<NotificationPriority, number>
  /** The newest message, read or not, so "nothing new" can be told apart. */
  latestAt: string | null
  /** A short list for the panel, newest first. */
  recent: NotificationRecord[]
}

export interface NotificationPreferences {
  mutedCategories: NotificationCategory[]
  /**
   * What may be muted at all, **served rather than assumed**. `account` is
   * absent, because being told your own account has been suspended is the one
   * message this system does not let a person switch off — and the form is built
   * from the server's answer so that rule lives in one place.
   */
  mutable: NotificationCategory[]
}

/** One event this deployment can announce, as the filter dropdown reads it. */
export interface NotificationVocabularyEntry {
  event: string
  label: string
  module: NotificationModule
  category: NotificationCategory
  priority: NotificationPriority
}

/** What the list is narrowed by. `state` first, because it is the one always used. */
export type NotificationState = 'all' | 'unread' | 'read'

export interface NotificationListParams {
  page: number
  limit: number
  state: NotificationState
  module: NotificationModule | 'all'
  category: NotificationCategory | 'all'
  priority: NotificationPriority | 'all'
  event: string | 'all'
  search: string
}

export const DEFAULT_NOTIFICATION_PARAMS: NotificationListParams = {
  page: 1,
  limit: 20,
  state: 'all',
  module: 'all',
  category: 'all',
  priority: 'all',
  event: 'all',
  search: '',
}
