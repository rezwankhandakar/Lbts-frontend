import { BadgeCheck, CalendarClock, Clock3, Mail, UserRoundCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { getInitials } from '@/features/auth/user-display'
import { useFormatters, useT } from '@/lib/i18n'
import { roleLabel, statusLabel, statusMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { AdminUser } from '../types'
import { UserRoleBadge } from '@/components/shared/user-role-badge'
import { UserStatusBadge } from '@/components/shared/user-status-badge'

interface UserDetailsSheetProps {
  user: AdminUser | null
  open: boolean
  isSelf: boolean
  onOpenChange: (open: boolean) => void
  onChangeRole: (user: AdminUser) => void
}

function Row({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </dt>
        <dd className="mt-0.5 text-[13px] leading-snug break-words">{children}</dd>
      </div>
    </div>
  )
}

/**
 * A drawer rather than a route: reviewing an account is a glance inside the
 * directory, not a destination, and a full page would lose the operator's
 * place in the list. Everything shown here arrived with the list request.
 */
export function UserDetailsSheet({
  user,
  open,
  isSelf,
  onOpenChange,
  onChangeRole,
}: UserDetailsSheetProps) {
  const t = useT()
  const format = useFormatters()

  if (!user) {
    return null
  }

  const status = statusMeta(user.status, t)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b p-5">
          <SheetTitle className="sr-only">{t('administration.details.srTitle')}</SheetTitle>
          <SheetDescription className="sr-only">
            {t('administration.details.srDescription', { name: user.name })}
          </SheetDescription>

          <div className="flex items-start gap-3.5 pr-8">
            <Avatar size="lg" className="ring-2 ring-primary/15">
              {user.photoUrl ? <AvatarImage src={user.photoUrl} alt="" /> : null}
              <AvatarFallback className="bg-gradient-to-br from-brand-from to-brand-to text-sm font-semibold text-primary-foreground">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base font-semibold">{user.name}</p>
              <p className="mt-0.5 truncate text-[13px] text-muted-foreground">{user.email}</p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <UserRoleBadge role={user.role} />
                <UserStatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <p
            className={cn(
              'mt-4 rounded-lg px-3 py-2 text-[12.5px] leading-snug ring-1',
              status.chip,
            )}
          >
            {status.description}
            {user.statusNote ? ` — “${user.statusNote}”` : ''}
          </p>
        </SheetHeader>

        <dl className="divide-y px-5 py-2">
          <Row icon={Mail} label={t('administration.details.email')}>
            <span className="break-all">{user.email}</span>
            <span
              className={cn(
                'mt-1 flex items-center gap-1 text-[11px]',
                user.emailVerified ? 'text-tone-emerald' : 'text-muted-foreground',
              )}
            >
              <BadgeCheck className="size-3.5" aria-hidden />
              {user.emailVerified
                ? t('administration.details.emailVerified')
                : t('administration.details.emailNotVerified')}
            </span>
          </Row>

          <Row icon={CalendarClock} label={t('administration.details.accountCreated')}>
            {format.dateTime(user.createdAt)}
          </Row>

          <Row icon={Clock3} label={t('administration.details.lastSignIn')}>
            {user.lastLoginAt ? (
              <>
                {format.dateTime(user.lastLoginAt)}
                <span className="ml-1.5 text-muted-foreground">
                  ({format.relative(user.lastLoginAt)})
                </span>
              </>
            ) : (
              t('administration.details.neverSignedIn')
            )}
          </Row>

          <Row icon={UserRoundCog} label={t('administration.details.lastChange')}>
            {user.statusUpdatedAt || user.roleUpdatedAt ? (
              <ul className="space-y-1">
                {/* Two whole sentences rather than one with an optional tail
                    appended: ' by X' can only sit at the end in English, and
                    Bangla puts the actor before the verb. */}
                {user.roleUpdatedAt && (
                  <li>
                    {user.roleUpdatedBy
                      ? t('administration.details.roleSetToBy', {
                          role: roleLabel(user.role, t),
                          when: format.relative(user.roleUpdatedAt),
                          actor: user.roleUpdatedBy.name,
                        })
                      : t('administration.details.roleSetTo', {
                          role: roleLabel(user.role, t),
                          when: format.relative(user.roleUpdatedAt),
                        })}
                  </li>
                )}
                {user.statusUpdatedAt && (
                  <li>
                    {user.statusUpdatedBy
                      ? t('administration.details.markedStatusBy', {
                          status: statusLabel(user.status, t),
                          when: format.relative(user.statusUpdatedAt),
                          actor: user.statusUpdatedBy.name,
                        })
                      : t('administration.details.markedStatus', {
                          status: statusLabel(user.status, t),
                          when: format.relative(user.statusUpdatedAt),
                        })}
                  </li>
                )}
              </ul>
            ) : (
              t('administration.details.noChanges')
            )}
          </Row>
        </dl>

        <div className="border-t p-4">
          {isSelf ? (
            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              {t('administration.details.ownAccount')}
            </p>
          ) : (
            <Button variant="outline" className="w-full" onClick={() => onChangeRole(user)}>
              <UserRoundCog data-icon="inline-start" className="text-tone-indigo" aria-hidden />
              {t('administration.changeRole')}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
