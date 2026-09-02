import { cn } from '@/lib/utils'
import type { UserActionId } from '../administration-actions'
import type { AdminUser } from '../types'
import { UserCards } from './user-cards'
import {
  UserDirectoryEmpty,
  UserDirectoryError,
  UserDirectorySkeleton,
} from './user-directory-states'
import { UserTable } from './user-table'

interface UserDirectoryProps {
  users: AdminUser[]
  currentUserId: string | null
  isLoading: boolean
  /** A background refetch — the previous page stays on screen, dimmed. */
  isFetching: boolean
  isError: boolean
  errorMessage: string
  isFiltered: boolean
  onRetry: () => void
  onReset: () => void
  onViewDetails: (user: AdminUser) => void
  onChangeRole: (user: AdminUser) => void
  onAction: (user: AdminUser, action: UserActionId) => void
}

/**
 * Picks the presentation for the current state, and the layout for the current
 * viewport: a table from md up, cards below it. Nothing here invents data —
 * an empty result renders as an empty state, never as placeholder rows.
 */
export function UserDirectory({
  users,
  currentUserId,
  isLoading,
  isFetching,
  isError,
  errorMessage,
  isFiltered,
  onRetry,
  onReset,
  onViewDetails,
  onChangeRole,
  onAction,
}: UserDirectoryProps) {
  if (isLoading) {
    return <UserDirectorySkeleton />
  }

  if (isError) {
    return <UserDirectoryError message={errorMessage} onRetry={onRetry} isRetrying={isFetching} />
  }

  if (users.length === 0) {
    return <UserDirectoryEmpty isFiltered={isFiltered} onReset={onReset} />
  }

  const handlers = {
    currentUserId,
    onViewDetails,
    onChangeRole,
    onAction,
  }

  return (
    <div
      className={cn(
        'transition-opacity duration-200',
        isFetching && 'pointer-events-none opacity-60',
      )}
      aria-busy={isFetching}
    >
      <div className="hidden md:block">
        <UserTable users={users} {...handlers} />
      </div>
      <div className="md:hidden">
        <UserCards users={users} {...handlers} />
      </div>
    </div>
  )
}
