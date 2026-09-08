import { ListPagination } from '@/components/shared/list-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { DeleteProductRateDialog } from '@/features/product-rate/components/delete-product-rate-dialog'
import { ProductRateDirectory } from '@/features/product-rate/components/product-rate-directory'
import { ProductRateFilters } from '@/features/product-rate/components/product-rate-filters'
import { ProductRateFormDialog } from '@/features/product-rate/components/product-rate-form-dialog'
import { ProductRateStatsPanel } from '@/features/product-rate/components/product-rate-stats'
import { useProductRateActions } from '@/features/product-rate/hooks/use-product-rate-actions'
import { useProductRateListParams } from '@/features/product-rate/hooks/use-product-rate-list-params'
import {
  useProductRateStats,
  useProductRates,
} from '@/features/product-rate/hooks/use-product-rates'
import { canManageProductRates } from '@/features/product-rate/types'
import { useCurrentRole } from '@/hooks/use-current-role'

/**
 * The Product Rate card: what a delivery is charged, per product and per
 * delivery area.
 *
 * Reference data rather than records, the same shape the Locations page has
 * and for the same reasons — no lifecycle, no ownership, and the interesting
 * decisions are about identity and about what happens to the challans citing a
 * row somebody wants gone.
 *
 * One thing works differently here and the page says so rather than leaving it
 * to be discovered: a challan stores a *copy* of the figure it was charged,
 * not a reference to this row. Correcting a location reclassifies every
 * challan pointing at it; correcting a rate changes only what is charged next.
 * That is deliberate — the rate that applied in March was the right rate for
 * March — but it is the opposite of what the neighbouring page does, so it is
 * stated in the header rather than in a comment nobody reads.
 *
 * Reading is open to everyone who may reach a challan, because the entry form
 * offers product names off this card. Writing is Admin-only: a rate is money,
 * and the API refuses the request for anyone else regardless of what this page
 * renders.
 */
export function ProductRatesPage() {
  const role = useCurrentRole()
  const canManage = canManageProductRates(role)

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useProductRateListParams()

  const ratesQuery = useProductRates(applied)
  const statsQuery = useProductRateStats(canManage)
  const actions = useProductRateActions()

  const records = ratesQuery.data?.records ?? []
  const meta = ratesQuery.data?.meta

  // Removing the last row on a page leaves the current page past the end of
  // the result set. Clamping during render lands the Admin on the last real
  // page instead of an empty one.
  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <PageHeader
        title="Product Rates"
        description="What each product is charged for delivery, in each of the three areas. A challan line is priced from this card when its product and location are both known, and the figure is copied onto the record — so correcting a rate here changes what is charged next and never rewrites what has already been charged."
      />

      {canManage && (
        <div className="mb-6">
          <ProductRateStatsPanel stats={statsQuery.data} isLoading={statsQuery.isPending} />
        </div>
      )}

      <section
        aria-label="Product rate card"
        className="overflow-hidden rounded-xl border bg-card shadow-sm"
      >
        <ProductRateFilters
          params={params}
          onChange={applyFilters}
          onReset={reset}
          onAdd={actions.openAdd}
          canManage={canManage}
          summary={
            meta && !ratesQuery.isPending
              ? `${meta.total} ${meta.total === 1 ? 'rate' : 'rates'}${
                  isFiltered ? ' match these filters' : ' on the card'
                }`
              : undefined
          }
        />

        <ProductRateDirectory
          records={records}
          isLoading={ratesQuery.isPending}
          isFetching={ratesQuery.isFetching}
          isError={ratesQuery.isError}
          errorMessage={ratesQuery.error?.message ?? 'Something went wrong.'}
          isFiltered={isFiltered}
          canManage={canManage}
          onRetry={() => void ratesQuery.refetch()}
          onReset={reset}
          onAdd={actions.openAdd}
          onEdit={actions.openEdit}
          onToggleActive={actions.toggleActive}
          onDelete={actions.openDelete}
        />

        {meta && !ratesQuery.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={ratesQuery.isFetching}
            noun={['rate', 'rates']}
          />
        )}
      </section>

      <ProductRateFormDialog
        record={actions.view === 'form' ? actions.target : null}
        open={actions.view === 'form'}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onSubmit={actions.submitForm}
      />

      <DeleteProductRateDialog
        record={actions.target}
        open={actions.view === 'delete'}
        isPending={actions.isPending}
        onOpenChange={(open) => !open && actions.close()}
        onConfirm={actions.confirmDelete}
      />
    </div>
  )
}
