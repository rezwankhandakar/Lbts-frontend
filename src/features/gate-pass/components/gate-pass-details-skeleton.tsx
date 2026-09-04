import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shaped like the details page so the swap to real content does not jolt the
 * layout. Deliberately not placeholder values — a skeleton reads as "loading",
 * invented text reads as data.
 */
export function GatePassDetailsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading the gate pass</span>

      <div className="mb-6 space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="rounded-xl border bg-card p-4 shadow-sm">
              <Skeleton className="h-4 w-24" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="h-[26rem] rounded-xl" />
      </div>
    </div>
  )
}
