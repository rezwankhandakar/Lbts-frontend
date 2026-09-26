import { BadgeCheck, ImageIcon, Mail, PencilLine, Phone, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/stores/use-auth-store'
import { InfoRow } from './info-row'
import { SectionCard } from './section-card'

interface PersonalInformationCardProps {
  profile: UserProfile
  onEdit: () => void
}

/**
 * What the account owner maintains about themselves.
 *
 * Email sits here because it is personal information, but it is marked locked:
 * Firebase owns the sign-in identity, and changing the address is a
 * reauthentication and re-verification flow that belongs to the auth provider,
 * not to a profile form. Saying so plainly is better than an input that would
 * have to refuse.
 */
export function PersonalInformationCard({ profile, onEdit }: PersonalInformationCardProps) {
  const t = useT()

  return (
    <SectionCard
      icon={UserRound}
      tone="indigo"
      title={t('profile.personal.title')}
      description={t('profile.personal.description')}
      action={
        <Button variant="outline" size="sm" onClick={onEdit}>
          <PencilLine data-icon="inline-start" aria-hidden />
          {t('common.actions.edit')}
        </Button>
      }
      footnote={t('profile.personal.footnote')}
    >
      <dl>
        <InfoRow icon={UserRound} label={t('profile.personal.fullName')} control="editable">
          <span className="font-medium">{profile.name}</span>
        </InfoRow>

        <InfoRow
          icon={Mail}
          label={t('profile.personal.emailAddress')}
          control="locked"
          controlHint={t('profile.personal.emailManagedBy')}
        >
          <span className="break-all">{profile.email}</span>
          <span
            className={cn(
              'mt-1.5 flex items-center gap-1 text-[11.5px] font-medium',
              profile.emailVerified ? 'text-tone-emerald' : 'text-tone-amber',
            )}
          >
            <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
            {profile.emailVerified
              ? t('profile.personal.verified')
              : t('profile.personal.notVerifiedYet')}
          </span>
        </InfoRow>

        <InfoRow
          icon={Phone}
          label={t('profile.personal.phoneNumber')}
          control="editable"
          hint={profile.phone ? undefined : t('profile.personal.phoneHint')}
        >
          {profile.phone ? <span className="font-medium tabular-nums">{profile.phone}</span> : null}
        </InfoRow>

        <InfoRow
          icon={ImageIcon}
          label={t('profile.personal.profilePhoto')}
          control="editable"
          hint={t('profile.personal.photoHint')}
        >
          {profile.photoUrl ? (
            <span className="font-medium">{t('profile.personal.photoUploaded')}</span>
          ) : (
            <span className="text-muted-foreground/70 italic">
              {t('profile.personal.photoInitials')}
            </span>
          )}
        </InfoRow>
      </dl>
    </SectionCard>
  )
}
