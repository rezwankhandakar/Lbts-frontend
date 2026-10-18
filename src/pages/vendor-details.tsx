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
import { useT } from '@/lib/i18n'

/**
 * One vendor and everything underneath it.
 *
 * The route is `/vendors/:id`, and the id in it is a *subject* rather than
 * authority: the API checks it against the caller's own profile before
 * answering. A Vendor account never renders this page — `StaffVendorRoute`
 * sends it to `/my-vendor`, where its trips are the whole of what it sees — but
 * the API would answer a vendor's request for somebody else's id with a 404
 * either way, because it never consults the id as a claim.
 */
export function VendorDetailsPage() {
  const t = useT()

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
          title={notFound ? t('vendor.page.notFound') : t('vendor.page.loadFailed')}
          description={
            notFound
              ? t('vendor.page.notFoundHint')
              : (query.error?.message ?? t('vendor.somethingWrong'))
          }
          action={
            notFound ? (
              <Button render={<Link to="/vendors" />}>{t('vendor.page.backToVendors')}</Button>
            ) : (
              <Button onClick={() => void query.refetch()}>
                {t('common.actions.retry')}
              </Button>
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
        onDeleted={() => navigate('/vendors')}
      />
    </div>
  )
}
