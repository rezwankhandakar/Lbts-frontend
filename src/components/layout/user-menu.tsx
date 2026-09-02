import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toDisplayUser } from '@/features/auth/user-display'
import { useSignOut } from '@/features/auth/use-sign-out'
import { useAuthStore } from '@/stores/use-auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { roleMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const profile = useAuthStore((state) => state.profile)
  const firebaseUser = useAuthStore((state) => state.firebaseUser)
  const signOut = useSignOut()

  const user = toDisplayUser(profile, firebaseUser)
  const role = user.role ? roleMeta(user.role) : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            aria-label="Open account menu"
            className="h-9 gap-2 rounded-lg px-1 transition-colors hover:bg-primary/10 sm:pr-2"
          />
        }
      >
        <Avatar size="sm" className="ring-2 ring-primary/25">
          {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
          <AvatarFallback className="bg-gradient-to-br from-brand-from to-brand-to text-[11px] font-semibold text-primary-foreground">
            {user.initials}
          </AvatarFallback>
        </Avatar>
        {/* Identity only where there is room; avatar-only below sm. */}
        <span className="hidden min-w-0 flex-col items-start leading-none lg:flex">
          <span className="max-w-[9rem] truncate text-[13px] font-medium">{user.name}</span>
          {role && <span className="mt-0.5 text-[11px] text-muted-foreground">{role.label}</span>}
        </span>
        <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5 shadow-lg">
        <div className="flex items-center gap-3 px-1.5 py-2">
          <Avatar className="ring-2 ring-primary/25">
            {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
            <AvatarFallback className="bg-gradient-to-br from-brand-from to-brand-to text-xs font-semibold text-primary-foreground">
              {user.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] leading-tight font-semibold">{user.name}</p>
            {user.email && (
              <p className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground">
                {user.email}
              </p>
            )}
            {role && (
              <span
                className={cn(
                  'mt-1.5 inline-block rounded-full border px-1.5 py-0.5 text-[10px] leading-none font-semibold',
                  role.badge,
                )}
              >
                {role.label}
              </span>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          render={<Link to="/profile" />}
        >
          <UserRound className="text-brand-indigo" aria-hidden />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          render={<Link to="/settings" />}
        >
          <Settings className="text-brand-amber" aria-hidden />
          Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          variant="destructive"
          className="h-8 gap-2.5 rounded-lg text-[13px]"
          onClick={signOut}
        >
          <LogOut aria-hidden />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
