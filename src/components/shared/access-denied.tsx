import { ArrowLeft, ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/use-auth-store'
import { roleMeta } from '@/lib/roles'

interface AccessDeniedProps {
  /** What was being reached, phrased for a person: "Administration". */
  area: string
  /**
   * Who the area *is* for, phrased as a sentence. Every module decides its own
   * roles — CLAUDE.md deliberately has no central permission matrix — so the
   * default only fits Administration, and any other area says its own rule.
   */
  reason?: string
}

/**
 * What a signed-in user sees when their role does not reach a route. It states
 * the rule and the role they actually hold, so the answer is "you need a
 * different role", not "something broke".
 *
 * This is a courtesy, not a control: the API refuses the same request
 * independently, so nothing here is load-bearing for security.
 */
export function AccessDenied({ area, reason }: AccessDeniedProps) {
  const profile = useAuthStore((state) => state.profile)
  const meta = profile ? roleMeta(profile.role) : null

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-2 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <ShieldX className="size-7" aria-hidden />
      </div>

      <h1 className="mt-6 text-xl font-semibold tracking-tight text-balance sm:text-2xl">
        You don't have access to {area}
      </h1>
      <p className="mt-2.5 text-sm leading-relaxed text-pretty text-muted-foreground">
        {reason ?? `${area} is restricted to administrators.`} Ask an Admin if you believe you
        should have access.
      </p>

      {meta && (
        <p className="mt-5 text-xs text-muted-foreground">
          Signed in as{' '}
          <span className="font-medium text-foreground">{profile?.name ?? profile?.email}</span> ·{' '}
          <span className="font-medium text-foreground">{meta.label}</span>
        </p>
      )}

      <Button variant="outline" className="mt-7" render={<Link to="/" />}>
        <ArrowLeft data-icon="inline-start" aria-hidden />
        Back to dashboard
      </Button>
    </div>
  )
}
