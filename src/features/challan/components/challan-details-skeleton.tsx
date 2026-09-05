import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shaped like the details page so the swap to real content does not jolt the
 * layout. Deliberately not invented values — a skeleton reads as "loading",
 * placeholder text reads as data.
 */
export function ChallanDetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading challan</span>

      <div className="mb-5 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:items-start">
        <div className="space-y-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-xl border bg-card p-5 shadow-sm">
              <Skeleton className="h-4 w-40" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </div>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="border-b px-4 py-3">
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-96 rounded-none sm:h-128" />
        </div>
      </div>
    </div>
  )
}
