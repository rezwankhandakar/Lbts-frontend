import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AdministrationHeader } from '@/features/administration/components/administration-header'
import { AdministrationOverlays } from '@/features/administration/components/administration-overlays'
import { AdministrationStats } from '@/features/administration/components/administration-stats'
import { UserDirectory } from '@/features/administration/components/user-directory'
import { UserFilters } from '@/features/administration/components/user-filters'
import { UserPagination } from '@/features/administration/components/user-pagination'
import { useAdminUsers, useAdminUserStats } from '@/features/administration/use-administration'
import { useUserActions } from '@/features/administration/use-user-actions'
import type { RoleFilter, StatusFilter } from '@/features/administration/types'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useAuthStore } from '@/stores/use-auth-store'

const PAGE_SIZE = 10

/**
 * System administration and user access control.
 *
 * Reaching this page at all requires the Admin role — the sidebar hides it,
 * the AdminRoute guard blocks the URL, and every request it makes is refused
 * server-side for anyone else. The last of those three is the only one that
 * counts as security; the other two are courtesy.
 */
export function AdministrationPage() {
  const currentUserId = useAuthStore((state) => state.profile?.id ?? null)

  /**
   * The dashboard links here with the pending queue it just counted, and this
   * is how that filter survives the trip. Router state rather than the URL,
   * because these filters have never been in the URL — carrying one is a
   * convenience for one journey, not a promise that a link reproduces a view.
   *
   * It seeds the first render only, so Clear still clears to nothing.
   */
  const { state } = useLocation()
  const seeded = (state as { userFilters?: { status?: StatusFilter } } | null)?.userFilters

  const [search, setSearch] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const [status, setStatus] = useState<StatusFilter>(seeded?.status ?? 'all')
  const [page, setPage] = useState(1)

  // Typing must not fire a request per keystroke; the debounced value is what
  // reaches the query key, so the cache holds settled searches only.
  const debouncedSearch = useDebouncedValue(search, 350)

  /**
   * Any narrowing of the result set invalidates the current page number —
   * filtering to three results while on page four would show nothing. Each
   * filter setter returns to page one itself, rather than an effect watching
   * them, so there is never a render where page and filters disagree.
   */
  const changeSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const changeRole = (value: RoleFilter) => {
    setRole(value)
    setPage(1)
  }

  const changeStatus = (value: StatusFilter) => {
    setStatus(value)
    setPage(1)
  }

  const usersQuery = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch,
    role,
    status,
  })
  const statsQuery = useAdminUserStats()

  const actions = useUserActions()

  const isFiltered = search !== '' || role !== 'all' || status !== 'all'
  const users = usersQuery.data?.users ?? []
  const meta = usersQuery.data?.meta

  // Deleting the last row on a page leaves the current page past the end of
  // the result set. Clamping during render lands the operator on the last real
  // page instead of an empty one.
  if (meta && page > meta.totalPages) {
    setPage(meta.totalPages)
  }

  const resetFilters = () => {
    setSearch('')
    setRole('all')
    setStatus('all')
    setPage(1)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdministrationHeader />

      <AdministrationStats
        stats={statsQuery.data}
        isLoading={statsQuery.isPending}
        isError={statsQuery.isError}
        onRetry={() => void statsQuery.refetch()}
      />

      <section
        aria-label="User management"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <UserFilters
          search={search}
          role={role}
          status={status}
          onSearchChange={changeSearch}
          onRoleChange={changeRole}
          onStatusChange={changeStatus}
          onReset={resetFilters}
          summary={
            meta && !usersQuery.isPending
              ? `${meta.total} ${meta.total === 1 ? 'account' : 'accounts'}${
                  isFiltered ? ' match these filters' : ' on record'
                }`
              : undefined
          }
        />

        <UserDirectory
          users={users}
          currentUserId={currentUserId}
          isLoading={usersQuery.isPending}
          isFetching={usersQuery.isFetching}
          isError={usersQuery.isError}
          errorMessage={usersQuery.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          onRetry={() => void usersQuery.refetch()}
          onReset={resetFilters}
          onViewDetails={actions.openDetails}
          onChangeRole={actions.openRoleChange}
          onAction={actions.openAction}
        />

        {meta && !usersQuery.isError && (
          <UserPagination meta={meta} onPageChange={setPage} isFetching={usersQuery.isFetching} />
        )}
      </section>

      <AdministrationOverlays actions={actions} currentUserId={currentUserId} />
    </div>
  )
}
