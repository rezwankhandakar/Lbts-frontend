import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { AccessDenied } from '@/components/shared/access-denied'
import { AccountInactive } from '@/components/shared/account-inactive'
import { BrandLogo } from '@/components/shared/brand'
import { ADMIN_ROLE } from '@/lib/roles'
import type { UserRole } from '@/lib/roles'
import { useAuthStore } from '@/stores/use-auth-store'

function FullPageLoader() {
  return (
    <div
      className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background"
      aria-busy="true"
    >
      <div className="relative flex size-24 items-center justify-center">
        {/* Ring carries the motion; the logo stays still so it reads as a
            brand, not a spinner. */}
        <div
          className="absolute inset-0 animate-spin rounded-full border-2 border-primary/15 border-t-primary"
          aria-hidden
        />
        {/* Sized to fill the ring: the logo is the loader, not a small mark
            floating inside one. It follows the theme, so no plate is needed. */}
        <BrandLogo className="h-12" />
      </div>

      <p className="animate-pulse text-xs font-medium tracking-wide text-muted-foreground">
        Loading LBTS…
      </p>
      <span className="sr-only">Checking your session</span>
    </div>
  )
}

/**
 * Blocks the app shell until Firebase has resolved the persisted session.
 * Rendering the redirect while status is still 'loading' would bounce a
 * signed-in user to /sign-in on every refresh.
 */
export function ProtectedRoute() {
  const status = useAuthStore((state) => state.status)
  const profile = useAuthStore((state) => state.profile)
  const location = useLocation()

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />
  }

  /**
   * Every account is created Pending and stays unusable until an Admin
   * approves it, so the shell is not the right thing to show one. A null
   * profile is left alone — that is a first-ever sign-in or a failed sync,
   * not a lifecycle decision.
   */
  if (profile && profile.status !== 'Active') {
    return <AccountInactive status={profile.status} name={profile.name} email={profile.email} />
  }

  return <Outlet />
}

/** Keeps signed-in users out of the auth screens. */
export function PublicOnlyRoute() {
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return <FullPageLoader />
  }

  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  // The auth screens are lazy and render outside AppLayout, so they need their
  // own boundary — there is no shell to keep mounted here.
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Outlet />
    </Suspense>
  )
}

/**
 * Gate for Admin-only routes. Reached by URL as well as by the sidebar, which
 * is exactly why hiding the nav item is not enough — a Manager who types
 * /administration lands here.
 *
 * The role comes from the MongoDB profile in the store, which is refetched on
 * every load and never persisted. It is still only presentation: every
 * administration endpoint re-checks the role server-side.
 */
export function AdminRoute() {
  const status = useAuthStore((state) => state.status)
  const profile = useAuthStore((state) => state.profile)

  // The profile lands one tick after Firebase resolves the session. Rendering
  // the denial in that gap would flash "no access" at a legitimate Admin.
  if (status === 'loading' || (status === 'authenticated' && profile === null)) {
    return <FullPageLoader />
  }

  if (profile?.role !== ADMIN_ROLE) {
    return <AccessDenied area="Administration" />
  }

  return <Outlet />
}

/**
 * Gate for routes a specific set of roles may reach.
 *
 * The same courtesy AdminRoute provides, generalised: each module names its
 * own roles, because CLAUDE.md deliberately has no central permission matrix.
 * It is still only presentation — every endpoint behind it re-checks the role
 * server-side, and that is the check that counts.
 */
export function RoleRoute({ roles, area, reason }: RoleRouteProps) {
  const status = useAuthStore((state) => state.status)
  const profile = useAuthStore((state) => state.profile)

  if (status === 'loading' || (status === 'authenticated' && profile === null)) {
    return <FullPageLoader />
  }

  if (!profile || !roles.includes(profile.role)) {
    return <AccessDenied area={area} reason={reason} />
  }

  return <Outlet />
}

interface RoleRouteProps {
  roles: readonly UserRole[]
  /** What was being reached, phrased for a person: "Gate Pass". */
  area: string
  /** Who the area is for, phrased as a sentence. */
  reason?: string
}
