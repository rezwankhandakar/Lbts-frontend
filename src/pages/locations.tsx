import { PageHeader } from '@/components/shared/page-header'
import { ListPagination } from '@/components/shared/list-pagination'
import { DeleteLocationDialog } from '@/features/location/components/delete-location-dialog'
import { LocationDirectory } from '@/features/location/components/location-directory'
import { LocationFilters } from '@/features/location/components/location-filters'
import { LocationFormDialog } from '@/features/location/components/location-form-dialog'
import { LocationStatsPanel } from '@/features/location/components/location-stats'
import { useLocationActions } from '@/features/location/hooks/use-location-actions'
import { useLocationListParams } from '@/features/location/hooks/use-location-list-params'
import { useLocationStats, useLocations } from '@/features/location/hooks/use-locations'
import { canManageLocations } from '@/features/location/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The Location Master: the district and thana list every challan is
 * classified against.
 *
 * Reference data rather than records, which is what makes this page different
 * from Administration or Challan. There is no lifecycle, no ownership and no
 * per-row workflow — the interesting decisions are all about identity, and
 * about what happens to the challans pointing at a row somebody wants gone.
 *
 * Reading it is open to everyone who may reach a challan, because the entry
 * form needs the same districts and thanas. Writing it is Admin-only: one
 * careless edit reclassifies every future challan in a district, and the API
 * refuses the request for anyone else regardless of what this page renders.
 */
export function LocationsPage() {
  const role = useCurrentRole()
  const canManage = canManageLocations(role)

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useLocationListParams()

  const locationsQuery = useLocations(applied)
  const statsQuery = useLocationStats(canManage)
  const actions = useLocationActions()

  const records = locationsQuery.data?.records ?? []
  const meta = locationsQuery.data?.meta

  // Removing the last row on a page leaves the current page past the end of
  // the result set. Clamping during render lands the Admin on the last real
  // page instead of an empty one.
  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Locations"
        description="The district and thana list challans are classified against. A challan's location type is read from this list and never typed beside it, so correcting a row here corrects every challan that points at it."
      />

      {canManage && (
        <div className="mb-6">
          <LocationStatsPanel stats={statsQuery.data} isLoading={statsQuery.isPending} />
        </div>
      )}

      <section
        aria-label="Location master list"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <LocationFilters
          params={params}
          onChange={applyFilters}
          onReset={reset}
          onAdd={actions.openAdd}
          canManage={canManage}
          summary={
            meta && !locationsQuery.isPending
              ? `${meta.total} ${meta.total === 1 ? 'location' : 'locations'}${
                  isFiltered ? ' match these filters' : ' in the master list'
                }`
              : undefined
          }
        />

        <LocationDirectory
          records={records}
          isLoading={locationsQuery.isPending}
          isFetching={locationsQuery.isFetching}
          isError={locationsQuery.isError}
          errorMessage={locationsQuery.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          canManage={canManage}
          onRetry={() => void locationsQuery.refetch()}
          onReset={reset}
          onAdd={actions.openAdd}
          onEdit={actions.openEdit}
          onToggleActive={actions.toggleActive}
          onDelete={actions.openDelete}
        />

        {meta && !locationsQuery.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={locationsQuery.isFetching}
            noun={['location', 'locations']}
          />
        )}
      </section>

      <LocationFormDialog
        record={actions.view === 'form' ? actions.target : null}
        open={actions.view === 'form'}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onSubmit={actions.submitForm}
      />

      <DeleteLocationDialog
        record={actions.target}
        open={actions.view === 'delete'}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
