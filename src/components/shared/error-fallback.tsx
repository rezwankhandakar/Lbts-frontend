import { RefreshCcw, RotateCcw, TriangleAlert } from 'lucide-react'
import { BrandLockup } from '@/components/shared/brand'
import { Button } from '@/components/ui/button'

interface FallbackProps {
  error: Error
  onRetry: () => void
}

/**
 * The message is shown in development only. In production an internal stack
 * message tells the user nothing and can leak implementation detail; the
 * console keeps the full error either way.
 */
function ErrorDetail({ error }: { error: Error }) {
  if (!import.meta.env.DEV) {
    return null
  }

  return (
    <pre className="mt-5 max-h-32 w-full overflow-auto rounded-lg border bg-muted/50 px-3 py-2 text-left text-[11px] leading-relaxed break-words whitespace-pre-wrap text-muted-foreground">
      {error.message}
    </pre>
  )
}

/**
 * Shown inside <main>, so the sidebar and header stay mounted and the operator
 * can simply navigate somewhere else — the same principle as the route
 * Suspense boundary.
 */
export function RouteErrorFallback({ error, onRetry }: FallbackProps) {
  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[60vh] w-full max-w-lg flex-col items-center justify-center px-2 py-16 text-center"
    >
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-6" aria-hidden />
      </div>

      <h1 className="mt-5 text-lg font-semibold tracking-tight text-balance">
        This page ran into a problem
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
        Nothing was lost. Try again, or use the sidebar to go somewhere else.
      </p>

      <ErrorDetail error={error} />

      <Button variant="outline" className="mt-6" onClick={onRetry}>
        <RotateCcw data-icon="inline-start" aria-hidden />
        Try again
      </Button>
    </div>
  )
}

/**
 * Last resort, outside the router and the providers: used when the shell
 * itself failed, so it can rely on nothing but the brand and a reload.
 */
export function AppErrorFallback({ error }: { error: Error }) {
  return (
    <div
      role="alert"
      className="flex min-h-svh flex-col items-center justify-center bg-background px-5 py-12"
    >
      <BrandLockup />

      <div className="mt-8 flex w-full max-w-md flex-col items-center rounded-xl border bg-card p-7 text-center shadow-sm">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-6" aria-hidden />
        </div>

        <h1 className="mt-5 text-lg font-semibold tracking-tight text-balance">
          LBTS could not start
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
          Something went wrong while loading the application. Reloading usually clears it.
        </p>

        <ErrorDetail error={error} />

        <Button className="mt-6 w-full" onClick={() => window.location.reload()}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          Reload LBTS
        </Button>
      </div>
    </div>
  )
}
