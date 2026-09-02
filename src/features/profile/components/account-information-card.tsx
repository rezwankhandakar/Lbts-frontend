import { BadgeCheck, CalendarClock, Clock3, Fingerprint, ShieldCheck, UserCog } from 'lucide-react'
import { UserRoleBadge } from '@/components/shared/user-role-badge'
import { UserStatusBadge } from '@/components/shared/user-status-badge'
import { formatDateTime, formatRelative, formatSmartDateTime } from '@/lib/format'
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
  const role = roleMeta(profile.role)
  const status = statusMeta(profile.status)

  return (
    <SectionCard
      icon={ShieldCheck}
      tone="violet"
      title="Account information"
      description="Managed by the system"
      footnote="Your role and account status are set by an administrator and cannot be changed from this page."
    >
      <dl>
        <InfoRow
          icon={Fingerprint}
          label="User ID"
          control="locked"
          hint="Quote this when contacting an administrator."
          action={<CopyButton value={profile.id} label="user ID" />}
        >
          <span className="font-mono text-xs break-all">{profile.id}</span>
        </InfoRow>

        <InfoRow
          icon={UserCog}
          label="Role"
          control="locked"
          controlHint="Assigned by an administrator"
          hint={role.description}
        >
          <UserRoleBadge role={profile.role} />
        </InfoRow>

        <InfoRow
          icon={ShieldCheck}
          label="Account status"
          control="locked"
          controlHint="Set by an administrator"
          hint={status.description}
        >
          <UserStatusBadge status={profile.status} />
        </InfoRow>

        <InfoRow
          icon={BadgeCheck}
          label="Email verification"
          control="locked"
          controlHint="Confirmed by the sign-in provider"
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
            {profile.emailVerified ? 'Verified' : 'Not verified'}
          </span>
        </InfoRow>

        <InfoRow icon={CalendarClock} label="Member since" hint={formatRelative(profile.createdAt)}>
          {formatDateTime(profile.createdAt)}
        </InfoRow>

        <InfoRow
          icon={Clock3}
          label="Last sign-in"
          hint={profile.lastLoginAt ? formatRelative(profile.lastLoginAt) : undefined}
        >
          {profile.lastLoginAt ? (
            formatSmartDateTime(profile.lastLoginAt)
          ) : (
            <span className="text-muted-foreground/70 italic">Not available</span>
          )}
        </InfoRow>
      </dl>
    </SectionCard>
  )
}
