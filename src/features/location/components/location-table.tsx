import { MoreHorizontal, PencilLine, PowerOff, Power, Trash2 } from 'lucide-react'
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
import type { LocationRecord } from '../types'
import { LocationTypeBadge } from './location-badges'

interface LocationTableProps {
  records: LocationRecord[]
  canManage: boolean
  onEdit: (location: LocationRecord) => void
  onToggleActive: (location: LocationRecord) => void
  onDelete: (location: LocationRecord) => void
}

/**
 * The master list as rows.
 *
 * Sorted by district then thana on the server, because this is a reference
 * list: somebody looking for Savar is looking for it under S, not at whichever
 * end of a creation date it happens to sit.
 *
 * A deactivated row is dimmed rather than hidden. It is still the row a year
 * of challans point at, and an Admin who deactivated one by mistake has to be
 * able to find it and turn it back on.
 */
export function LocationTable({
  records,
  canManage,
  onEdit,
  onToggleActive,
  onDelete,
}: LocationTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>District</TableHead>
            <TableHead>Thana</TableHead>
            <TableHead>Location</TableHead>
            <TableHead className="hidden md:table-cell">Source</TableHead>
            <TableHead className="hidden lg:table-cell">Updated</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className={cn(!record.isActive && 'opacity-55')}>
              <TableCell className="font-medium wrap-break-word">{record.district}</TableCell>

              <TableCell className="wrap-break-word">
                <span>{record.thana}</span>
                {!record.isActive && (
                  <span className="ml-2 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Inactive
                  </span>
                )}
              </TableCell>

              <TableCell>
                <LocationTypeBadge value={record.locationType} />
              </TableCell>

              <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                {record.isSeeded ? 'Supplied list' : (record.createdBy?.name ?? 'Added by hand')}
              </TableCell>

              <TableCell className="hidden text-xs whitespace-nowrap text-muted-foreground lg:table-cell">
                {formatDate(record.updatedAt)}
              </TableCell>

              <TableCell>
                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Actions for ${record.district} / ${record.thana}`}
                        />
                      }
                    >
                      <MoreHorizontal aria-hidden />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(record)}>
                        <PencilLine aria-hidden />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => onToggleActive(record)}>
                        {record.isActive ? <PowerOff aria-hidden /> : <Power aria-hidden />}
                        {record.isActive ? 'Deactivate' : 'Reactivate'}
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(record)}>
                        <Trash2 aria-hidden />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
