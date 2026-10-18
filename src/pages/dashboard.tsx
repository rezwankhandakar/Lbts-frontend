import { Navigate } from 'react-router-dom'
import { homePathFor } from '@/app/nav-config'
import { StaffDashboard } from '@/features/dashboard/components/staff-dashboard'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The landing route, and staff only.
 *
 * **A Vendor account has no dashboard.** The business asked for a vendor to
 * see their trips and nothing else, and those are My Vendor — so `/` sends the
 * account there, which is also where signing in lands it. There used to be a
 * vendor dashboard here, trips and money for one vendor in one request; it went
 * with the rest of what a vendor no longer sees.
 */
export function DashboardPage() {
  const home = homePathFor(useCurrentRole())

  if (home !== '/') {
    return <Navigate to={home} replace />
  }

  return <StaffDashboard />
}
