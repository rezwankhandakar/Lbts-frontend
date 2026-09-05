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
import { DashboardPage } from '@/pages/dashboard'

/**
 * Module routes are lazy-loaded so each ships its own chunk; only the dashboard
 * is eager, since it is the landing route. The layout renders a single
 * <Suspense> boundary inside <main>, so the shell never unmounts while a chunk
 * loads. Pages use named exports, hence the default-mapping in each import.
 */
const ModuleAPage = lazy(() => import('@/pages/module-a').then((m) => ({ default: m.ModuleAPage })))
const ModuleBPage = lazy(() => import('@/pages/module-b').then((m) => ({ default: m.ModuleBPage })))
const ModuleCPage = lazy(() => import('@/pages/module-c').then((m) => ({ default: m.ModuleCPage })))
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
            </Route>
          </Route>

          <Route path="/module-a" element={<ModuleAPage />} />
          <Route path="/module-b" element={<ModuleBPage />} />
          <Route path="/module-c" element={<ModuleCPage />} />
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
