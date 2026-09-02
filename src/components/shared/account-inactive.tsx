import { LogOut } from 'lucide-react'
import { BrandLockup } from '@/components/shared/brand'
import { Button } from '@/components/ui/button'
import { useSignOut } from '@/features/auth/use-sign-out'
import { statusMeta } from '@/lib/roles'
import type { UserStatus } from '@/lib/roles'
import { cn } from '@/lib/utils'

interface AccountInactiveProps {
  status: UserStatus
  name: string
  email: string
}

const COPY: Record<UserStatus, { title: string; body: string }> = {
  Pending: {
    title: 'Your account is awaiting approval',
    body: 'An administrator has to approve this account before you can use LBTS. You will be able to sign in as soon as that happens.',
  },
  Rejected: {
    title: 'Your account request was declined',
    body: 'An administrator declined access for this account. Contact them if you believe this is a mistake.',
  },
  Suspended: {
    title: 'Your account has been suspended',
    body: 'Access has been withdrawn for this account. An administrator can reactivate it.',
  },
  Active: {
    title: 'Your account is active',
    body: 'This account is in good standing.',
  },
}

/**
 * The whole app for anyone whose account is not Active. Every new sign-up
 * lands here until an Admin approves it, which is the visible half of the
 * lifecycle the Administration module drives — the API enforces the same rule
 * independently, so this screen is what the rule looks like, not the rule.
 */
export function AccountInactive({ status, name, email }: AccountInactiveProps) {
  const signOut = useSignOut()
  const meta = statusMeta(status)
  const copy = COPY[status] ?? COPY.Pending
  const Icon = meta.icon

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

        <h1 className="mt-4 text-lg font-semibold tracking-tight text-balance">{copy.title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          {copy.body}
        </p>

        <div className="mt-6 border-t pt-5">
          <p className="truncate text-[13px] font-medium">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <Button variant="outline" className="mt-4 w-full" onClick={signOut}>
            <LogOut data-icon="inline-start" aria-hidden />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  )
}
