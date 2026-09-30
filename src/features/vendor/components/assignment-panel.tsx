import { useCallback, useState } from 'react'
import { Plus, Route, X } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
import { SentenceWith } from '@/components/shared/sentence-with'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { activeAssignmentFrom } from '../api/vendor-api'
import {
  useAssignableDrivers,
  useAssignableVehicles,
  useAssignments,
  useCreateAssignment,
  useDeleteAssignment,
  useEndAssignment,
} from '../hooks/use-fleet'
import { useAssignmentListParams } from '../hooks/use-list-params'
import { reportVendorError } from '../hooks/use-vendors'
import { assignmentStatusMeta, formatDay } from '../lib/vendor-meta'
import type { AssignmentFormValues } from '../schemas/vendor-schemas'
import { ASSIGNMENT_STATUSES } from '../types'
import type { AssignmentRecord, AssignmentStatus, VendorRecord } from '../types'
import { AssignDriverDialog } from './assign-driver-dialog'
import { AssignmentCards, AssignmentTable } from './assignment-table'
import { ConfirmDialog } from './confirm-dialog'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'
import { useT } from '@/lib/i18n'

interface AssignmentPanelProps {
  vendor: VendorRecord
  canManage: boolean
  /** Open the assign dialog straight away, preselected from another tab. */
  pendingAssign: { vehicleId?: string; driverId?: string } | null
  onAssignHandled: () => void
}

const TRIGGER = 'h-8 w-full sm:w-[10.5rem]'

/**
 * The assignments tab: the whole history, filtered.
 *
 * The filters are the vehicle, the driver, the status and a date range, and the
 * date range is the one worth explaining. It asks "which assignments were in
 * force during this window" rather than "which started in it" — an assignment
 * that began in July and is still running is part of September, and a filter on
 * the start date alone would hide exactly the row somebody was looking for.
 */
