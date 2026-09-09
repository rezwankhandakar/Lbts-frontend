import { useCallback, useState } from 'react'
import { Plus, Route, X } from 'lucide-react'
import { ListPagination } from '@/components/shared/list-pagination'
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
import { formatDay } from '../lib/vendor-meta'
import type { AssignmentFormValues } from '../schemas/vendor-schemas'
import { ASSIGNMENT_STATUSES } from '../types'
import type { AssignmentRecord, AssignmentStatus, VendorRecord } from '../types'
import { AssignDriverDialog } from './assign-driver-dialog'
import { AssignmentCards, AssignmentTable } from './assignment-table'
import { ConfirmDialog } from './confirm-dialog'
import { Panel, PanelEmpty, PanelError, PanelSkeleton } from './panel-states'

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
      <Panel label="Assignments">
        <div className="border-b">
          <div className="flex flex-col gap-3 p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Select
                value={params.status}
                onValueChange={(value) =>
                  applyFilters({ status: value as AssignmentStatus | 'all' })
                }
              >
                <SelectTrigger className={TRIGGER} aria-label="Filter by assignment status">
                  <SelectValue>
                    {(value) => (value && value !== 'all' ? String(value) : 'Active and ended')}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">Active and ended</SelectItem>
                    {ASSIGNMENT_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
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
                  aria-label="In force from"
                  className="h-8 w-full sm:w-[9.5rem]"
                />
                <span className="text-xs text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={params.to}
                  onChange={(event) => applyFilters({ to: event.target.value })}
                  aria-label="In force until"
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
                  Clear
                </Button>
              )}

              {canManage && (
                <Button size="sm" onClick={() => setAssignOpen(true)} className="sm:ml-auto">
                  <Plus data-icon="inline-start" aria-hidden />
                  Assign driver
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground" aria-live="polite">
              {meta && !query.isPending
                ? `${meta.total} ${meta.total === 1 ? 'assignment' : 'assignments'}${
                    isFiltered ? ' in force during this range' : ' on record'
                  }`
                : 'A date range shows every assignment in force during it, not only those that started in it.'}
            </p>
          </div>
        </div>

        {query.isPending ? (
          <PanelSkeleton />
        ) : query.isError ? (
          <PanelError
            title="Could not load the assignments"
            message={query.error?.message ?? 'Something went wrong.'}
            onRetry={() => void query.refetch()}
            isRetrying={query.isFetching}
          />
        ) : records.length === 0 ? (
          <PanelEmpty
            icon={Route}
            title="No assignments yet"
            description="Assigning a driver to a vehicle records a period rather than setting a field, so this list is the full history of who drove what and when."
            isFiltered={isFiltered}
            onReset={reset}
            action={
              canManage ? { label: 'Assign driver', onClick: () => setAssignOpen(true) } : undefined
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
            noun={['assignment', 'assignments']}
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
          title="End this assignment?"
          description={
            <>
              {target.driver?.name ?? 'The driver'} stops being the active driver of{' '}
              {target.vehicle?.registrationNo ?? 'this vehicle'} as of today, and the row stays in
              the history with today as its end date. The vehicle will have no driver until another
              one is assigned.
            </>
          }
          confirmLabel="End assignment"
          pendingLabel="Ending…"
          onOpenChange={(open) => !open && setOverlay(null)}
          onConfirm={() => end.mutate({ id: target.id }, { onSuccess: () => setOverlay(null) })}
        />
      )}

      {target && (
        <ConfirmDialog
          open={overlay === 'delete'}
          isPending={isPending}
          title="Delete this assignment record?"
          description={
            <>
              This is for a row that <strong>should never have existed</strong> — a changeover typed
              against the wrong vehicle, for instance. It is not how an assignment finishes: a
              period that genuinely ran is history the operation may need, and{' '}
              <em>End assignment</em> is what closes one.
              {target.assignedFrom
                ? ` This row covers ${formatDay(target.assignedFrom)} to ${
                    target.assignedUntil ? formatDay(target.assignedUntil) : 'now'
                  }.`
                : ''}
            </>
          }
          confirmLabel="Delete record"
          pendingLabel="Deleting…"
          cancelLabel="Keep it"
          onOpenChange={(open) => !open && setOverlay(null)}
          onConfirm={() => remove.mutate(target.id, { onSuccess: () => setOverlay(null) })}
        />
      )}
    </>
  )
}
