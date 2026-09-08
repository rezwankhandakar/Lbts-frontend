import { Layers, MoreHorizontal, PencilLine, Power, PowerOff, Trash2 } from 'lucide-react'
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
import { rateDescription, rateLabel } from '../lib/rate-format'
import { productRateLabel } from '../hooks/use-product-rates'
import type { ProductRateRecord, Rate } from '../types'

interface ProductRateTableProps {
  records: ProductRateRecord[]
  canManage: boolean
  onEdit: (record: ProductRateRecord) => void
  onToggleActive: (record: ProductRateRecord) => void
  onDelete: (record: ProductRateRecord) => void
}

/**
 * The rate card as rows.
 *
 * Sorted by product then model on the server, because this is a reference
 * card: somebody looking for the washing machine rates is looking under W, not
 * at whichever end of a creation date they happen to sit.
 *
 * The three rate columns are the point of the table and they sit together, so
 * a row reads the way the printed card does. A deactivated row is dimmed
 * rather than hidden — it is still the row a year of challans were charged
 * from, and an Admin who switched one off by mistake has to be able to find it.
 */
export function ProductRateTable({
  records,
  canManage,
  onEdit,
  onToggleActive,
  onDelete,
}: ProductRateTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Model</TableHead>
            <TableHead className="hidden lg:table-cell">Capacity</TableHead>
            <TableHead className="text-right">ISD</TableHead>
            <TableHead className="text-right">OSD-Metro</TableHead>
            <TableHead className="text-right">OSD-Thana</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id} className={cn(!record.isActive && 'opacity-55')}>
              <TableCell className="font-medium wrap-break-word">
                {record.productName}
                {!record.isActive && (
                  <span className="ml-2 rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
                    Inactive
                  </span>
                )}
              </TableCell>

              <TableCell className="wrap-break-word">
                {record.productModel ? (
                  <span className="font-mono text-xs">{record.productModel}</span>
                ) : (
                  /* Not an empty cell: a blank model is a rule — this row
                     prices the product whatever model a line names — and an
                     empty space would read as missing data. */
                  <span className="text-xs text-muted-foreground italic">Any model</span>
                )}
              </TableCell>

              <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                {record.capacity || '—'}
              </TableCell>

              <RateCell rate={record.rates.ISD} />
              <RateCell rate={record.rates['OSD-Metro']} />
              <RateCell rate={record.rates['OSD-Thana']} />

              <TableCell>
                {canManage ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          aria-label={`Actions for ${productRateLabel(record)}`}
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
                        Remove
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

/**
 * One figure, or the two of a tiered rate.
 *
 * A tiered cell is marked rather than left to be read as two unrelated
 * numbers: "৳60 / ৳24" means nothing on its own, and the icon plus the title
 * is what turns it into "first five at sixty, then twenty-four". The full
 * sentence is on the row's title so it is reachable without opening the edit
 * dialog.
 */
function RateCell({ rate }: { rate: Rate | null }) {
  return (
    <TableCell className="text-right whitespace-nowrap tabular-nums" title={rateDescription(rate)}>
      <span className="inline-flex items-center gap-1.5">
        {rate?.kind === 'tiered' && (
          <Layers className="size-3 shrink-0 text-tone-amber" aria-label="Tiered rate" />
        )}
        {rateLabel(rate)}
      </span>
    </TableCell>
  )
}
