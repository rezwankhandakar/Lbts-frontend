import { Button } from '@/components/ui/button'
import { USER_ACTIONS, primaryActionFor } from '../administration-actions'
import type { UserActionId } from '../administration-actions'
import { formatDate } from '@/lib/format'
import type { AdminUser } from '../types'
import { UserActionMenu } from './user-action-menu'
import { UserIdentity } from './user-identity'
import { UserRoleBadge } from '@/components/shared/user-role-badge'
import { UserStatusBadge } from '@/components/shared/user-status-badge'

interface UserCardsProps {
  users: AdminUser[]
  currentUserId: string | null
  onViewDetails: (user: AdminUser) => void
  onChangeRole: (user: AdminUser) => void
  onAction: (user: AdminUser, action: UserActionId) => void
}

/**
 * The narrow-viewport view. A phone gets a readable stack of cards rather than
 * a six-column table shrunk past legibility — the same data, reordered so the
 * identity leads and the badges sit on their own line.
 */
export function UserCards({
  users,
  currentUserId,
  onViewDetails,
  onChangeRole,
  onAction,
}: UserCardsProps) {
  return (
    <ul className="divide-y">
      {users.map((user) => {
        const isSelf = user.id === currentUserId
        const primary = isSelf ? null : primaryActionFor(user.status)

        return (
          <li
            key={user.id}
            className="p-3.5 transition-colors duration-150 hover:bg-primary/[0.035]"
          >
            <div className="flex items-start justify-between gap-2">
              <button
                type="button"
                className="min-w-0 flex-1 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => onViewDetails(user)}
              >
                <UserIdentity user={user} isSelf={isSelf} emailClassName="" />
                <span className="sr-only">View details</span>
              </button>

              <UserActionMenu
                user={user}
                isSelf={isSelf}
                onViewDetails={onViewDetails}
                onChangeRole={onChangeRole}
                onAction={onAction}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
              <span className="ml-auto text-[11px] whitespace-nowrap text-muted-foreground">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>

            {primary && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full text-tone-emerald hover:bg-tone-emerald/10 hover:text-tone-emerald"
                onClick={() => onAction(user, primary)}
              >
                {USER_ACTIONS[primary].label}
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}
