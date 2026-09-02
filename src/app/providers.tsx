import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useAuthListener } from '@/features/auth/use-auth'
import { queryClient } from '@/lib/query-client'
import { applyTheme, useThemeStore } from '@/stores/use-theme-store'

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

function SessionBridge({ children }: ProvidersProps) {
  // Must sit inside BrowserRouter-free scope but above the routes: it only
  // touches the store, so placement just needs to be app-wide and single.
  useAuthListener()
  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  const theme = useThemeStore((state) => state.theme)

  // The inline script in index.html sets the class before first paint; this
  // keeps it in sync afterwards, including across persist rehydration.
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

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
