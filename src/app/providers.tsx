import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/features/auth/use-auth'
import { isVendorScopedRole } from '@/features/vendor/types'
import { queryClient } from '@/lib/query-client'
import { useAuthStore } from '@/stores/use-auth-store'
import type { UserProfile } from '@/stores/use-auth-store'
import { applyTheme, useThemeStore } from '@/stores/use-theme-store'
import { applyLocale, useLocaleStore } from '@/lib/i18n'
import type { LocaleAudience } from '@/lib/i18n'

/**
 * Dev-only. `import.meta.env.DEV` is statically false in a production build, so
 * Vite drops this branch and the dynamic import never enters the bundle graph.
 */
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-query-devtools').then((module) => ({
        default: module.ReactQueryDevtools,
      })),
    )
  : null

interface ProvidersProps {
  children: ReactNode
}

/**
 * Which language audience a profile belongs to, or null while nobody is known.
 *
 * Only an *approved* Vendor account is a vendor here. Every sign-up is created
 * `Pending` with the least-privileged role, which happens to be `Vendor`, so on
 * a Pending or Rejected account the role says nothing about who is signing in —
 * a new Operation Executive would otherwise wait for approval in Bangla because
 * of a default nobody chose. `Suspended` counts, because that account was
 * approved as a vendor before it was suspended.
 */
function audienceOf(profile: UserProfile | null): LocaleAudience | null {
  if (!profile) {
    return null
  }
  const approved = profile.status === 'Active' || profile.status === 'Suspended'
  return approved && isVendorScopedRole(profile.role) ? 'vendor' : 'staff'
}

/**
 * Hands the signed-in audience to the language store, so a vendor account opens
 * in Bangla. Nothing happens while the profile is unknown — loading, signed
 * out — so the sign-in screen stays in whatever the last account here saw
 * rather than flickering back to English between two sessions.
 */
function useLocaleAudience() {
  const audience = useAuthStore((state) => audienceOf(state.profile))
  const setAudience = useLocaleStore((state) => state.setAudience)

  useEffect(() => {
    if (audience) {
      setAudience(audience)
    }
  }, [audience, setAudience])
}

function SessionBridge({ children }: ProvidersProps) {
  // Must sit inside BrowserRouter-free scope but above the routes: it only
  // touches the store, so placement just needs to be app-wide and single.
  useAuthListener()
  useLocaleAudience()
  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  const theme = useThemeStore((state) => state.theme)
  const locale = useLocaleStore((state) => state.locale)

  // The inline script in index.html sets the class before first paint; this
  // keeps it in sync afterwards, including across persist rehydration.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // The same arrangement for the language. The inline script writes <html lang>
  // before first paint so a screen reader never announces a Bangla page in
  // English; this keeps it in step with the store afterwards.
  useEffect(() => {
    applyLocale(locale)
  }, [locale])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SessionBridge>{children}</SessionBridge>
        <Toaster theme={theme} richColors closeButton />
        {ReactQueryDevtools ? (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        ) : null}
      </BrowserRouter>
    </QueryClientProvider>
  )
}
