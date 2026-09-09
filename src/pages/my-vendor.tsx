import { Building2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { PanelSkeleton } from '@/features/vendor/components/panel-states'
import { VendorHeaderSkeleton } from '@/features/vendor/components/vendor-header'
import { VendorWorkspace } from '@/features/vendor/components/vendor-workspace'
import { useMyVendor } from '@/features/vendor/hooks/use-vendors'

/**
 * The vendor account's own record.
 *
 * The whole page is the same workspace `/vendors/:id` renders, with `canManage`
 * hard-wired to false and no back link — because there is no directory behind
 * it. That is not a second, read-only implementation of the module: it is the
 * same one, and the read-only-ness is a property of the account rather than of
 * this route.
 *
 * **No id appears anywhere in the request.** `GET /vendors/me` reads the link
 * off the profile the auth middleware loaded from MongoDB, so a vendor user
 * never sends a vendor id and has nothing to tamper with. Every request the
 * tabs then make carries the id this returned, and every one of those is checked
 * against the same profile — so even a hand-edited id in a network tab is
 * answered 404.
 *
 * The write controls are simply absent rather than disabled. A greyed-out
 * button is a promise of something that will never be allowed, and this account
 * is not waiting for permission.
 */
export function MyVendorPage() {
  const query = useMyVendor()

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-7xl">
        <VendorHeaderSkeleton />
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <PanelSkeleton rows={5} />
        </div>
      </div>
    )
  }

  if (query.isError || !query.data) {
    /**
     * Two quite different situations, and they are worth telling apart. A 403
     * means the account has not been linked to a vendor yet, which an
     * administrator fixes; anything else is a failure worth retrying.
     */
    const unlinked = query.error?.statusCode === 403

    return (
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          title="My Vendor"
          description="Your vendor's fleet, drivers, assignments and compliance documents."
        />
        <EmptyState
          icon={Building2}
          badge={unlinked ? 'Not linked yet' : undefined}
          title={unlinked ? 'No vendor is linked to this account' : 'Could not load your vendor'}
          description={
            unlinked
              ? 'A vendor account has to be linked to the vendor it speaks for before there is anything to show. An administrator does that from the Administration page.'
              : (query.error?.message ?? 'Something went wrong.')
          }
          action={
            unlinked ? undefined : (
              <Button onClick={() => void query.refetch()}>Try again</Button>
            )
          }
          footnote={unlinked ? 'Contact an administrator to have your account linked.' : undefined}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <Eye className="size-3.5 shrink-0" aria-hidden />
        You are viewing your vendor record. Everything here is read-only — contact LBTS to have
        anything changed.
      </div>

      <VendorWorkspace
        vendor={query.data}
        canManage={false}
        showBackLink={false}
        onDeleted={() => undefined}
      />
    </div>
  )
}
