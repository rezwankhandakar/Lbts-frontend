import { useLocation } from 'react-router-dom'
import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { SentenceWith } from '@/components/shared/sentence-with'
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
import type { VendorListParams, VendorStatus } from '@/features/vendor/types'
import { useT } from '@/lib/i18n'

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
  const t = useT()

  const role = useCurrentRole()
  const canManage = canManageVendors(role)

  /**
   * The dashboard links here with the backlog it just counted, and this is how
   * that filter survives the trip. Router state rather than the URL, because
   * these filters have never been in the URL — carrying them is a convenience
   * for one journey, not a promise that a link reproduces a view. It seeds the
   * first render only, so Clear still clears to nothing.
   */
  const { state } = useLocation()
  const seeded = (state as { vendorFilters?: Partial<VendorListParams> } | null)?.vendorFilters

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useVendorListParams(seeded)

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
        title={t('vendor.page.title')}
        description={t('vendor.page.description')}
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
        aria-label={t('vendor.page.directoryAria')}
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
              ? `${t(
                  isFiltered
                    ? 'vendor.directory.summaryFiltered'
                    : 'vendor.directory.summaryTotal',
                  { count: meta.total },
                )}${
                  alerts > 0 && !isFiltered
                    ? ` · ${t('vendor.directory.attention', { count: alerts })}`
                    : ''
                }`
              : undefined
          }
        />

        <VendorDirectory
          records={records}
          isLoading={vendorsQuery.isPending}
          isFetching={vendorsQuery.isFetching}
          isError={vendorsQuery.isError}
          errorMessage={vendorsQuery.error?.message ?? t('vendor.somethingWrong')}
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
            nounKey="nouns.vendor"
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
          noun={t('vendor.statusDialog.nounVendor')}
          current={actions.target.status}
          options={VENDOR_STATUSES}
          meta={vendorStatusMeta}
          consequence={(status) =>
            status === 'Active'
              ? t('vendor.directory.activeConsequence')
              : t('vendor.directory.inactiveConsequence')
          }
          onOpenChange={(open) => !open && actions.close()}
          onConfirm={actions.confirmStatus}
        />
      )}

      {actions.target && (
        <ConfirmDialog
          open={actions.view === 'delete'}
          isPending={actions.isPending}
          title={t('vendor.remove.vendorTitle', { name: actions.target.name })}
          description={
            <SentenceWith
              text={t('vendor.directory.removeDescriptionListed')}
              placeholder="{kept}"
            >
              <strong>{t('vendor.directory.deactivatedAndKept')}</strong>
            </SentenceWith>
          }
          confirmLabel={t('vendor.remove.confirm')}
          pendingLabel={t('vendor.remove.removing')}
          cancelLabel={t('vendor.remove.keepIt')}
          onOpenChange={(open) => !open && actions.close()}
          onConfirm={actions.confirmDelete}
        />
      )}
    </div>
  )
}
