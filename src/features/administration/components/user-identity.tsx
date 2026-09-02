import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/features/auth/user-display'
import { cn } from '@/lib/utils'
import type { AdminUser } from '../types'

interface UserIdentityProps {
  user: AdminUser
  /** Marks the row that belongs to the signed-in administrator. */
  isSelf?: boolean
  /**
   * The email sits under the name only where there is no dedicated Email
   * column — below xl the column is hidden, so the identity cell absorbs it.
   */
  emailClassName?: string
  size?: 'default' | 'lg'
}

/**
 * Built from spans rather than divs and paragraphs: both callers render this
 * inside a <button>, whose content model is phrasing content only.
 */
export function UserIdentity({
  user,
  isSelf = false,
  emailClassName = 'xl:hidden',
  size = 'default',
}: UserIdentityProps) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar size={size} className="ring-2 ring-primary/15">
        {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
        <AvatarFallback className="bg-gradient-to-br from-brand-from to-brand-to text-[11px] font-semibold text-primary-foreground">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <span className="min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="truncate text-[13.5px] leading-tight font-semibold">{user.name}</span>
          {isSelf && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] leading-none font-semibold text-primary">
              You
            </span>
          )}
        </span>
        <span
          className={cn(
            'mt-1 block truncate text-xs leading-tight text-muted-foreground',
            emailClassName,
          )}
        >
          {user.email}
        </span>
      </span>
    </span>
  )
}
