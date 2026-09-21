import { lazy } from 'react'
import { StaffDashboard } from '@/features/dashboard/components/staff-dashboard'
import { isVendorScopedRole } from '@/features/vendor/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The one lazy import on an otherwise eager page, and it earns it.
 *
 * The dashboard is the app's only eager route, so anything reached from it
 * straight is downloaded by every account on first load. This branch is for one
 * role and pulls a chart, a detail sheet and the vendor trip vocabulary behind
 * it — none of which an Admin, a Manager, a CEO or an OpEx will ever render. It
 * resolves through the single `<Suspense>` inside `<main>`, so the sidebar and
 * header stay mounted while the chunk arrives.
 */
const VendorDashboard = lazy(() =>
  import('@/features/vendor/components/vendor-dashboard').then((m) => ({
    default: m.VendorDashboard,
  })),
)

/**
 * The route, and deliberately nothing more than the fork.
 *
 * **A Vendor account gets a different page entirely, and that is the honest
 * shape rather than a special case.** Every module that contributes to the
 * staff dashboard is closed to a vendor — each one carries a customer's
 * address and phone number — so the staff page would be a set of headings
 * above nothing. What a vendor has instead is their own trips, and those are a
 * page rather than a card among none.
 *
 * Everything each side draws belongs to its own feature folder: the staff
 * overview to `features/dashboard/`, the vendor one to `features/vendor/`.
 * This file only decides which.
 */
export function DashboardPage() {
  const role = useCurrentRole()

  return isVendorScopedRole(role) ? <VendorDashboard /> : <StaffDashboard />
}
