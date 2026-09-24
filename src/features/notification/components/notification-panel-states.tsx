import { BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * What the header panel draws when it has no messages to draw.
 *
 * Three states, kept together because they are one decision — *why is this
 * empty?* — and split out of the panel because it crossed the two-hundred-line
 * mark the project sets as the trigger to extract.
 */

/** Three rows of the real shape, so the panel does not jump when they land. */
export function NotificationPanelSkeleton() {
  return (
    <div className="space-y-3 p-3" aria-busy="true">
      {[0, 1, 2].map((row) => (
        <div key={row} className="flex gap-3">
          <div className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function NotificationPanelError({
  message,
  onRetry,
}: {
  message: string
  onRetry: () => void
}) {
  return (
    <div className="px-4 py-8 text-center">
      <p className="text-[13px] font-medium">Could not load notifications</p>
      <p className="mx-auto mt-1 max-w-[16rem] text-[11px] leading-relaxed text-muted-foreground">
        {message}
      </p>
      <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
        Try again
      </Button>
    </div>
  )
}

/**
 * Earned, rather than a placeholder.
 *
 * An empty inbox here genuinely does mean nothing is waiting: the audience is
 * resolved when a message is *written*, so there is no set of messages this
 * account "cannot see" that would make the emptiness a lie. Contrast the
 * dashboard's attention list, which has to tell "nothing is outstanding" from
 * "you read no module that could have anything outstanding" before it may say
 * either.
 */
export function NotificationPanelEmpty() {
  return (
    <div className="px-4 py-10 text-center">
      <div className="mx-auto flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <BellOff className="size-4" aria-hidden />
      </div>
      <p className="mt-3 text-[13px] font-medium">You are up to date</p>
      <p className="mx-auto mt-1 max-w-[17rem] text-[11px] leading-relaxed text-muted-foreground">
        Approvals, review verdicts, lapsing certificates and money movements land
        here as they happen.
      </p>
    </div>
  )
}
