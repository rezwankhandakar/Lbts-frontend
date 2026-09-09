import { CircleStop, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { AssignmentRecord } from '../types'
import { AssignmentStatusBadge } from './status-badges'

export interface AssignmentActions {
  canManage: boolean
  onEnd: (assignment: AssignmentRecord) => void
  onDelete: (assignment: AssignmentRecord) => void
}

function AssignmentMenu({
  assignment,
  actions,
}: {
  assignment: AssignmentRecord
  actions: AssignmentActions
}) {
  if (!actions.canManage) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Actions for the assignment starting ${assignment.assignedFrom}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        {assignment.status === 'Active' && (
          <DropdownMenuItem onClick={() => actions.onEnd(assignment)}>
            <CircleStop aria-hidden />
            End assignment
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(assignment)}>
          <Trash2 aria-hidden />
          Delete record
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The assignment history as rows.
 *
 * The active one is drawn with a tinted left edge rather than at the top of a
 * separate list, so the history reads as one continuous record — which is what
 * it is. Sorting puts it first anyway; the marker is what makes it findable when
 * somebody has scrolled.
 *
 * Either side may say "removed": a vehicle or driver deleted after an assignment
 * ended leaves history that still has to render, and the row says so rather than
 * disappearing, because the history is the reason the row exists.
 */
export function AssignmentTable({
  records,
  actions,
}: {
  records: AssignmentRecord[]
  actions: AssignmentActions
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>From</TableHead>
            <TableHead>Until</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Recorded</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              className={cn(
                record.status === 'Active' &&
                  'bg-tone-emerald/[0.04] shadow-[inset_2px_0_0_0_var(--tone-emerald)]',
              )}
            >
              <TableCell className="text-[13px] wrap-break-word">
                {record.vehicle?.registrationNo ?? (
                  <span className="text-muted-foreground">Removed vehicle</span>
                )}
              </TableCell>

              <TableCell className="text-[13px] wrap-break-word">
                {record.driver ? (
                  <>
                    <span className="block">{record.driver.name}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {record.driver.mobile}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">Removed driver</span>
                )}
              </TableCell>

              <TableCell className="text-[13px] whitespace-nowrap">
                {formatDay(record.assignedFrom)}
              </TableCell>

              <TableCell className="text-[13px] whitespace-nowrap">
                {record.assignedUntil ? (
                  formatDay(record.assignedUntil)
                ) : (
                  <span className="text-muted-foreground">Current</span>
                )}
              </TableCell>

              <TableCell>
                <AssignmentStatusBadge value={record.status} />
              </TableCell>

              <TableCell className="hidden text-xs whitespace-nowrap text-muted-foreground xl:table-cell">
                {formatDate(record.createdAt)}
                {record.createdBy ? ` · ${record.createdBy.name}` : ''}
              </TableCell>

              <TableCell>
                <AssignmentMenu assignment={record} actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/** The same history on a narrow screen. */
export function AssignmentCards({
  records,
  actions,
}: {
  records: AssignmentRecord[]
  actions: AssignmentActions
}) {
  return (
    <ul className="divide-y md:hidden">
      {records.map((record) => (
        <li
          key={record.id}
          className={cn(
            'p-4',
            record.status === 'Active' &&
              'bg-tone-emerald/[0.04] shadow-[inset_2px_0_0_0_var(--tone-emerald)]',
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium wrap-break-word">
                {record.driver?.name ?? 'Removed driver'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground wrap-break-word">
                {record.vehicle?.registrationNo ?? 'Removed vehicle'}
              </p>
            </div>
            <AssignmentMenu assignment={record} actions={actions} />
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            {formatDay(record.assignedFrom)} —{' '}
            {record.assignedUntil ? formatDay(record.assignedUntil) : 'current'}
          </p>

          <div className="mt-2.5">
            <AssignmentStatusBadge value={record.status} />
          </div>

          {record.note && (
            <p className="mt-2 text-xs leading-snug text-muted-foreground">{record.note}</p>
          )}
        </li>
      ))}
    </ul>
  )
}
