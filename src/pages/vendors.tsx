import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { useCurrentRole } from '@/hooks/use-current-role'
import { ConfirmDialog } from '@/features/vendor/components/confirm-dialog'
import { StatusChangeDialog } from '@/features/vendor/components/status-change-dialog'
import { VendorDirectory } from '@/features/vendor/components/vendor-directory'
import { VendorFilters } from '@/features/vendor/components/vendor-filters'
import { VendorFormDialog } from '@/features/vendor/components/vendor-form-dialog'
import { VendorStatsPanel } from '@/features/vendor/components/vendor-stats'
import { useVendorActions } from '@/features/vendor/hooks/use-vendor-actions'
import { useVendorListParams } from '@/features/vendor/hooks/use-list-params'
import { useVendorStats, useVendors } from '@/features/vendor/hooks/use-vendors'
import { vendorStatusMeta } from '@/features/vendor/lib/vendor-meta'
import { VENDOR_STATUSES, canManageVendors } from '@/features/vendor/types'
import type { VendorStatus } from '@/features/vendor/types'

/**
 * Vendor Management: every vendor, and the size and health of each one's fleet.
 *
 * Reading it is open to everyone who reaches the operating modules; changing it
 * is Admin and Manager. A `Vendor` account technically reaches this route too
 * and sees exactly one row — their own — because the API scopes the list from
 * their profile. In practice they arrive at `/my-vendor` instead, which is the
 * same details page without a directory in front of it.
 *
 * What the counts on each row are for: "how many vehicles does this vendor
 * have, how many are working, and is anything about to lapse" is the question
 * somebody opens this page with, and answering it per row is what stops the
 * page being a list of names you have to click through one at a time.
 */
export function VendorsPage() {
  const role = useCurrentRole()
  const canManage = canManageVendors(role)

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useVendorListParams()

  const vendorsQuery = useVendors(applied)
  const statsQuery = useVendorStats()
  const actions = useVendorActions()

  const records = vendorsQuery.data?.records ?? []
  const meta = vendorsQuery.data?.meta

  // Removing the last row on a page leaves the current page past the end of the
  // result set. Clamping during render lands on the last real page instead of
  // an empty one.
  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  const alerts =
    (statsQuery.data?.expiredDocuments ?? 0) + (statsQuery.data?.expiringDocuments ?? 0)

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Vendor Management"
        description="Manage vendors, vehicles, drivers and operational compliance. Each vendor owns its own fleet, and a driver is only ever assigned to a vehicle belonging to the same vendor."
      />

      <div className="mb-6">
        <VendorStatsPanel
          stats={statsQuery.data}
          isLoading={statsQuery.isPending}
          isError={statsQuery.isError}
          onRetry={() => void statsQuery.refetch()}
        />
      </div>

      <section
        aria-label="Vendor directory"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <VendorFilters
          params={params}
          onChange={applyFilters}
          onReset={reset}
          onAdd={actions.openAdd}
          canManage={canManage}
          summary={
            meta && !vendorsQuery.isPending
              ? `${meta.total} ${meta.total === 1 ? 'vendor' : 'vendors'}${
                  isFiltered ? ' match these filters' : ''
                }${alerts > 0 && !isFiltered ? ` · ${alerts} document${alerts === 1 ? '' : 's'} needing attention` : ''}`
              : undefined
          }
        />

        <VendorDirectory
          records={records}
          isLoading={vendorsQuery.isPending}
          isFetching={vendorsQuery.isFetching}
          isError={vendorsQuery.isError}
          errorMessage={vendorsQuery.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          canManage={canManage}
          onRetry={() => void vendorsQuery.refetch()}
          onReset={reset}
          onAdd={actions.openAdd}
          onEdit={actions.openEdit}
          onChangeStatus={actions.openStatus}
          onDelete={actions.openDelete}
        />

        {meta && !vendorsQuery.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={vendorsQuery.isFetching}
            noun={['vendor', 'vendors']}
          />
        )}
      </section>

      <VendorFormDialog
        record={actions.view === 'form' ? actions.target : null}
        open={actions.view === 'form'}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onSubmit={actions.submitForm}
      />

      {actions.target && (
        <StatusChangeDialog<VendorStatus>
          open={actions.view === 'status'}
          isPending={actions.isPending}
          subject={actions.target.name}
          noun="vendor"
          current={actions.target.status}
          options={VENDOR_STATUSES}
          meta={vendorStatusMeta}
          consequence={(status) =>
            status === 'Active'
              ? 'Vehicles and drivers under this vendor can be assigned again.'
              : 'Existing vehicles, drivers, assignments and documents are all kept. Nothing new can be assigned under this vendor until it is active again.'
          }
          onOpenChange={(open) => !open && actions.close()}
          onConfirm={actions.confirmStatus}
        />
      )}

      {actions.target && (
        <ConfirmDialog
          open={actions.view === 'delete'}
          isPending={actions.isPending}
          title={`Remove ${actions.target.name}?`}
          description={
            <>
              If no vehicle, driver, assignment or user account references this vendor it is
              deleted outright. If any do, it is <strong>deactivated and kept</strong> instead —
              a year of assignments has to be able to say who was driving, and deleting the vendor
              would leave them pointing at nothing. Either way it stops being offered for new
              work.
            </>
          }
          confirmLabel="Remove"
          pendingLabel="Removing…"
          cancelLabel="Keep it"
          onOpenChange={(open) => !open && actions.close()}
          onConfirm={actions.confirmDelete}
        />
      )}
    </div>
  )
}
