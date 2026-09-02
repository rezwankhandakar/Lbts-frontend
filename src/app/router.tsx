import { lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/app-layout'
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from '@/components/shared/route-guards'
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
