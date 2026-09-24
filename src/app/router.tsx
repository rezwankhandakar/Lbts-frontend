import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { ACCOUNTS_READ_ROLES } from '@/features/accounts/types'
import { ACTIVITY_READ_ROLES } from '@/features/activity/types'
import { BILL_READ_ROLES } from '@/features/bill/types'
import { LABOUR_BILL_READ_ROLES } from '@/features/labour-bill/types'
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
const AccountsLabourBillsPage = lazy(() => import('@/pages/accounts-labour-bills').then((m) => ({ default: m.AccountsLabourBillsPage })))
const AccountsLabourBillPage = lazy(() => import('@/pages/accounts-labour-bill').then((m) => ({ default: m.AccountsLabourBillPage })))
const AccountsProfitLossPage = lazy(() => import('@/pages/accounts-profit-loss').then((m) => ({ default: m.AccountsProfitLossPage })))
const AccountsWalletsPage = lazy(() => import('@/pages/accounts-wallets').then((m) => ({ default: m.AccountsWalletsPage })))
const BillsPage = lazy(() => import('@/pages/bills').then((m) => ({ default: m.BillsPage })))
const BillDetailsPage = lazy(() =>
  import('@/pages/bill-details').then((m) => ({ default: m.BillDetailsPage })),
)
const LabourBillsPage = lazy(() =>
  import('@/pages/labour-bills').then((m) => ({ default: m.LabourBillsPage })),
)
const LabourBillDetailsPage = lazy(() =>
  import('@/pages/labour-bill-details').then((m) => ({ default: m.LabourBillDetailsPage })),
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
const ActivityPage = lazy(() =>
  import('@/pages/activity').then((m) => ({ default: m.ActivityPage })),
)
const ProfilePage = lazy(() => import('@/pages/profile').then((m) => ({ default: m.ProfilePage })))
const NotificationsPage = lazy(() =>
  import('@/pages/notifications').then((m) => ({ default: m.NotificationsPage })),
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
 * Wording for the Gate Pass boundaries. Kept beside the routes that use them
 * so the sentence and the role list cannot drift apart.
 *
 * Read and write are the same four roles now, so the second sentence exists
 * only for the day they part company again.
 */
const GATE_PASS_ACCESS_REASON =
  'Gate Pass records the transport operation, and is open to Admin, Manager, CEO and Operation Executive accounts.'
const GATE_PASS_WRITE_REASON =
  'Filing a gate pass is done by Admin, Manager, CEO and Operation Executive accounts.'

/**
 * Wording for the Challan boundaries. Kept beside the routes that use them
 * so the sentence and the role list cannot drift apart.
 */
const CHALLAN_ACCESS_REASON =
  'Challan records deliveries from the corporate office, and is open to Admin, Manager, CEO and Operation Executive accounts.'
const CHALLAN_WRITE_REASON =
  'Filing a challan is done by Admin, Manager, CEO and Operation Executive accounts.'

/**
 * Wording for the Delivery boundaries. A trip carries every challan on it,
 * customer addresses included, which is why Vendor is out even though a trip
 * is assigned to a vendor.
 */
const DELIVERY_ACCESS_REASON =
  'Deliveries record which challans went out on which vehicle, and are open to Admin, Manager, CEO and Operation Executive accounts.'
const DELIVERY_WRITE_REASON =
  'Building and correcting a trip is done by Admin, Manager, CEO and Operation Executive accounts.'

/**
 * One boundary: the same page serves readers and writers, with the linking
 * controls absent for everyone but an Admin.
 */
const TRIP_DO_ACCESS_REASON =
  'The Trip DO sheet matches challan product lines to gate passes, and is open to Admin, Manager, CEO and Operation Executive accounts. Only an Admin changes it.'

/** Accounts is the office's money: read by Admin, Manager and CEO, kept by Manager alone per endpoint. */
const ACCOUNTS_ACCESS_REASON =
  'Accounts holds the office\'s balances, payments and profit, and is open to Admin, Manager and CEO accounts.'

/**
 * One boundary, like the Trip DO sheet a bill is built from: the same pages
 * serve readers and writers, with the preparing controls absent for everyone
 * but an Admin.
 */
const BILL_ACCESS_REASON =
  'Bills charge a unit for its Trip DOs, and are open to Admin, Manager, CEO and Operation Executive accounts. Only an Admin prepares one.'

/**
 * The Walton Labour Bill has the Trip DO sheet's audience too, and for the
 * sheet's reason — every row carries a customer's address and a receiver's
 * number. Unlike the Excel Bill beside it, every one of those roles writes:
 * it charges typed figures and claims no sheet row from anybody.
 */
const LABOUR_BILL_ACCESS_REASON =
  'Walton Labour Bills charge the handling on each delivery, and are open to Admin, Manager, CEO and Operation Executive accounts.'

/**
 * The Location master list is Admin-only, page and controls alike. The
 * district and thana lookups the Challan entry form runs are separate
 * endpoints with a wider audience, so closing this page costs nobody a
 * location on a challan.
 */
const LOCATION_ACCESS_REASON =
  'The location master list is reference data the whole operation is classified against, and only an Admin account may open it.'

/**
 * The rate card is Admin-only for a sharper reason than the location master:
 * a rate is money. Its model and product lookups are separate endpoints with
 * the Challan audience, so a challan still prices itself for whoever files it.
 */
const PRODUCT_RATE_ACCESS_REASON =
  'The product rate card sets what every delivery is charged, and only an Admin account may open it.'

/**
 * Vendors has one boundary here, and it is the widest in the app: every role
 * can reach it, `Vendor` included. That is not a gap — a Vendor account's view
 * is narrowed to its own vendor by the API, from the account's own profile, and
 * no URL it can type widens that. Every staff role writes; only the Vendor
 * account is read-only, enforced per endpoint rather than per route, because
 * the same page serves both audiences with the write controls simply absent.
 */
const VENDOR_ACCESS_REASON =
  'Vendors, their vehicles, their drivers and their compliance documents. Staff accounts see every vendor; a vendor account sees its own.'

/**
 * The journal spans every module, so it carries what Accounts carries — and
 * takes Accounts' audience for that reason. There is no write boundary to
 * express here, because nothing writes: rows are appended by services and by
 * nothing a request can reach.
 */
const ACTIVITY_ACCESS_REASON =
  'Activity Logs record who did what across every module, and are open to Admin, Manager and CEO accounts.'

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
              Vendor both reads and writes it. The roles come from the module
              rather than a central matrix, and the API re-checks every one of
              them. */}
          <Route element={<RoleRoute roles={GATE_PASS_READ_ROLES} area="Gate Pass" reason={GATE_PASS_ACCESS_REASON} />}>
            <Route path="/gate-pass" element={<GatePassPage />} />
            <Route path="/gate-pass/:id" element={<GatePassDetailsPage />} />

            <Route element={<RoleRoute roles={GATE_PASS_WRITE_ROLES} area="Gate Pass" reason={GATE_PASS_WRITE_REASON} />}>
              <Route path="/gate-pass/new" element={<GatePassNewPage />} />
              <Route path="/gate-pass/:id/edit" element={<GatePassEditPage />} />
            </Route>
          </Route>

          {/* Challan is the corporate office's paperwork: every role except
              Vendor both reads and writes it. A challan carries a customer's
              home address, which is why Vendor is out entirely. The roles
              come from the module rather than a central matrix, and the API
              re-checks every one of them. */}
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

          {/* Walton Labour Bills: a month of scanned challans and what the
              handling on each model cost. The Trip DO sheet's audience, for its
              reason. Scanning, typing and finalizing are checked per endpoint. */}
          <Route
            element={
              <RoleRoute
                roles={LABOUR_BILL_READ_ROLES}
                area="Walton Labour Bill"
                reason={LABOUR_BILL_ACCESS_REASON}
              />
            }
          >
            <Route path="/labour-bills" element={<LabourBillsPage />} />
            <Route path="/labour-bills/:id" element={<LabourBillDetailsPage />} />
          </Route>

          {/* Accounts: the office's money. Narrower than any operating
              module — Admin and CEO read, Manager alone keeps the books,
              which the API enforces per endpoint. */}
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
            {/* The labour receivable: months, then the CSDs each is paid on. */}
            <Route path="/accounts/labour-bills" element={<AccountsLabourBillsPage />} />
            <Route path="/accounts/labour-bills/:id" element={<AccountsLabourBillPage />} />
            <Route path="/accounts/profit-loss" element={<AccountsProfitLossPage />} />
            <Route path="/accounts/wallets" element={<AccountsWalletsPage />} />
            {/* The Wallets tab was called Settings; an old link still lands on it. */}
            <Route path="/accounts/settings" element={<Navigate to="/accounts/wallets" replace />} />
          </Route>

          {/* The district and thana master list. Admin-only, page and
              controls alike — one careless edit re-classifies every future
              challan in a district. The district and thana lookups the entry
              form runs are separate endpoints with their own, wider audience,
              so this costs nobody a location on a challan. */}
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

          {/* The product rate card. The same boundary the location master
              has, and for a sharper reason: a rate is money. Admin-only,
              page and controls alike; the model and product lookups the
              entry form runs are separate endpoints with their own, wider
              audience, so a challan still prices itself for whoever files
              it. */}
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

          {/* Reached from the bell rather than the sidebar, for the reason
              /profile is reached from the account menu — it belongs to the
              person rather than to the business.

              **No RoleRoute, deliberately.** There is nothing here to guard:
              every endpoint behind this page reads the caller off the verified
              token and takes no user id, so two accounts of different roles
              reach the same page and the server shows them two entirely
              different inboxes. What keeps a Vendor account away from the
              operating modules' messages is the audience chosen when each
              message was written, which is stronger than a filter on the way
              out — a message that was never addressed to them does not exist. */}
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Admin-only. The guard nests inside the layout so a denied user
              still gets the shell, not a bare page. */}
          <Route element={<AdminRoute />}>
            <Route path="/administration" element={<AdministrationPage />} />
          </Route>

          {/* The activity journal. Wider than the rest of System — a Manager
              keeps the books and a CEO oversees them, and both have reason to
              read what happened — and narrower than the operating modules,
              because it carries what Accounts carries. Read-only by
              construction: the module has no write endpoint at all. */}
          <Route
            element={
              <RoleRoute
                roles={ACTIVITY_READ_ROLES}
                area="Activity Logs"
                reason={ACTIVITY_ACCESS_REASON}
              />
            }
          >
            <Route path="/activity" element={<ActivityPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
