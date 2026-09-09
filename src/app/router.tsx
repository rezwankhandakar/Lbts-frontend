import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import {
  AdminRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRoute,
} from '@/components/shared/route-guards'
import { CHALLAN_READ_ROLES, CHALLAN_WRITE_ROLES } from '@/features/challan/types'
import { GATE_PASS_READ_ROLES, GATE_PASS_WRITE_ROLES } from '@/features/gate-pass/types'
import { LOCATION_READ_ROLES } from '@/features/location/types'
import { PRODUCT_RATE_READ_ROLES } from '@/features/product-rate/types'
import { VENDOR_READ_ROLES } from '@/features/vendor/types'
import { DashboardPage } from '@/pages/dashboard'

/**
 * Module routes are lazy-loaded so each ships its own chunk; only the dashboard
 * is eager, since it is the landing route. The layout renders a single
 * <Suspense> boundary inside <main>, so the shell never unmounts while a chunk
 * loads. Pages use named exports, hence the default-mapping in each import.
 */
const GatePassPage = lazy(() =>
  import('@/pages/gate-pass').then((m) => ({ default: m.GatePassPage })),
)
const GatePassNewPage = lazy(() =>
  import('@/pages/gate-pass-new').then((m) => ({ default: m.GatePassNewPage })),
)
const GatePassEditPage = lazy(() =>
  import('@/pages/gate-pass-edit').then((m) => ({ default: m.GatePassEditPage })),
)
const GatePassDetailsPage = lazy(() =>
  import('@/pages/gate-pass-details').then((m) => ({ default: m.GatePassDetailsPage })),
)
const ChallanPage = lazy(() => import('@/pages/challan').then((m) => ({ default: m.ChallanPage })))
/**
 * The entry workspace is the one route in the app that carries a PDF renderer,
 * so it gets a chunk of its own. Nothing else in Challan — the list, the
 * details page, the batch page — loads pdf.js, because reading a finished
 * challan only needs the browser's own viewer.
 */
const ChallanNewPage = lazy(() =>
  import('@/pages/challan-new').then((m) => ({ default: m.ChallanNewPage })),
)
const ChallanDetailsPage = lazy(() =>
  import('@/pages/challan-details').then((m) => ({ default: m.ChallanDetailsPage })),
)
const ChallanEditPage = lazy(() =>
  import('@/pages/challan-edit').then((m) => ({ default: m.ChallanEditPage })),
)
const ChallanBatchPage = lazy(() =>
  import('@/pages/challan-batch').then((m) => ({ default: m.ChallanBatchPage })),
)
const ChallanBatchesPage = lazy(() =>
  import('@/pages/challan-batches').then((m) => ({ default: m.ChallanBatchesPage })),
)
const ChallanLocationPage = lazy(() =>
  import('@/pages/challan-location').then((m) => ({ default: m.ChallanLocationPage })),
)
const LocationsPage = lazy(() =>
  import('@/pages/locations').then((m) => ({ default: m.LocationsPage })),
)
const ProductRatesPage = lazy(() =>
  import('@/pages/product-rates').then((m) => ({ default: m.ProductRatesPage })),
)
const VendorsPage = lazy(() => import('@/pages/vendors').then((m) => ({ default: m.VendorsPage })))
const VendorDetailsPage = lazy(() =>
  import('@/pages/vendor-details').then((m) => ({ default: m.VendorDetailsPage })),
)
/**
 * The vendor account's own record. Its own route rather than a redirect into
 * `/vendors/:id`, because it needs no id: the server reads the link off the
 * profile, so there is nothing in the URL for a vendor user to edit.
 */
const MyVendorPage = lazy(() =>
  import('@/pages/my-vendor').then((m) => ({ default: m.MyVendorPage })),
)
const AdministrationPage = lazy(() =>
  import('@/pages/administration').then((m) => ({ default: m.AdministrationPage })),
)
const ProfilePage = lazy(() => import('@/pages/profile').then((m) => ({ default: m.ProfilePage })))
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/not-found').then((m) => ({ default: m.NotFoundPage })),
)
const SignInPage = lazy(() => import('@/pages/sign-in').then((m) => ({ default: m.SignInPage })))
const SignUpPage = lazy(() => import('@/pages/sign-up').then((m) => ({ default: m.SignUpPage })))
const ForgotPasswordPage = lazy(() =>
  import('@/pages/forgot-password').then((m) => ({ default: m.ForgotPasswordPage })),
)

/**
 * Wording for the two Gate Pass boundaries. Kept beside the routes that use
 * them so the sentence and the role list cannot drift apart.
 */
const GATE_PASS_ACCESS_REASON =
  'Gate Pass records the transport operation, and is open to Admin, Manager, CEO and Operation Executive accounts.'
const GATE_PASS_WRITE_REASON =
  'Filing a gate pass is done by Admin, Manager and Operation Executive accounts.'

/**
 * Wording for the two Challan boundaries. Kept beside the routes that use them
 * so the sentence and the role list cannot drift apart.
 */
const CHALLAN_ACCESS_REASON =
  'Challan records deliveries from the corporate office, and is open to Admin, Manager, CEO and Operation Executive accounts.'
const CHALLAN_WRITE_REASON =
  'Filing a challan is done by Admin, Manager and Operation Executive accounts.'

/**
 * The Location master list has one boundary here rather than two: reading it
 * is open to everyone Challan is, and changing it is Admin-only — enforced per
 * endpoint by the API rather than per route, because the same page serves both
 * audiences with the write controls simply absent.
 */
