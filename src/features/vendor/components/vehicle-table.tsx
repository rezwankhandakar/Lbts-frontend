import {
  Eye,
  FileText,
  MoreHorizontal,
  PencilLine,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDay } from '../lib/vendor-meta'
import type { VehicleRecord } from '../types'
import { ComplianceChips, OwnershipBadge, VehicleStatusBadge } from './status-badges'

export interface VehicleActions {
  canManage: boolean
  onOpen: (vehicle: VehicleRecord) => void
  onEdit: (vehicle: VehicleRecord) => void
  onStatus: (vehicle: VehicleRecord) => void
  onAssign: (vehicle: VehicleRecord) => void
  onDocuments: (vehicle: VehicleRecord) => void
  onDelete: (vehicle: VehicleRecord) => void
}

/**
 * The row menu, shared by the table and the cards so the two cannot drift about
 * what a vehicle can have done to it.
 */
export function VehicleMenu({
  vehicle,
  actions,
}: {
  vehicle: VehicleRecord
  actions: VehicleActions
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Actions for ${vehicle.registrationNo}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => actions.onOpen(vehicle)}>
          <Eye aria-hidden />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onDocuments(vehicle)}>
          <FileText aria-hidden />
          Documents
        </DropdownMenuItem>

        {actions.canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onEdit(vehicle)}>
              <PencilLine aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onAssign(vehicle)}>
              <UserPlus aria-hidden />
              {vehicle.currentDriver ? 'Change driver' : 'Assign driver'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onStatus(vehicle)}>
              <ShieldCheck aria-hidden />
              Change status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(vehicle)}>
              <Trash2 aria-hidden />
              Remove
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * The fleet as rows, on a screen wide enough for them.
 *
 * The current driver is a resolved value rather than a stored one — the vehicle
 * carries no `currentDriverId`, and this column is filled from the assignment
 * collection in one lookup for the whole page. A vehicle with nobody on it says
 * so plainly rather than leaving a blank, because "no driver assigned" is a
 * state somebody acts on and an empty cell reads as missing data.
 */
export function VehicleTable({
  records,
  actions,
}: {
  records: VehicleRecord[]
  actions: VehicleActions
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration</TableHead>
            <TableHead className="hidden lg:table-cell">Brand / model</TableHead>
            <TableHead className="hidden xl:table-cell">Ownership</TableHead>
            <TableHead>Current driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Documents</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => (
            <TableRow
              key={record.id}
              className={cn(record.status === 'Inactive' && 'opacity-60')}
            >
              <TableCell>
                <button
                  type="button"
                  onClick={() => actions.onOpen(record)}
                  className="rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="block text-[13px] font-medium wrap-break-word">
                    {record.registrationNo}
                  </span>
                  <span className="block font-mono text-[11px] text-muted-foreground">
                    {record.vehicleCode}
                  </span>
                </button>
              </TableCell>

              <TableCell className="hidden text-[13px] wrap-break-word lg:table-cell">
                {record.brand || record.model ? (
                  <>
                    {record.brand}
                    {record.brand && record.model ? ' · ' : ''}
                    {record.model}
                  </>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                <OwnershipBadge value={record.ownershipType} />
              </TableCell>

              <TableCell>
                {record.currentDriver ? (
                  <span className="block min-w-0">
                    <span className="block truncate text-[13px]">
                      {record.currentDriver.name}
                    </span>
                    <span className="block text-[11px] text-muted-foreground">
                      since {formatDay(record.currentDriver.assignedFrom)}
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">No driver assigned</span>
                )}
              </TableCell>

              <TableCell>
                <VehicleStatusBadge value={record.status} />
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                <ComplianceChips tally={record.documents} />
              </TableCell>

              <TableCell>
                <VehicleMenu vehicle={record} actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
