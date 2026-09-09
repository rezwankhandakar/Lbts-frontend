import {
  Eye,
  FileText,
  MoreHorizontal,
  PencilLine,
  ShieldCheck,
  Trash2,
  TruckIcon,
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
import type { DriverRecord } from '../types'
import { ComplianceChips, DocumentStatusBadge, DriverStatusBadge } from './status-badges'
import { DriverAvatar } from './vendor-identity'

export interface DriverActions {
  canManage: boolean
  onOpen: (driver: DriverRecord) => void
  onEdit: (driver: DriverRecord) => void
  onStatus: (driver: DriverRecord) => void
  onAssign: (driver: DriverRecord) => void
  onDocuments: (driver: DriverRecord) => void
  onDelete: (driver: DriverRecord) => void
}

export function DriverMenu({
  driver,
  actions,
}: {
  driver: DriverRecord
  actions: DriverActions
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={`Actions for ${driver.name}`}
          />
        }
      >
        <MoreHorizontal aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => actions.onOpen(driver)}>
          <Eye aria-hidden />
          View details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => actions.onDocuments(driver)}>
          <FileText aria-hidden />
          Documents
        </DropdownMenuItem>

        {actions.canManage && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => actions.onEdit(driver)}>
              <PencilLine aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onAssign(driver)}>
              <TruckIcon aria-hidden />
              {driver.currentVehicle ? 'Change vehicle' : 'Assign vehicle'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => actions.onStatus(driver)}>
              <ShieldCheck aria-hidden />
              Change status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => actions.onDelete(driver)}>
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
 * The drivers as rows.
 *
 * **No NID column, deliberately.** A table of eighteen drivers has no use for
 * eighteen national ID numbers, and putting them here spreads personal data
 * across every screen that shows a fleet — the API leaves the field out of the
 * list shape entirely, so there is nothing here to render even by mistake. It is
 * on the detail sheet, for the one driver somebody has opened.
 *
 * The licence expiry carries its own status chip rather than a bare date,
 * because "20 Sep 2026" means nothing at a glance and "Expires in 12 days" is
 * the thing somebody acts on. The phrase is written by the server, so every
 * surface says it the same way.
 */
export function DriverTable({
  records,
  actions,
}: {
  records: DriverRecord[]
  actions: DriverActions
}) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Driver</TableHead>
            <TableHead className="hidden lg:table-cell">Mobile</TableHead>
            <TableHead>Licence</TableHead>
            <TableHead className="hidden xl:table-cell">Assigned vehicle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Documents</TableHead>
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
                  className="flex min-w-0 items-center gap-2.5 rounded-sm text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <DriverAvatar name={record.name} photoUrl={record.photoUrl} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{record.name}</span>
                    <span className="block font-mono text-[11px] text-muted-foreground">
                      {record.driverCode}
                    </span>
                  </span>
                </button>
              </TableCell>

              <TableCell className="hidden text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                {record.mobile}
              </TableCell>

              <TableCell>
                {record.licenseNumber ? (
                  <span className="block min-w-0">
                    <span className="block truncate text-[13px]">{record.licenseNumber}</span>
                    {record.licenceStatus ? (
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <DocumentStatusBadge value={record.licenceStatus} />
                        <span className="text-[11px] text-muted-foreground">
                          {formatDay(record.licenseExpiry)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">No expiry recorded</span>
                    )}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Not recorded</span>
                )}
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                {record.currentVehicle ? (
                  <span className="text-[13px]">{record.currentVehicle.registrationNo}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">Unassigned</span>
                )}
              </TableCell>

              <TableCell>
                <DriverStatusBadge value={record.status} />
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                <ComplianceChips tally={record.documents} />
              </TableCell>

              <TableCell>
                <DriverMenu driver={record} actions={actions} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