const LOCATION_ACCESS_REASON =
  'The location master list is the reference every challan is classified against, and is open to Admin, Manager, CEO and Operation Executive accounts.'

/**
 * The rate card has the same single boundary as the location master, and for
 * the same reason: the entry form reads it, so everyone who files a challan
 * needs it, and only the write endpoints are Admin-only.
 */
const PRODUCT_RATE_ACCESS_REASON =
  'The product rate card is what every challan line is charged from, and is open to Admin, Manager, CEO and Operation Executive accounts.'

/**
 * Vendors has one boundary here, and it is the widest in the app: every role
 * can reach it, `Vendor` included. That is not a gap — a Vendor account's view
 * is narrowed to its own vendor by the API, from the account's own profile, and
 * no URL it can type widens that. Writing is Admin and Manager, enforced per
 * endpoint rather than per route, because the same page serves both audiences
 * with the write controls simply absent.
 */
const VENDOR_ACCESS_REASON =
  'Vendors, their vehicles, their drivers and their compliance documents. Staff accounts see every vendor; a vendor account sees its own.'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* Gate Pass is the operation's own paperwork: every role except
              Vendor reads it, and CEO reads without writing. The roles come
              from the module rather than a central matrix, and the API
              re-checks every one of them. */}
          <Route element={<RoleRoute roles={GATE_PASS_READ_ROLES} area="Gate Pass" reason={GATE_PASS_ACCESS_REASON} />}>
            <Route path="/gate-pass" element={<GatePassPage />} />
            <Route path="/gate-pass/:id" element={<GatePassDetailsPage />} />

            <Route element={<RoleRoute roles={GATE_PASS_WRITE_ROLES} area="Gate Pass" reason={GATE_PASS_WRITE_REASON} />}>
              <Route path="/gate-pass/new" element={<GatePassNewPage />} />
              <Route path="/gate-pass/:id/edit" element={<GatePassEditPage />} />
            </Route>
          </Route>

          {/* Challan is the corporate office's paperwork: every role except
              Vendor reads it, and CEO reads without writing. A challan carries
              a customer's home address, which is why Vendor is out entirely.
              The roles come from the module rather than a central matrix, and
              the API re-checks every one of them. */}
          <Route
            element={
              <RoleRoute
                roles={CHALLAN_READ_ROLES}
                area="Challan"
                reason={CHALLAN_ACCESS_REASON}
              />
            }
          >
            <Route path="/challan" element={<ChallanPage />} />
            {/* Declared beside `/challan/:id` rather than before it: React
                Router ranks a static segment above a dynamic one, so
                `/challan/batches` cannot be swallowed as a challan id — the
                same arrangement `/challan/new` already relies on. */}
            <Route path="/challan/batches" element={<ChallanBatchesPage />} />
            <Route path="/challan/:id" element={<ChallanDetailsPage />} />
            <Route path="/challan/batch/:batchId" element={<ChallanBatchPage />} />

            <Route
              element={
                <RoleRoute
                  roles={CHALLAN_WRITE_ROLES}
                  area="Challan"
                  reason={CHALLAN_WRITE_REASON}
                />
              }
            >
              <Route path="/challan/new" element={<ChallanNewPage />} />
              <Route path="/challan/:id/edit" element={<ChallanEditPage />} />
              {/* Settling a location is a write, so it sits behind the write
                  roles rather than the read ones: a CEO reads every challan
                  here and decides none of them. */}
              <Route path="/challan/:id/location" element={<ChallanLocationPage />} />
            </Route>
          </Route>

          {/* The district and thana master list. Open to read for everyone
              Challan is open to — an operator looks up what a delivery is
              classified as — and Admin-only to change, which the API enforces
              per endpoint rather than per route. */}
          <Route
            element={
              <RoleRoute
                roles={LOCATION_READ_ROLES}
                area="Locations"
                reason={LOCATION_ACCESS_REASON}
              />
            }
          >
            <Route path="/locations" element={<LocationsPage />} />
          </Route>

          {/* The product rate card. The same boundary the location master has,
              and for the same reason: reading it is open to everyone Challan
              is open to, because the entry form offers product names off it,
              and changing it is Admin-only — enforced per endpoint by the API
              rather than per route, because the same page serves both
              audiences with the write controls simply absent. */}
          <Route
            element={
              <RoleRoute
                roles={PRODUCT_RATE_READ_ROLES}
                area="Product Rates"
                reason={PRODUCT_RATE_ACCESS_REASON}
              />
            }
          >
            <Route path="/product-rates" element={<ProductRatesPage />} />
          </Route>

          {/* Vendors. Every role reaches this, `Vendor` included — what differs
              is scope, and scope is the server's decision from the account's own
              profile rather than anything a route can express. `/my-vendor` is
              the same workspace without an id, which is what makes it impossible
              for a vendor account to point at another vendor's record. */}
          <Route
            element={
              <RoleRoute
                roles={VENDOR_READ_ROLES}
                area="Vendors"
                reason={VENDOR_ACCESS_REASON}
              />
            }
          >
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/vendors/:id" element={<VendorDetailsPage />} />
            <Route path="/my-vendor" element={<MyVendorPage />} />
          </Route>

          {/* Reached from the account menu rather than the sidebar: it is
              every user's own account, not a destination in the business. */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Admin-only. The guard nests inside the layout so a denied user
              still gets the shell, not a bare page. */}
          <Route element={<AdminRoute />}>
            <Route path="/administration" element={<AdministrationPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