export function AssignmentPanel({
  vendor,
  canManage,
  pendingAssign,
  onAssignHandled,
}: AssignmentPanelProps) {
  const t = useT()

  const { params, applied, isFiltered, applyFilters, setPage, clampToPages, reset } =
    useAssignmentListParams()

  const [assignOpen, setAssignOpen] = useState(false)
  const [conflict, setConflict] = useState<AssignmentRecord | null>(null)
  const [target, setTarget] = useState<AssignmentRecord | null>(null)
  const [overlay, setOverlay] = useState<'end' | 'delete' | null>(null)

  const query = useAssignments(vendor.id, applied)
  const create = useCreateAssignment(vendor.id)
  const end = useEndAssignment()
  const remove = useDeleteAssignment()

  // Only fetched once the dialog is actually open, so a history tab does not
  // pay for two selector lists nobody looked at.
  const isAssigning = assignOpen || pendingAssign !== null
  const vehicles = useAssignableVehicles(vendor.id, isAssigning)
  const drivers = useAssignableDrivers(vendor.id, isAssigning)

  const records = query.data?.records ?? []
  const meta = query.data?.meta

  if (meta && params.page > meta.totalPages) {
    clampToPages(meta.totalPages)
  }

  const closeAssign = useCallback(() => {
    setAssignOpen(false)
    setConflict(null)
    onAssignHandled()
  }, [onAssignHandled])

  /**
   * The two-step handover.
   *
   * The first attempt goes without `replaceActive`, so a vehicle that already
   * has a driver is refused with a 409 carrying that assignment. That is not a
   * failure to report — it is the question the dialog then asks — so it is
   * narrowed here and put back into the form rather than raised as a toast.
   * Anything else is a real error and is reported.
   */
  const submitAssignment = useCallback(
    (values: AssignmentFormValues, replaceActive: boolean) => {
      create.mutate(
        {
          vehicleId: values.vehicleId,
          driverId: values.driverId,
          assignedFrom: values.assignedFrom,
          assignedUntil: values.assignedUntil || null,
          replaceActive,
          note: values.note || undefined,
        },
        {
          onSuccess: closeAssign,
          onError: (error) => {
            const current = error.statusCode === 409 ? activeAssignmentFrom(error.body) : null

            if (current) {
              setConflict(current)
              return
            }
            reportVendorError(error)
          },
        },
      )
    },
    [create, closeAssign],
  )

  const isPending = create.isPending || end.isPending || remove.isPending

  return (
    <>
      <Panel label={t('vendor.assignment.panel')}>
        <div className="border-b">
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Select
                value={params.status}
                onValueChange={(value) =>
                  applyFilters({ status: value as AssignmentStatus | 'all' })
                }
              >
                <SelectTrigger className={TRIGGER} aria-label={t('vendor.assignment.statusAria')}>
                  <SelectValue>
                    {(value) =>
                      value && value !== 'all'
                        ? assignmentStatusMeta(value, t).label
                        : t('vendor.assignment.activeAndEnded')
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">{t('vendor.assignment.activeAndEnded')}</SelectItem>
                    {ASSIGNMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {assignmentStatusMeta(status, t).label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={params.from}
                  onChange={(event) => applyFilters({ from: event.target.value })}
                  aria-label={t('vendor.assignment.fromAria')}
                  className="h-8 w-full sm:w-[9.5rem]"
                />
                <span className="text-xs text-muted-foreground">{t('common.labels.to')}</span>
                <Input
                  type="date"
                  value={params.to}
                  onChange={(event) => applyFilters({ to: event.target.value })}
                  aria-label={t('vendor.assignment.untilAria')}
                  className="h-8 w-full sm:w-[9.5rem]"
                />
              </div>

              {isFiltered && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={reset}
                  className="text-muted-foreground"
                >
                  <X data-icon="inline-start" aria-hidden />
                  {t('common.actions.clear')}
                </Button>
              )}

              {canManage && (
                <Button size="sm" onClick={() => setAssignOpen(true)} className="sm:ml-auto">
                  <Plus data-icon="inline-start" aria-hidden />
                  {t('vendor.assignment.assign')}
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground" aria-live="polite">
              {meta && !query.isPending
                ? t(
                    isFiltered ? 'vendor.assignment.summaryRange' : 'vendor.assignment.summaryTotal',
                    { count: meta.total },
                  )
                : t('vendor.assignment.rangeNote')}
            </p>
          </div>
        </div>

        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title={t('vendor.assignment.loadFailed')}
            message={query.error?.message ?? t('vendor.somethingWrong')}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={Route}
            title={t('vendor.assignment.noneYet')}
            description={t('vendor.assignment.noneHint')}
            isFiltered={isFiltered}
            onReset={reset}
            action={
              canManage
                ? { label: t('vendor.assignment.assign'), onClick: () => setAssignOpen(true) }
                : undefined
            }
          />
        ) : (
          (() => {
            const actions = {
              canManage,
              onEnd: (assignment: AssignmentRecord) => {
                setTarget(assignment)
                setOverlay('end')
              },
              onDelete: (assignment: AssignmentRecord) => {
                setTarget(assignment)
                setOverlay('delete')
              },
            }

            return (
              <>
                <AssignmentTable records={records} actions={actions} />
                <AssignmentCards records={records} actions={actions} />
              </>
            )
          })()
        )}

        {meta && !query.isError && (
          <ListPagination
            meta={meta}
            onPageChange={setPage}
            isFetching={query.isFetching}
            nounKey="nouns.assignment"
          />
        )}
      </Panel>

      <AssignDriverDialog
        open={isAssigning}
        isPending={isPending}
        vendorName={vendor.name}
        vehicles={vehicles.data ?? []}
        drivers={drivers.data ?? []}
        isLoadingOptions={vehicles.isPending || drivers.isPending}
        defaultVehicleId={pendingAssign?.vehicleId}
        defaultDriverId={pendingAssign?.driverId}
        conflict={conflict}
        onOpenChange={(open) => !open && closeAssign()}
        onSubmit={submitAssignment}
      />

      {target && (
        <ConfirmDialog
          open={overlay === 'end'}
          isPending={isPending}
          tone="neutral"
          title={t('vendor.assignment.endTitle')}
          description={
            t('vendor.assignment.endDescription', {
              driver: target.driver?.name ?? t('vendor.assignment.theDriver'),
              vehicle: target.vehicle?.registrationNo ?? t('vendor.assignment.thisVehicle'),
            })
          }
          confirmLabel={t('vendor.assignment.endConfirm')}
          pendingLabel={t('vendor.assignment.ending')}
          onOpenChange={(open) => !open && setOverlay(null)}
          onConfirm={() => end.mutate({ id: target.id }, { onSuccess: () => setOverlay(null) })}
        />
      )}

      {target && (
        <ConfirmDialog
          open={overlay === 'delete'}
          isPending={isPending}
          title={t('vendor.assignment.deleteTitle')}
          description={
            <>
              <SentenceWith
                text={t('vendor.assignment.deleteDescription')}
                parts={{
                  never: <strong>{t('vendor.assignment.neverExisted')}</strong>,
                  ends: <em>{t('vendor.assignment.endConfirm')}</em>,
                }}
              />
              {target.assignedFrom
                ? ` ${t('vendor.assignment.deletePeriod', {
                    from: formatDay(target.assignedFrom),
                    until: target.assignedUntil
                      ? formatDay(target.assignedUntil)
                      : t('vendor.assignment.now'),
                  })}`
                : ''}
            </>
          }
          confirmLabel={t('vendor.assignment.deleteConfirm')}
          pendingLabel={t('common.states.deleting')}
          cancelLabel={t('vendor.remove.keepIt')}
          onOpenChange={(open) => !open && setOverlay(null)}
          onConfirm={() => remove.mutate(target.id, { onSuccess: () => setOverlay(null) })}
        />
      )}
    </>
  )
}
