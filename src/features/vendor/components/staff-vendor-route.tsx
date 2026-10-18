import { Navigate, Outlet } from 'react-router-dom'
import { useCurrentRole } from '@/hooks/use-current-role'
import { isVendorScopedRole } from '../types'

/**
 * Keeps a Vendor account on `/my-vendor`.
 *
 * The directory and the details page are the staff view of this module, six
 * tabs deep. A vendor sees their trips and nothing else, and `/my-vendor` is
 * where that is drawn — so a vendor who types `/vendors` or `/vendors/<id>`,
 * their own id included, is sent there rather than shown a workspace the
 * business asked them not to have.
 *
 * Mounted inside the module's `RoleRoute`, which has already waited for the
 * profile, so the role is known by the time this renders. It is presentation:
 * what a vendor may read is still decided by the API from their own profile.
 */
export function StaffVendorRoute() {
  const role = useCurrentRole()

  if (isVendorScopedRole(role)) {
    return <Navigate to="/my-vendor" replace />
  }

  return <Outlet />
}
