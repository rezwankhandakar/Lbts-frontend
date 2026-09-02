import { Skeleton } from '@/components/ui/skeleton'

/**
 * Suspense fallback for lazily loaded routes. Renders inside <main>, so the
 * sidebar and header stay mounted while the route chunk downloads. Its shape
 * mirrors PageHeader + EmptyState, so the swap does not shift the layout.
 */
export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page</span>
      <div className="mb-6 space-y-2.5">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <Skeleton className="min-h-[26rem] w-full rounded-xl" />
    </div>
  )
}
