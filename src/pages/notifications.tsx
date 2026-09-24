import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { NotificationList } from '@/features/notification/components/notification-list'
import { NotificationOverview } from '@/features/notification/components/notification-overview'
import { NotificationPreferencesDialog } from '@/features/notification/components/notification-preferences-dialog'
import { NotificationToolbar } from '@/features/notification/components/notification-toolbar'
import {
  useClearRead,
  useDismissNotification,
  useMarkAllRead,
  useNotificationSummary,
  useNotificationVocabulary,
  useNotifications,
  useSetNotificationRead,
} from '@/features/notification/hooks/use-notifications'
import { useNotificationParams } from '@/features/notification/hooks/use-notification-params'
import type { NotificationFilterPatch } from '@/features/notification/hooks/use-notification-params'
import type { NotificationRecord } from '@/features/notification/types'

/**
 * Everything this account has been told.
 *
 * **This is the one destination in the app that is not in the sidebar and is not
 * role-guarded**, and both follow from what it is. It is reached from the bell,
 * because that is where somebody is when they want it — a sidebar entry would be
 * a second way in for something already one press away, and it would sit under
 * *Main* claiming to be a part of the business when it is a part of the person.
 * And there is no `RoleRoute` because there is nothing to guard: every route
 * behind this page reads the caller off the verified token and takes no user id,
 * so a `Vendor` account and an `Admin` account reach the same page and are shown
 * two entirely different inboxes by the server. What keeps a vendor away from the
 * operating modules' messages is the audience chosen when each was written.
 *
 * Read top to bottom it narrows, like every other list in this app: what is
 * waiting, then how to narrow it, then the messages grouped by day.
 *
 * The one thing on it that does not follow the house rule is the tile row. Every
 * total in this codebase answers the filters in force; those answer the whole
 * inbox, because the moment they narrowed with the list they would stop being
 * able to say what somebody had *not* looked at — which is the only question they
 * exist for. The count under the toolbar is the filtered one, so paging stays
 * honest.
 */
export function NotificationsPage() {
  /**
   * The panel's "See unread" lands here already filtered, and the filter travels
   * in **router state rather than a query string** — the convention this codebase
   * states outright and the dashboard's attention rows already follow. List
   * filters have never lived in the URL here, so a `?state=unread` would be read
   * by precisely nothing and the link would claim a view it did not produce.
   *
   * It seeds the first render and nothing else, so *Clear* still clears to
   * nothing rather than back to the seed.
   */
  const location = useLocation()
  const seed = location.state as NotificationFilterPatch | null

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useNotificationParams(seed ?? undefined)

  const notificationsQuery = useNotifications(applied)
  const summaryQuery = useNotificationSummary()
  const vocabularyQuery = useNotificationVocabulary()

  const setRead = useSetNotificationRead()
  const dismiss = useDismissNotification()
  const markAll = useMarkAllRead()
  const clearRead = useClearRead()

  const [preferencesOpen, setPreferencesOpen] = useState(false)

  const records = notificationsQuery.data?.records ?? []
  const meta = notificationsQuery.data?.meta

  // A filter that narrows the set leaves the current page past the end of it.
  // Clamping during render lands the reader on the last real page rather than an
  // empty one — the arrangement every list in this app uses.
  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  const toggleRead = (record: NotificationRecord) => {
    setRead.mutate({ id: record.id, read: record.readAt === null })
  }

  /**
   * The newest message actually on screen. Without it, "mark all read" would
   * clear something that arrived between this page rendering and the press —
   * which is the one way a system like this can lose a message.
   */
  const newestShown = records[0]?.createdAt

  const unread = meta?.unreadTotal ?? summaryQuery.data?.unread ?? 0
  const hasRead = records.some((record) => record.readAt !== null)

  return (
    <div className="mx-auto w-full max-w-5xl">
      <PageHeader
        title="Notifications"
        description="What the system needs you to know: accounts waiting for approval, gate pass verdicts, certificates about to lapse, goods back at the depot and money movements. Each one is addressed to you — what you see here is not what anybody else sees."
      />

      <NotificationOverview
        summary={summaryQuery.data}
        isLoading={summaryQuery.isPending}
        params={params}
        onChange={applyFilters}
      />

      <section
        aria-label="Your notifications"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <NotificationToolbar
          params={params}
          vocabulary={vocabularyQuery.data ?? []}
          isFiltered={isFiltered}
          hasUnread={unread > 0}
          hasRead={hasRead}
          isBusy={markAll.isPending || clearRead.isPending}
          onChange={applyFilters}
          onReset={reset}
          onMarkAllRead={() => markAll.mutate(newestShown)}
          onClearRead={() => clearRead.mutate()}
          onOpenPreferences={() => setPreferencesOpen(true)}
          summary={
            meta && !notificationsQuery.isPending
              ? `${meta.total.toLocaleString()} ${
                  meta.total === 1 ? 'notification' : 'notifications'
                }${isFiltered ? ' match these filters' : ''}${
                  unread > 0 ? ` · ${unread.toLocaleString()} unread in total` : ''
                }`
              : undefined
          }
        />

        <NotificationList
          records={records}
          isLoading={notificationsQuery.isPending}
          isFetching={notificationsQuery.isFetching}
          isError={notificationsQuery.isError}
          errorMessage={notificationsQuery.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          onRetry={() => void notificationsQuery.refetch()}
          onReset={reset}
          onToggleRead={toggleRead}
          onDismiss={(record) => dismiss.mutate(record.id)}
        />

        {meta && !notificationsQuery.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={notificationsQuery.isFetching}
            noun={['notification', 'notifications']}
          />
        )}
      </section>

      <NotificationPreferencesDialog open={preferencesOpen} onOpenChange={setPreferencesOpen} />
    </div>
  )
}
