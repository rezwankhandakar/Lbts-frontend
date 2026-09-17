import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ACCOUNTS_READ_ROLES } from '@/features/accounts/types'
import { BILL_READ_ROLES } from '@/features/bill/types'
import {
  AdminRoute,
  ProtectedRoute,
  PublicOnlyRoute,
  RoleRoute,
} from '@/components/shared/route-guards'
import { CHALLAN_READ_ROLES, CHALLAN_WRITE_ROLES } from '@/features/challan/types'
import { DELIVERY_READ_ROLES, DELIVERY_WRITE_ROLES } from '@/features/delivery/types'
import { GATE_PASS_READ_ROLES, GATE_PASS_WRITE_ROLES } from '@/features/gate-pass/types'
import { LOCATION_READ_ROLES } from '@/features/location/types'
import { PRODUCT_RATE_READ_ROLES } from '@/features/product-rate/types'
import { TRIP_DO_READ_ROLES } from '@/features/trip-do/types'
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
const DeliveryPage = lazy(() =>
  import('@/pages/delivery').then((m) => ({ default: m.DeliveryPage })),
)
const DeliveryNewPage = lazy(() =>
  import('@/pages/delivery-new').then((m) => ({ default: m.DeliveryNewPage })),
)
const DeliveryDetailsPage = lazy(() =>
  import('@/pages/delivery-details').then((m) => ({ default: m.DeliveryDetailsPage })),
)
const DeliveryEditPage = lazy(() =>
  import('@/pages/delivery-edit').then((m) => ({ default: m.DeliveryEditPage })),
)
const DeliveryCompletionPage = lazy(() =>
  import('@/pages/delivery-completion').then((m) => ({ default: m.DeliveryCompletionPage })),
)
const TripDoPage = lazy(() => import('@/pages/trip-do').then((m) => ({ default: m.TripDoPage })))
/** Accounts: one chunk per page, like every other module. */
const AccountsPage = lazy(() => import('@/pages/accounts').then((m) => ({ default: m.AccountsPage })))
const AccountsCashPage = lazy(() => import('@/pages/accounts-cash').then((m) => ({ default: m.AccountsCashPage })))
const AccountsCashBookPage = lazy(() => import('@/pages/accounts-cash-book').then((m) => ({ default: m.AccountsCashBookPage })))
const AccountsVendorBillsPage = lazy(() => import('@/pages/accounts-vendor-bills').then((m) => ({ default: m.AccountsVendorBillsPage })))
const AccountsVendorBillPage = lazy(() => import('@/pages/accounts-vendor-bill').then((m) => ({ default: m.AccountsVendorBillPage })))
const AccountsAdvancesPage = lazy(() => import('@/pages/accounts-advances').then((m) => ({ default: m.AccountsAdvancesPage })))
const AccountsExpensesPage = lazy(() => import('@/pages/accounts-expenses').then((m) => ({ default: m.AccountsExpensesPage })))
const AccountsFinalBillsPage = lazy(() => import('@/pages/accounts-final-bills').then((m) => ({ default: m.AccountsFinalBillsPage })))
const AccountsProfitLossPage = lazy(() => import('@/pages/accounts-profit-loss').then((m) => ({ default: m.AccountsProfitLossPage })))
const AccountsWalletsPage = lazy(() => import('@/pages/accounts-wallets').then((m) => ({ default: m.AccountsWalletsPage })))
const BillsPage = lazy(() => import('@/pages/bills').then((m) => ({ default: m.BillsPage })))
const BillDetailsPage = lazy(() =>
  import('@/pages/bill-details').then((m) => ({ default: m.BillDetailsPage })),
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
 * Wording for the two Delivery boundaries. A trip carries every challan on it,
 * customer addresses included, which is why Vendor is out even though a trip
 * is assigned to a vendor.
 */
const DELIVERY_ACCESS_REASON =
  'Deliveries record which challans went out on which vehicle, and are open to Admin, Manager, CEO and Operation Executive accounts.'
const DELIVERY_WRITE_REASON =
  'Building and correcting a trip is done by Admin, Manager and Operation Executive accounts.'

/**
 * One boundary: the same page serves readers and writers, with the write
 * controls simply absent for a CEO.
 */
const TRIP_DO_ACCESS_REASON =
  'The Trip DO sheet matches challan product lines to gate passes, and is open to Admin, Manager, CEO and Operation Executive accounts.'

/**
 * One boundary, like the Trip DO sheet a bill is built from: the same pages
 * serve readers and writers, with the write controls absent for a CEO.
 */
/** Accounts is the office's money: read by Admin, Manager and CEO, kept by Admin and Manager per endpoint. */
const ACCOUNTS_ACCESS_REASON =
  'Accounts holds the office\'s balances, payments and profit, and is open to Admin, Manager and CEO accounts.'

const BILL_ACCESS_REASON =
  'Bills charge a unit for its Trip DOs, and are open to Admin, Manager, CEO and Operation Executive accounts.'

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

          {/* Delivery: trips, and the challans on each. The same audience as
              Challan, and for the same reason — a trip carries customer
              addresses. `/delivery/new` is static and ranks above
              `/delivery/:id`, the arrangement `/challan/new` relies on. */}
          <Route
            element={
              <RoleRoute
                roles={DELIVERY_READ_ROLES}
                area="Delivery"
                reason={DELIVERY_ACCESS_REASON}
              />
            }
          >
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/delivery/:id" element={<DeliveryDetailsPage />} />
            {/* One challan's delivery, completed: what came back, which floor
                it went up to, what was hired to get it there, and the signed
                copy that ends it. A read role may open it — a CEO looking at
                what a delivery cost — and the write controls are absent
                rather than disabled, the rule /my-vendor follows. */}
            <Route
              path="/delivery/:id/challans/:challanId"
              element={<DeliveryCompletionPage />}
            />

            <Route
              element={
                <RoleRoute
                  roles={DELIVERY_WRITE_ROLES}
                  area="Delivery"
                  reason={DELIVERY_WRITE_REASON}
                />
              }
            >
              <Route path="/delivery/new" element={<DeliveryNewPage />} />
              <Route path="/delivery/:id/edit" element={<DeliveryEditPage />} />
            </Route>
          </Route>

          {/* The Trip DO sheet: challan product lines matched to gate pass
              lines. Challans and gate passes side by side, so it takes the
              audience both share — Vendor is out, because every row carries
              a customer's address. Writing is checked per endpoint. */}
          <Route
            element={
              <RoleRoute
                roles={TRIP_DO_READ_ROLES}
                area="Trip DO"
                reason={TRIP_DO_ACCESS_REASON}
              />
            }
          >
            <Route path="/trip-do" element={<TripDoPage />} />
          </Route>

          {/* Excel bills: a unit's month of Trip DO rows. The Trip DO sheet's
              audience, for its reason — every row carries a customer's
              address. Preparing and finalizing are checked per endpoint. */}
          <Route
            element={
              <RoleRoute
                roles={BILL_READ_ROLES}
                area="Excel Bill"
                reason={BILL_ACCESS_REASON}
              />
            }
          >
            <Route path="/bills" element={<BillsPage />} />
            <Route path="/bills/:id" element={<BillDetailsPage />} />
          </Route>

          {/* Accounts: the office's money. Narrower than any operating
              module — CEO reads, Admin and Manager keep the books, which the
              API enforces per endpoint. */}
          <Route
            element={
              <RoleRoute
                roles={ACCOUNTS_READ_ROLES}
                area="Accounts"
                reason={ACCOUNTS_ACCESS_REASON}
              />
            }
          >
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/accounts/cash" element={<AccountsCashPage />} />
            <Route path="/accounts/cash-book" element={<AccountsCashBookPage />} />
            <Route path="/accounts/vendor-bills" element={<AccountsVendorBillsPage />} />
            <Route path="/accounts/vendor-bills/:vendorId" element={<AccountsVendorBillPage />} />
            <Route path="/accounts/advances" element={<AccountsAdvancesPage />} />
            <Route path="/accounts/expenses" element={<AccountsExpensesPage />} />
            <Route path="/accounts/final-bills" element={<AccountsFinalBillsPage />} />
            <Route path="/accounts/profit-loss" element={<AccountsProfitLossPage />} />
            <Route path="/accounts/wallets" element={<AccountsWalletsPage />} />
            {/* The Wallets tab was called Settings; an old link still lands on it. */}
            <Route path="/accounts/settings" element={<Navigate to="/accounts/wallets" replace />} />
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
