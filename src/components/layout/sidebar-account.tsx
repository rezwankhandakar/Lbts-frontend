import { LogOut } from 'lucide-react'
import { toDisplayUser } from '@/features/auth/user-display'
import { useSignOut } from '@/features/auth/use-sign-out'
import { useAuthStore } from '@/stores/use-auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { roleMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'

interface SidebarAccountProps {
  collapsed?: boolean
}

/**
 * Sign-out affordance. Neutral at rest so it never shouts from the sidebar
 * footer, and unmistakably destructive on hover.
 */
const SIGN_OUT_CLASSES = cn(
  'group flex items-center rounded-lg border border-transparent text-[13px] font-medium',
  'text-muted-foreground transition-colors duration-150 outline-none',
  'hover:border-destructive/25 hover:bg-destructive/10 hover:text-destructive',
  'active:bg-destructive/15',
  'focus-visible:ring-destructive/40 focus-visible:ring-offset-sidebar focus-visible:ring-2 focus-visible:ring-offset-1',
)

export function SidebarAccount({ collapsed = false }: SidebarAccountProps) {
  const status = useAuthStore((state) => state.status)
  const profile = useAuthStore((state) => state.profile)
  const firebaseUser = useAuthStore((state) => state.firebaseUser)
  const signOut = useSignOut()

  const user = toDisplayUser(profile, firebaseUser)
  const authenticated = status === 'authenticated'
  const role = user.role ? roleMeta(user.role) : null

  const avatar = (
    <div className="relative shrink-0">
      <Avatar size="sm" className="ring-2 ring-primary/25">
        {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
        <AvatarFallback className="bg-gradient-to-br from-brand-from to-brand-to text-[11px] font-semibold text-primary-foreground">
          {authenticated ? user.initials : '—'}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-sidebar',
          authenticated ? 'bg-success' : 'bg-muted-foreground/40',
        )}
        aria-hidden
      />
    </div>
  )

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2 px-2 py-3">
        <Tooltip>
          <TooltipTrigger render={<div className="cursor-default" />}>{avatar}</TooltipTrigger>
          <TooltipContent side="right">
            {authenticated ? `${user.name} · ${role?.label ?? 'account'}` : 'Not signed in'}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={signOut}
                aria-label="Sign out"
                className={cn(SIGN_OUT_CLASSES, 'size-8 justify-center')}
              />
            }
          >
            <LogOut className="size-4" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="right">Sign out</TooltipContent>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="p-3">
      <div className="rounded-xl border border-sidebar-border bg-card/70 p-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          {avatar}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] leading-tight font-semibold">
              {authenticated ? user.name : 'Signed out'}
            </p>
            {authenticated ? (
              <div className="mt-1 flex items-center gap-1.5">
                <span
                  className={cn(
                    'rounded-full border px-1.5 py-0.5 text-[10px] leading-none font-semibold',
                    role?.badge ?? 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {role?.label ?? 'Member'}
                </span>
                <span className="truncate text-[11px] leading-none text-muted-foreground">
                  {user.email}
                </span>
              </div>
            ) : (
              <p className="mt-1 truncate text-[11px] leading-none text-muted-foreground">
                Not authenticated
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={signOut}
          className={cn(SIGN_OUT_CLASSES, 'mt-2.5 h-8 w-full justify-center gap-2')}
        >
          <LogOut className="size-3.5" aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  )
}
