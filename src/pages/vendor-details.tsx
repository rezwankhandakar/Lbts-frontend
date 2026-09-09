import { Building2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { useCurrentRole } from '@/hooks/use-current-role'
import { PanelSkeleton } from '@/features/vendor/components/panel-states'
import { VendorHeaderSkeleton } from '@/features/vendor/components/vendor-header'
import { VendorWorkspace } from '@/features/vendor/components/vendor-workspace'
import { useVendor } from '@/features/vendor/hooks/use-vendors'
import { canManageVendors } from '@/features/vendor/types'

/**
 * One vendor and everything underneath it.
 *
 * The route is `/vendors/:id`, and the id in it is a *subject* rather than
 * authority: the API checks it against the caller's own profile before
 * answering, so a Vendor account that types somebody else's id gets a 404 — not
 * because this page hid anything, but because the server never consulted the id
 * as a claim. That is why there is no guard here beyond the read roles.
 */
export function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useCurrentRole()
  const canManage = canManageVendors(role)

  const query = useVendor(id)

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
     * A 404 here is the ordinary outcome for a vendor that was deleted, and it
     * is also what a Vendor account gets for somebody else's record. The wording
     * covers both honestly without confirming which it was.
     */
    const notFound = query.error?.statusCode === 404

    return (
      <div className="mx-auto w-full max-w-3xl">
        <EmptyState
          icon={Building2}
          title={notFound ? 'Vendor not found' : 'Could not load this vendor'}
          description={
            notFound
              ? 'It may have been removed, or it may not be a vendor this account can open.'
              : (query.error?.message ?? 'Something went wrong.')
          }
          action={
            notFound ? (
              <Button render={<Link to="/vendors" />}>Back to vendors</Button>
            ) : (
              <Button onClick={() => void query.refetch()}>Try again</Button>
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <VendorWorkspace
        vendor={query.data}
        canManage={canManage}
        showBackLink
        onDeleted={() => navigate('/vendors')}
      />
    </div>
  )
}
