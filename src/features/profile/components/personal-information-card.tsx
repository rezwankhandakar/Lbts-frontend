import { BadgeCheck, ImageIcon, Mail, PencilLine, Phone, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  return (
    <SectionCard
      icon={UserRound}
      tone="indigo"
      title="Personal information"
      description="Details you maintain yourself"
      action={
        <Button variant="outline" size="sm" onClick={onEdit}>
          <PencilLine data-icon="inline-start" aria-hidden />
          Edit
        </Button>
      }
      footnote="Your name and phone number are yours to change. Email is managed by the sign-in provider."
    >
      <dl>
        <InfoRow icon={UserRound} label="Full name" control="editable">
          <span className="font-medium">{profile.name}</span>
        </InfoRow>

        <InfoRow
          icon={Mail}
          label="Email address"
          control="locked"
          controlHint="Managed by the sign-in provider"
        >
          <span className="break-all">{profile.email}</span>
          <span
            className={cn(
              'mt-1.5 flex items-center gap-1 text-[11.5px] font-medium',
              profile.emailVerified ? 'text-tone-emerald' : 'text-tone-amber',
            )}
          >
            <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
            {profile.emailVerified ? 'Verified' : 'Not verified yet'}
          </span>
        </InfoRow>

        <InfoRow
          icon={Phone}
          label="Phone number"
          control="editable"
          hint={profile.phone ? undefined : 'Add a number so colleagues can reach you.'}
        >
          {profile.phone ? <span className="font-medium tabular-nums">{profile.phone}</span> : null}
        </InfoRow>

        <InfoRow
          icon={ImageIcon}
          label="Profile photo"
          control="editable"
          hint="Change it from the photo control at the top of this page."
        >
          {profile.photoUrl ? (
            <span className="font-medium">Uploaded</span>
          ) : (
            <span className="text-muted-foreground/70 italic">
              Using your initials — no photo uploaded
            </span>
          )}
        </InfoRow>
      </dl>
    </SectionCard>
  )
}
