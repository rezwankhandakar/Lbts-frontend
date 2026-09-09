import { Link } from 'react-router-dom'
import { ChevronRight, MoreHorizontal, PencilLine, ShieldCheck, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { VendorRecord } from '../types'
import { ComplianceChips, VendorStatusBadge } from './status-badges'
import { VendorAvatar } from './vendor-identity'

interface VendorCardsProps {
  records: VendorRecord[]
  canManage: boolean
  onEdit: (vendor: VendorRecord) => void
  onChangeStatus: (vendor: VendorRecord) => void
  onDelete: (vendor: VendorRecord) => void
}

/**
 * The same directory on a narrow screen.
 *
 * A swap rather than a horizontally scrolling table. Seven columns squeezed onto
 * a phone is a table nobody can read and a scrollbar nobody finds, whereas a
 * card can put the two counts on one line and the status on the next and still
 * be scanned with a thumb.
 *
 * The card body is the link; the menu sits outside it, because a tap target
 * inside a link is a tap target that sometimes navigates instead.
 */
export function VendorCards({
  records,
  canManage,
  onEdit,
  onChangeStatus,
  onDelete,
}: VendorCardsProps) {
  return (
    <ul className="divide-y md:hidden">
      {records.map((record) => {
        const counts = record.counts

        return (
          <li
            key={record.id}
            className={cn(
              'flex items-start gap-3 p-4',
              record.status === 'Inactive' && 'opacity-60',
            )}
          >
            <Link
              to={`/vendors/${record.id}`}
              className="flex min-w-0 flex-1 items-start gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <VendorAvatar name={record.name} photoUrl={record.photoUrl} className="size-10" />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-sm font-medium wrap-break-word">{record.name}</p>
                  <ChevronRight
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                </div>

                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                  {record.vendorCode} · {record.mobile}
                </p>

                {counts && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground tabular-nums">
                      {counts.vehicles}
                    </span>{' '}
                    {counts.vehicles === 1 ? 'vehicle' : 'vehicles'} ·{' '}
                    <span className="font-medium text-foreground tabular-nums">
                      {counts.drivers}
                    </span>{' '}
                    {counts.drivers === 1 ? 'driver' : 'drivers'}
                  </p>
                )}

                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <VendorStatusBadge value={record.status} />
                  {counts && (
                    <ComplianceChips
                      tally={{
                        total: counts.expiredDocuments + counts.expiringDocuments || 1,
                        expired: counts.expiredDocuments,
                        expiringSoon: counts.expiringDocuments,
                      }}
                    />
                  )}
                </div>
              </div>
            </Link>

            {canManage && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 shrink-0"
                      aria-label={`Actions for ${record.name}`}
                    />
                  }
                >
                  <MoreHorizontal aria-hidden />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(record)}>
                    <PencilLine aria-hidden />
                    Edit details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus(record)}>
                    <ShieldCheck aria-hidden />
                    Change status
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => onDelete(record)}>
                    <Trash2 aria-hidden />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </li>
        )
      })}
    </ul>
  )
}
