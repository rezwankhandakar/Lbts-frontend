import { Link } from 'react-router-dom'
import { Eye, MoreHorizontal, PencilLine, ShieldCheck, Trash2 } from 'lucide-react'
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
import type { VendorRecord } from '../types'
import { ComplianceChips, VendorStatusBadge } from './status-badges'
import { VendorIdentity } from './vendor-identity'

interface VendorTableProps {
  records: VendorRecord[]
  canManage: boolean
  onEdit: (vendor: VendorRecord) => void
  onChangeStatus: (vendor: VendorRecord) => void
  onDelete: (vendor: VendorRecord) => void
}

/**
 * The vendor directory as rows, on a screen wide enough for them.
 *
 * Below `md` the cards take over — see `vendor-cards.tsx`. That is a swap rather
 * than a horizontal scroll, because eight columns squeezed onto a phone is a
 * table nobody can read and a scrollbar nobody finds.
 *
 * Contact, vehicles and drivers drop out progressively as the viewport narrows,
 * in the order somebody would give them up: the counts before the number, and
 * the number before the status.
 */
export function VendorTable({
  records,
  canManage,
  onEdit,
  onChangeStatus,
  onDelete,
}: VendorTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead className="hidden lg:table-cell">Contact</TableHead>
            <TableHead className="w-20 text-right">Vehicles</TableHead>
            <TableHead className="w-20 text-right">Drivers</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Compliance</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => {
            const counts = record.counts

            return (
              <TableRow
                key={record.id}
                className={cn(record.status === 'Inactive' && 'opacity-60')}
              >
                <TableCell>
                  {/* The whole identity is the link, so the target is the row's
                      largest object rather than a word at the end of it. */}
                  <Link
                    to={`/vendors/${record.id}`}
                    className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <VendorIdentity
                      name={record.name}
                      vendorCode={record.vendorCode}
                      photoUrl={record.photoUrl}
                    />
                  </Link>
                </TableCell>

                <TableCell className="hidden text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                  {record.mobile}
                </TableCell>

                <TableCell className="text-right text-sm tabular-nums">
                  {counts ? (
                    <span>
                      {counts.vehicles}
                      {counts.vehicles > 0 && (
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          ({counts.activeVehicles} active)
                        </span>
                      )}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell className="text-right text-sm tabular-nums">
                  {counts ? (
                    <span>
                      {counts.drivers}
                      {counts.drivers > 0 && (
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          ({counts.activeDrivers} active)
                        </span>
                      )}
                    </span>
                  ) : (
                    '—'
                  )}
                </TableCell>

                <TableCell>
                  <VendorStatusBadge value={record.status} />
                </TableCell>

                <TableCell className="hidden xl:table-cell">
                  {counts && (
                    <ComplianceChips
                      tally={{
                        total: counts.expiredDocuments + counts.expiringDocuments || 1,
                        expired: counts.expiredDocuments,
                        expiringSoon: counts.expiringDocuments,
                      }}
                    />
                  )}
                </TableCell>

                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Actions for ${record.name}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem render={<Link to={`/vendors/${record.id}`} />}>
                        <Eye aria-hidden />
                        Open
                      </DropdownMenuItem>

                      {canManage && (
                        <>
                          <DropdownMenuItem onClick={() => onEdit(record)}>
                            <PencilLine aria-hidden />
                            Edit details
                          </DropdownMenuItem>

                          <DropdownMenuItem onClick={() => onChangeStatus(record)}>
                            <ShieldCheck aria-hidden />
                            Change status
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => onDelete(record)}
                          >
                            <Trash2 aria-hidden />
                            Remove
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
