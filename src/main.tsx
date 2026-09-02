import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Providers } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { ErrorBoundary } from '@/components/shared/error-boundary'
import { AppErrorFallback } from '@/components/shared/error-fallback'
import '@/index.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html')
}

createRoot(rootElement).render(
  <StrictMode>
    {/* Outside the providers: if the shell itself fails there is no router,
        no query client and no theme to render a friendlier surface with. */}
    <ErrorBoundary fallback={(error) => <AppErrorFallback error={error} />}>
      <Providers>
        <AppRouter />
      </Providers>
    </ErrorBoundary>
  </StrictMode>,
)
