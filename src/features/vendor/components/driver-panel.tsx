import { useCallback, useState } from 'react'
import { Users } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import { SentenceWith } from '@/components/shared/sentence-with'
import {
  useChangeDriverStatus,
  useCreateDriver,
  useDeleteDriver,
  useDriver,
  useDriverAssignments,
  useDriverDocuments,
  useDriverPhoto,
  useDrivers,
  useUpdateDriver,
} from '../hooks/use-fleet'
import { useDriverListParams } from '../hooks/use-list-params'
import { driverStatusMeta } from '../lib/vendor-meta'
import type { DriverFormValues } from '../schemas/vendor-schemas'
import { DRIVER_STATUSES } from '../types'
import type { DriverFilterPatch, DriverRecord, DriverStatus, VendorRecord } from '../types'
import { ConfirmDialog } from './confirm-dialog'
import { DriverCards } from './driver-cards'
import { DriverDetailSheet } from './driver-detail-sheet'
import { DriverFilters } from './driver-filters'
import { DriverFormDialog } from './driver-form-dialog'
import { DriverTable } from './driver-table'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { StatusChangeDialog } from './status-change-dialog'
import { useT } from '@/lib/i18n'

type Overlay = 'form' | 'status' | 'delete' | 'detail'

interface DriverPanelProps {
  vendor: VendorRecord
  canManage: boolean
  /**
   * A filter handed over by an alert on the overview, carrying a token so the
   * same alert pressed twice still applies.
   */
  filterRequest: { token: number; filter: DriverFilterPatch } | null
  onAssign: (driver: DriverRecord) => void
  onDocuments: (driver: DriverRecord) => void
}

/**
 * The drivers tab.
 *
 * The one thing here that is not symmetrical with the vehicles tab: a driver's
 * NID and address are not on the list shape, so both the detail sheet and the
 * edit form need the record fetched on its own. That is deliberate rather than
 * awkward — it is what keeps personal data off a table of eighteen rows — and it
 * costs one request at the moment somebody opens a driver.
 */
