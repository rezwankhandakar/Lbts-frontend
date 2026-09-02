import { Suspense, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSidebarStore } from '@/stores/use-sidebar-store'
import { AppHeader } from '@/components/layout/app-header'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { RouteErrorFallback } from '@/components/shared/error-fallback'
import { PageSkeleton } from '@/components/shared/page-skeleton'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const collapsed = useSidebarStore((state) => state.collapsed)
  const { pathname } = useLocation()

  // Close the mobile drawer on every route change, including back/forward and
  // programmatic navigation. Adjusting state during render (rather than in an
  // effect) avoids the cascading re-render that useEffect would cause.
  const [renderedPathname, setRenderedPathname] = useState(pathname)
  if (pathname !== renderedPathname) {
    setRenderedPathname(pathname)
    setMobileOpen(false)
  }

  return (
    <TooltipProvider>
      <div className="flex h-svh overflow-hidden bg-background text-foreground">
        <aside
          id="app-sidebar"
          className={cn(
            'hidden shrink-0 overflow-hidden border-r transition-[width] duration-200 ease-in-out md:block',
            collapsed ? 'w-[68px]' : 'w-64',
          )}
        >
          <AppSidebar collapsed={collapsed} />
        </aside>

        <MobileSidebar open={mobileOpen} onOpenChange={setMobileOpen} />

        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader mobileOpen={mobileOpen} onOpenMobileSidebar={() => setMobileOpen(true)} />
          {/* A slightly recessed canvas so cards and panels read as raised. */}
          <main className="flex-1 overflow-y-auto bg-muted/40 p-4 md:p-6 lg:p-8">
            {/* One boundary pair for every route: Suspense for the chunk that
                is still downloading, ErrorBoundary for the one that threw. Both
                sit inside <main>, so the sidebar and header stay mounted either
                way — a broken page never blanks the app. The error boundary is
                keyed on the route, so navigating away clears a crashed page. */}
            <ErrorBoundary
              key={pathname}
              fallback={(error, reset) => <RouteErrorFallback error={error} onRetry={reset} />}
            >
              <Suspense fallback={<PageSkeleton />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
