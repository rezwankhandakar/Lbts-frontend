import { EllipsisVertical, Eye, UserRoundCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { USER_ACTIONS, actionsForStatus } from '../administration-actions'
import type { UserActionId } from '../administration-actions'
import type { AdminUser } from '../types'

interface UserActionMenuProps {
  user: AdminUser
  /** True for the signed-in Admin's own row — every mutation is blocked there. */
  isSelf: boolean
  onViewDetails: (user: AdminUser) => void
  onChangeRole: (user: AdminUser) => void
  onAction: (user: AdminUser, action: UserActionId) => void
}

/**
 * Secondary actions live behind the overflow trigger so a row stays calm.
 * Colour sits on the icon and the label, never on a filled button — five
 * bright buttons per row would make the table unreadable.
 *
 * On the administrator's own row every mutating item is dropped rather than
 * disabled: there is no state in which changing your own role or status is the
 * right answer, and the server refuses it regardless.
 */
export function UserActionMenu({
  user,
  isSelf,
  onViewDetails,
  onChangeRole,
  onAction,
}: UserActionMenuProps) {
  const actions = actionsForStatus(user.status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${user.name}`}
            className="text-muted-foreground hover:text-foreground"
          />
        }
      >
        <EllipsisVertical aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-lg">
        {/* A plain heading, not DropdownMenuLabel: that maps to Base UI's
            Menu.GroupLabel, which throws unless it sits inside a Menu.Group. */}
        <div className="px-1.5 pt-1 pb-2">
          <p className="truncate text-[13px] leading-tight font-semibold">{user.name}</p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
            {user.email}
          </p>
        </div>

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={() => onViewDetails(user)}
        >
          <Eye className="text-muted-foreground" aria-hidden />
          View details
        </DropdownMenuItem>

        {isSelf ? (
          <p className="px-1.5 py-2 text-[11px] leading-snug text-muted-foreground">
            You cannot change your own role or account status. Ask another Admin.
          </p>
        ) : (
          <>
            <DropdownMenuItem
              className="h-8 gap-2.5 rounded-lg text-[13px]"
              onClick={() => onChangeRole(user)}
            >
              <UserRoundCog className="text-tone-indigo" aria-hidden />
              Change role
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {actions.map((id) => {
              const action = USER_ACTIONS[id]
              const Icon = action.icon

              return (
                <DropdownMenuItem
                  key={id}
                  className={cn('h-8 gap-2.5 rounded-lg text-[13px]', action.menuClass)}
                  onClick={() => onAction(user, id)}
                >
                  <Icon aria-hidden />
                  {action.label}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
