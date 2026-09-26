import { LogOut } from 'lucide-react'
import { BrandLockup } from '@/components/shared/brand'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/features/auth/use-sign-out'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { statusMeta } from '@/lib/roles'
import type { UserStatus } from '@/lib/roles'
import { cn } from '@/lib/utils'

interface AccountInactiveProps {
  status: UserStatus
  name: string
  email: string
}

/**
 * The whole app for anyone whose account is not Active. Every new sign-up
 * lands here until an Admin approves it, which is the visible half of the
 * lifecycle the Administration module drives — the API enforces the same rule
 * independently, so this screen is what the rule looks like, not the rule.
 *
 * The wording used to be a `COPY` table beside this component and now lives in
 * the message tree, keyed by status. That matters more here than almost
 * anywhere else in the app: this is the one screen a locked-out account can
 * reach, so it is the one screen that most has to be readable in the reader's
 * own language.
 */
export function AccountInactive({ status, name, email }: AccountInactiveProps) {
  const t = useT()
  const signOut = useSignOut()
  const meta = statusMeta(status, t)
  const Icon = meta.icon

  /**
   * `accountInactive` carries all four statuses including `Active`, so this
   * cannot miss — and if a fifth were ever added to the backend without a
   * matching key, `translateKey` returns the key rather than rendering nothing.
   */
  const title = t(`accountInactive.${status}.title` as TranslationKey)
  const body = t(`accountInactive.${status}.body` as TranslationKey)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-12">
      <BrandLockup />

      <div className="mt-8 w-full max-w-md rounded-xl border bg-card p-7 text-center shadow-sm">
        <div
          className={cn(
            'mx-auto flex size-14 items-center justify-center rounded-2xl ring-1',
            meta.chip,
          )}
        >
          <Icon className="size-6" aria-hidden />
        </div>

        <span
          className={cn(
            'mt-5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold',
            meta.badge,
          )}
        >
          <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden />
          {meta.label}
        </span>

        <h1 className="mt-4 text-lg font-semibold tracking-tight text-balance">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{body}</p>

        <div className="mt-6 border-t pt-5">
          <p className="truncate text-[13px] font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <Button variant="outline" className="mt-4 w-full" onClick={signOut}>
            <LogOut data-icon="inline-start" aria-hidden />
            {t('shell.signOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
