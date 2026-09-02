import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { USER_ACTIONS, primaryActionFor } from '../administration-actions'
import type { UserActionId } from '../administration-actions'
import { formatDate } from '@/lib/format'
import type { AdminUser } from '../types'
import { UserActionMenu } from './user-action-menu'
import { UserIdentity } from './user-identity'
import { UserRoleBadge } from '@/components/shared/user-role-badge'
import { UserStatusBadge } from '@/components/shared/user-status-badge'

interface UserTableProps {
  users: AdminUser[]
  currentUserId: string | null
  onViewDetails: (user: AdminUser) => void
  onChangeRole: (user: AdminUser) => void
  onAction: (user: AdminUser, action: UserActionId) => void
}

const HEAD = 'h-10 px-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase'

/**
 * The desktop view (md and up); below that the directory swaps to cards rather
 * than squashing six columns into a phone.
 *
 * Columns drop out as the viewport narrows instead of the table scrolling by
 * default: Email folds into the identity cell below xl, Created goes below lg.
 * The container still scrolls horizontally as a last resort.
 */
export function UserTable({
  users,
  currentUserId,
  onViewDetails,
  onChangeRole,
  onAction,
}: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead className={HEAD}>User</TableHead>
          <TableHead className={cn(HEAD, 'hidden xl:table-cell')}>Email</TableHead>
          <TableHead className={HEAD}>Role</TableHead>
          <TableHead className={HEAD}>Account status</TableHead>
          <TableHead className={cn(HEAD, 'hidden lg:table-cell')}>Created</TableHead>
          <TableHead className={cn(HEAD, 'text-right')}>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((user) => {
          const isSelf = user.id === currentUserId
          const primary = isSelf ? null : primaryActionFor(user.status)

          return (
            <TableRow
              key={user.id}
              onClick={() => onViewDetails(user)}
              className="cursor-pointer transition-colors duration-150 hover:bg-primary/[0.035]"
            >
              <TableCell className="px-4 py-3">
                {/* The button is what makes the row reachable by keyboard; the
                    row-level click is a mouse convenience on top of it.

                    Sized by its content up to a ceiling, never `max-w-0`: in an
                    auto-layout table that collapses the cell to its minimum and
                    truncates every name to a few characters. */}
                <button
                  type="button"
                  className="block max-w-[20rem] rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(event) => {
                    event.stopPropagation()
                    onViewDetails(user)
                  }}
                >
                  <UserIdentity user={user} isSelf={isSelf} />
                  <span className="sr-only">View details</span>
                </button>
              </TableCell>

              <TableCell className="hidden max-w-[16rem] truncate px-4 py-3 text-[13px] text-muted-foreground xl:table-cell">
                {user.email}
              </TableCell>

              <TableCell className="px-4 py-3">
                <UserRoleBadge role={user.role} />
              </TableCell>

              <TableCell className="px-4 py-3">
                <UserStatusBadge status={user.status} />
              </TableCell>

              <TableCell className="hidden px-4 py-3 text-[13px] whitespace-nowrap text-muted-foreground lg:table-cell">
                {formatDate(user.createdAt)}
              </TableCell>

              <TableCell
                className="px-4 py-3 text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-center justify-end gap-1">
                  {primary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden text-tone-emerald hover:bg-tone-emerald/10 hover:text-tone-emerald sm:inline-flex"
                      onClick={() => onAction(user, primary)}
                    >
                      {USER_ACTIONS[primary].label}
                    </Button>
                  )}
                  <UserActionMenu
                    user={user}
                    isSelf={isSelf}
                    onViewDetails={onViewDetails}
                    onChangeRole={onChangeRole}
                    onAction={onAction}
                  />
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
