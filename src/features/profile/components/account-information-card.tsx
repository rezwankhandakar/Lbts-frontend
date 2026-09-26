import { BadgeCheck, CalendarClock, Clock3, Fingerprint, ShieldCheck, UserCog } from 'lucide-react'
import { UserRoleBadge } from '@/components/shared/user-role-badge'
import { UserStatusBadge } from '@/components/shared/user-status-badge'
import { useFormatters, useT } from '@/lib/i18n'
import { roleMeta, statusMeta } from '@/lib/roles'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/stores/use-auth-store'
import { CopyButton } from './copy-button'
import { InfoRow } from './info-row'
import { SectionCard } from './section-card'

interface AccountInformationCardProps {
  profile: UserProfile
}

/**
 * What the system knows about the account, and none of it editable here.
 *
 * Role and status are the reason this panel is separate from personal
 * information: they are decided in Administration and enforced by the API on
 * every request. Showing them beside a locked marker — rather than hiding them
 * — is what lets someone see why they can or cannot reach a module, without
 * ever suggesting the page could change it.
 */
export function AccountInformationCard({ profile }: AccountInformationCardProps) {
  const t = useT()
  const format = useFormatters()
  const role = roleMeta(profile.role, t)
  const status = statusMeta(profile.status, t)

  return (
    <SectionCard
      icon={ShieldCheck}
      tone="violet"
      title={t('profile.account.title')}
      description={t('profile.account.description')}
      footnote={t('profile.account.footnote')}
    >
      <dl>
        <InfoRow
          icon={Fingerprint}
          label={t('profile.account.userId')}
          control="locked"
          hint={t('profile.account.userIdHint')}
          action={<CopyButton value={profile.id} label={t('profile.account.userIdLabel')} />}
        >
          <span className="font-mono text-xs break-all">{profile.id}</span>
        </InfoRow>

        <InfoRow
          icon={UserCog}
          label={t('common.labels.role')}
          control="locked"
          controlHint={t('profile.account.assignedByAdmin')}
          hint={role.description}
        >
          <UserRoleBadge role={profile.role} />
        </InfoRow>

        <InfoRow
          icon={ShieldCheck}
          label={t('administration.table.accountStatus')}
          control="locked"
          controlHint={t('profile.account.setByAdmin')}
          hint={status.description}
        >
          <UserStatusBadge status={profile.status} />
        </InfoRow>

        <InfoRow
          icon={BadgeCheck}
          label={t('profile.account.emailVerification')}
          control="locked"
          controlHint={t('profile.account.confirmedByProvider')}
        >
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold',
              profile.emailVerified
                ? 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald'
                : 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
            )}
          >
            <span
              className={cn(
                'size-1.5 shrink-0 rounded-full',
                profile.emailVerified ? 'bg-tone-emerald' : 'bg-tone-amber',
              )}
              aria-hidden
            />
            {profile.emailVerified
              ? t('profile.account.verified')
              : t('profile.account.notVerified')}
          </span>
        </InfoRow>

        <InfoRow
          icon={CalendarClock}
          label={t('profile.account.memberSince')}
          hint={format.relative(profile.createdAt)}
        >
          {format.dateTime(profile.createdAt)}
        </InfoRow>

        <InfoRow
          icon={Clock3}
          label={t('profile.account.lastSignIn')}
          hint={profile.lastLoginAt ? format.relative(profile.lastLoginAt) : undefined}
        >
          {profile.lastLoginAt ? (
            format.smartDateTime(profile.lastLoginAt)
          ) : (
            <span className="text-muted-foreground/70 italic">
              {t('common.states.notAvailable')}
            </span>
          )}
        </InfoRow>
      </dl>
    </SectionCard>
  )
}
