import { BadgeCheck, KeyRound, Loader2, MailCheck, ShieldAlert, Send } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UserProfile } from '@/stores/use-auth-store'
import { useEmailVerification } from '../use-email-verification'
import { SectionCard } from './section-card'

interface SecurityCardProps {
  profile: UserProfile
  /** How this account signs in, e.g. ["Google"]. */
  providers: string[]
  canChangePassword: boolean
  onChangePassword: () => void
}

interface SecurityItemProps {
  icon: LucideIcon
  title: string
  description: ReactNode
  tone?: 'neutral' | 'warning' | 'positive'
  action: ReactNode
}

const TONES = {
  neutral: 'bg-muted text-muted-foreground',
  positive: 'bg-tone-emerald/10 text-tone-emerald',
  warning: 'bg-tone-amber/10 text-tone-amber',
} as const

function SecurityItem({
  icon: Icon,
  title,
  description,
  tone = 'neutral',
  action,
}: SecurityItemProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border/60 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', TONES[tone])}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] leading-snug font-semibold">{title}</p>
          <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</div>
        </div>
      </div>
      <div className="shrink-0 sm:pl-3">{action}</div>
    </div>
  )
}

/**
 * Sign-in security, all of it owned by Firebase.
 *
 * Nothing on this card writes to MongoDB, and no password ever reaches the
 * LBTS API — the password is changed through the identity provider that stores
 * it, and the verification email is sent by the same. This card only shows the
 * state and offers the action.
 *
 * An account that signed in with Google has no password here to change, so it
 * is told where its credential actually lives instead of being offered a form
 * that could only fail.
 */
export function SecurityCard({
  profile,
  providers,
  canChangePassword,
  onChangePassword,
}: SecurityCardProps) {
  const verification = useEmailVerification()
  const cooling = verification.cooldown > 0

  return (
    <SectionCard
      icon={KeyRound}
      tone="emerald"
      title="Security"
      description="How you sign in to LBTS"
      footnote={
        providers.length > 0
          ? `Sign-in method: ${providers.join(', ')}. Passwords are stored by the authentication provider, never by LBTS.`
          : 'Passwords are stored by the authentication provider, never by LBTS.'
      }
    >
      <div>
        <SecurityItem
          icon={KeyRound}
          title="Password"
          description={
            canChangePassword ? (
              <>
                <span className="font-mono tracking-widest" aria-hidden>
                  ••••••••••
                </span>
                <span className="sr-only">Your password is hidden.</span>
                <span className="mt-0.5 block">
                  You will be asked for your current password to confirm the change.
                </span>
              </>
            ) : (
              `Your credential is held by ${providers.join(' and ') || 'your sign-in provider'}. Change it there, and it changes here.`
            )
          }
          action={
            canChangePassword ? (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                onClick={onChangePassword}
              >
                <KeyRound data-icon="inline-start" aria-hidden />
                Change password
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                <ShieldAlert className="size-3.5" aria-hidden />
                Managed externally
              </span>
            )
          }
        />

        <SecurityItem
          icon={profile.emailVerified ? BadgeCheck : MailCheck}
          tone={profile.emailVerified ? 'positive' : 'warning'}
          title={profile.emailVerified ? 'Email verified' : 'Email not verified'}
          description={
            profile.emailVerified
              ? `${profile.email} is confirmed. Password resets and account notices reach you.`
              : `We could not confirm ${profile.email} yet. Verify it so password resets can reach you.`
          }
          action={
            profile.emailVerified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-tone-emerald/25 bg-tone-emerald/10 px-2.5 py-1 text-xs font-semibold text-tone-emerald">
                <BadgeCheck className="size-3.5" aria-hidden />
                Verified
              </span>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                disabled={verification.isSending || cooling}
                onClick={() => void verification.resend()}
              >
                {verification.isSending ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
                ) : (
                  <Send data-icon="inline-start" aria-hidden />
                )}
                {cooling ? `Resend in ${verification.cooldown}s` : 'Send verification email'}
              </Button>
            )
          }
        />
      </div>
    </SectionCard>
  )
}
