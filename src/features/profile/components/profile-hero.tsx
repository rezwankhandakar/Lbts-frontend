import { CalendarDays, Mail, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserRoleBadge } from '@/components/shared/user-role-badge'
import { UserStatusBadge } from '@/components/shared/user-status-badge'
import { formatMonthYear } from '@/lib/format'
import type { UserProfile } from '@/stores/use-auth-store'
import { AvatarUploader } from './avatar-uploader'

interface ProfileHeroProps {
  profile: UserProfile
  onEdit: () => void
}

/**
 * The account at a glance: who you are, what you are to the business, and
 * whether the account is usable — the three answers someone opens this page
 * for, above the fold and before any panel.
 *
 * The brand band is the only large expanse of colour on the page. It earns its
 * place by giving the identity a surface to sit on; everything below it stays
 * on the neutral card so the information keeps the attention.
 */
export function ProfileHero({ profile, onEdit }: ProfileHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative h-24 bg-gradient-to-r from-brand-from via-primary to-brand-to sm:h-28">
        {/* Faint dot field for texture — a flat gradient reads as a placeholder. */}
        <div
          className="absolute inset-0 [background-image:radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.35)_1px,transparent_0)] [background-size:16px_16px] opacity-50"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-card/30 to-transparent"
          aria-hidden
        />
      </div>

      <div className="px-4 pb-5 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            {/* Lifted over the band, which is what makes the header read as one
                object rather than a strip with a card under it. The row aligns
                on its start edge, so the name settles beside the avatar rather
                than beside the photo controls hanging below it. */}
            <div className="-mt-14 shrink-0 sm:-mt-16">
              <AvatarUploader name={profile.name} photoUrl={profile.photoUrl} />
            </div>

            <div className="min-w-0 sm:pt-1">
              <h2 className="truncate font-heading text-xl font-semibold tracking-tight sm:text-2xl">
                {profile.name}
              </h2>

              <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground">
                <Mail className="size-3.5 shrink-0" aria-hidden />
                <span className="truncate">{profile.email}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <UserRoleBadge role={profile.role} />
                <UserStatusBadge status={profile.status} />
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2 py-0.5 text-xs font-medium whitespace-nowrap text-muted-foreground">
                  <CalendarDays className="size-3.5 shrink-0" aria-hidden />
                  Member since {formatMonthYear(profile.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <Button
            size="lg"
            onClick={onEdit}
            className="w-full shrink-0 shadow-sm sm:mt-1 sm:w-auto"
          >
            <PencilLine data-icon="inline-start" aria-hidden />
            Edit profile
          </Button>
        </div>
      </div>
    </section>
  )
}
