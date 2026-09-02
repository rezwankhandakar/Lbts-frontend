import { RefreshCcw, SearchX, TriangleAlert, UsersRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/**
 * Shaped like a populated table so the swap to real rows does not jolt the
 * layout. Deliberately not fake user records — a skeleton reads as "loading",
 * invented names read as data.
 */
export function UserDirectorySkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading users</span>
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-4">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-40 max-w-full" />
            <Skeleton className="h-3 w-56 max-w-full" />
          </div>
          <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
          <Skeleton className="hidden h-5 w-20 rounded-full sm:block" />
          <Skeleton className="size-7 shrink-0 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

interface DirectoryMessageProps {
  isFiltered: boolean
  onReset: () => void
}

/** No users matched — separated from "no users exist" because the fix differs. */
export function UserDirectoryEmpty({ isFiltered, onReset }: DirectoryMessageProps) {
  const Icon = isFiltered ? SearchX : UsersRound

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {isFiltered ? 'No users found' : 'No accounts yet'}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {isFiltered
          ? 'Try changing your search or filters.'
          : 'Accounts appear here as soon as someone signs up. Every new account arrives pending your approval.'}
      </p>
      {isFiltered && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onReset}>
          Clear filters
        </Button>
      )}
    </div>
  )
}

interface DirectoryErrorProps {
  message: string
  onRetry: () => void
  isRetrying: boolean
}

export function UserDirectoryError({ message, onRetry, isRetrying }: DirectoryErrorProps) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center" role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">Could not load users</h3>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-pretty text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-5" onClick={onRetry} disabled={isRetrying}>
        <RefreshCcw data-icon="inline-start" aria-hidden />
        {isRetrying ? 'Retrying…' : 'Try again'}
      </Button>
    </div>
  )
}