export function DriverPanel({
  vendor,
  canManage,
  filterRequest,
  onAssign,
  onDocuments,
}: DriverPanelProps) {
  const t = useT()

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useDriverListParams()

  const [target, setTarget] = useState<DriverRecord | null>(null)
  const [overlay, setOverlay] = useState<Overlay | null>(null)

  const query = useDrivers(vendor.id, applied)
  const create = useCreateDriver(vendor.id)
  const update = useUpdateDriver()
  const status = useChangeDriverStatus()
  const remove = useDeleteDriver()
  const photo = useDriverPhoto()

  /**
   * The full record, fetched only once a driver is actually open. Both the
   * detail sheet and the edit form read from it, because the list shape
   * deliberately carries neither the NID nor the address.
   */
  const needsDetail = (overlay === 'detail' || overlay === 'form') && target !== null
  const detail = useDriver(needsDetail ? target.id : undefined)
  const assignments = useDriverAssignments(overlay === 'detail' && target ? target.id : undefined)
  const documents = useDriverDocuments(overlay === 'detail' && target ? target.id : undefined)

  /** An alert on the overview lands here with a filter already chosen. */
  const [seenFilter, setSeenFilter] = useState<number | null>(null)
  if (filterRequest && filterRequest.token !== seenFilter) {
    setSeenFilter(filterRequest.token)
    applyFilters(filterRequest.filter)
  }

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  const close = useCallback(() => setOverlay(null), [])

  const openFor = useCallback(
    (next: Overlay) => (driver: DriverRecord) => {
      setTarget(driver)
      setOverlay(next)
    },
    [],
  )

  const submitForm = useCallback(
    (values: DriverFormValues) => {
      const payload = { ...values, licenseExpiry: values.licenseExpiry || null }

      if (target && overlay === 'form') {
        update.mutate({ id: target.id, ...payload }, { onSuccess: close })
        return
      }
      create.mutate(payload, { onSuccess: close })
    },
    [target, overlay, create, update, close],
  )

  const isPending =
    create.isPending || update.isPending || status.isPending || remove.isPending

  return (
    <>
      <Panel label={t('vendor.driver.panel')}>
        <DriverFilters
          params={params}
          onChange={applyFilters}
          onReset={reset}
          onAdd={() => {
            setTarget(null)
            setOverlay('form')
          }}
          canManage={canManage}
          summary={
            meta && !query.isPending
              ? t(isFiltered ? 'vendor.driver.summaryFiltered' : 'vendor.driver.summaryTotal', {
                  count: meta.total,
                })
              : undefined
          }
        />

        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title={t('vendor.driver.loadFailed')}
            message={query.error?.message ?? t('vendor.somethingWrong')}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={Users}
            title={t('vendor.driver.noneYet')}
            description={t('vendor.driver.noneHint', { vendor: vendor.name })}
            isFiltered={isFiltered}
            onReset={reset}
            action={
              canManage
                ? {
                    label: t('vendor.driver.add'),
                    onClick: () => {
                      setTarget(null)
                      setOverlay('form')
                    },
                  }
                : undefined
            }
          />
        ) : (
          (() => {
            const actions = {
              canManage,
              onOpen: openFor('detail'),
              onEdit: openFor('form'),
              onStatus: openFor('status'),
              onDelete: openFor('delete'),
              onAssign,
              onDocuments,
            }

            return (
              <>
                <DriverTable records={records} actions={actions} />
                <DriverCards records={records} actions={actions} />
              </>
            )
          })()
        )}

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={query.isFetching}
            nounKey="nouns.driver"
          />
        )}
      </Panel>

      {/* An edit waits for the full record. The list shape carries neither the
          NID nor the address — deliberately, so a table of eighteen drivers
          does not — and opening the form on a row would produce two fields that
          looked empty and saved as blank. Adding a driver needs no fetch, so it
          opens immediately. */}
      <DriverFormDialog
        record={overlay === 'form' ? (detail.data ?? null) : null}
        vendorName={vendor.name}
        open={overlay === 'form' && (target === null || detail.data !== undefined)}
        isPending={isPending}
        onOpenChange={(open) => !open && close()}
        onSubmit={submitForm}
      />

      {target && (
        <StatusChangeDialog<DriverStatus>
          open={overlay === 'status'}
          isPending={isPending}
          subject={target.name}
          noun={t('vendor.statusDialog.nounDriver')}
          current={target.status}
          options={DRIVER_STATUSES}
          meta={driverStatusMeta}
          consequence={(next) =>
            next === 'Active'
              ? t('vendor.driver.activeConsequence')
              : t('vendor.driver.inactiveConsequence')
          }
          onOpenChange={(open) => !open && close()}
          onConfirm={(next, note) =>
            status.mutate(
              { id: target.id, status: next, note: note || undefined },
              { onSuccess: close },
            )
          }
        />
      )}

      {target && (
        <ConfirmDialog
          open={overlay === 'delete'}
          isPending={isPending}
          title={t('vendor.driver.removeTitle', { name: target.name })}
          description={
            <SentenceWith text={t('vendor.driver.removeDescription')} placeholder="{history}">
              <strong>{t('vendor.driver.wholeHistory')}</strong>
            </SentenceWith>
          }
          confirmLabel={t('vendor.remove.confirm')}
          pendingLabel={t('vendor.remove.removing')}
          cancelLabel={t('vendor.remove.keepThem')}
          onOpenChange={(open) => !open && close()}
          onConfirm={() =>
            remove.mutate({ id: target.id, label: target.name }, { onSuccess: close })
          }
        />
      )}

      <DriverDetailSheet
        driver={overlay === 'detail' ? (detail.data ?? null) : null}
        vendorName={vendor.name}
        assignments={assignments.data}
        documents={documents.data}
        isLoading={detail.isPending || assignments.isPending || documents.isPending}
        canManage={canManage}
        isPhotoPending={photo.upload.isPending}
        open={overlay === 'detail'}
        onOpenChange={(open) => !open && close()}
        onPhotoChosen={(file) => target && photo.upload.mutate({ id: target.id, file })}
      />
    </>
  )
}
