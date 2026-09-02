import { Skeleton } from '@/components/ui/skeleton'

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center gap-3 border-b bg-muted/30 px-5 py-3.5">
        <Skeleton className="size-9 rounded-lg" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-4 px-5 py-4">
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} className="flex items-start gap-3">
            <Skeleton className="size-7 shrink-0 rounded-lg" />
            <div className="w-full space-y-1.5">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Mirrors the real layout closely enough that the swap does not shift the
 * page: hero band, avatar, two panels, then security. A profile that arrives
 * during a cold start can take most of a minute, and a blank screen for that
 * long reads as a broken page rather than a slow one.
 */
export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading your profile</span>

      <div className="mb-6 space-y-2.5">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <Skeleton className="h-24 w-full rounded-none sm:h-28" />
        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-14 flex flex-col gap-4 sm:-mt-16 sm:flex-row sm:items-end">
            <Skeleton className="size-24 rounded-full ring-2 ring-card sm:size-28" />
            <div className="space-y-2.5 sm:pb-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-56" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={5} />
      </div>

      <div className="mt-5">
        <CardSkeleton rows={2} />
      </div>
    </div>
  )
}
