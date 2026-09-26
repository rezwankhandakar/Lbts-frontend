import { Link } from 'react-router-dom'
import { Checkbox } from '@/components/ui/checkbox'
import { BillRefChip } from '@/features/bill/components/bill-badges'
import { shortChallanNumber } from '@/features/challan/lib/challan-meta'
import { rateDescription, rateLabel } from '@/features/product-rate/lib/rate-format'
import { formatDate, formatTaka } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { KIND_META } from '../lib/trip-do-meta'
import type { TripDoRowRecord } from '../types'
import { KindTag, RowStatusBadge } from './trip-do-badges'
import { Dash, LocationCell, QtyCell, TextCell, TripNumbersCell } from './trip-do-cells'
import { TripDoLinkCell } from './trip-do-link-cell'
import { TripDoRowMenu } from './trip-do-row-menu'

export interface RowActions {
  onLink: (row: TripDoRowRecord) => void
  onSplit: (row: TripDoRowRecord) => void
  onMerge: (row: TripDoRowRecord) => void
  onUnlink: (row: TripDoRowRecord) => void
}

interface TripDoSheetRowProps extends RowActions {
  row: TripDoRowRecord
  banded: boolean
  canWrite: boolean
  isSelected: boolean
  onToggle: (row: TripDoRowRecord) => void
}

const CELL = 'border-r border-b border-border/50 px-2.5 py-2 align-middle whitespace-nowrap'

/**
 * Pinned cells inherit the row's background rather than setting their own, so
 * a band, a hover and a tick all reach them — and every background here is
 * opaque, because a see-through pinned cell shows the columns scrolling under
 * it.
 */
const BACKGROUND = {
  plain: 'bg-card',
  banded: 'bg-[color-mix(in_oklch,var(--card),var(--muted)_55%)]',
  selected: 'bg-[color-mix(in_oklch,var(--card),var(--primary)_8%)]',
}

export function TripDoSheetRow({
  row,
  banded,
  canWrite,
  isSelected,
  onToggle,
  ...actions
}: TripDoSheetRowProps) {
  const t = useT()

  const kind = KIND_META[row.kind]
  const link = row.link

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-accent',
        isSelected ? BACKGROUND.selected : banded ? BACKGROUND.banded : BACKGROUND.plain,
      )}
    >
      {canWrite && (
        <td className={cn(CELL, 'sticky left-0 z-10 bg-inherit px-0 text-center', kind.accent)}>
          <Checkbox
            checked={isSelected}
            disabled={Boolean(row.bill)}
            onCheckedChange={() => onToggle(row)}
            aria-label={`Tick ${row.challanNumber} ${row.model}`}
          />
        </td>
      )}

      <td
        className={cn(
          CELL,
          'sticky z-10 bg-inherit',
          canWrite ? 'left-9' : cn('left-0', kind.accent),
        )}
      >
        <div className="flex flex-col gap-0.5">
          <span className="flex items-center gap-1.5">
            <Link
              to={`/challan/${row.challanId}`}
              className="font-mono text-[12.5px] font-semibold tabular-nums hover:text-primary hover:underline"
              title={`Open ${row.challanNumber}`}
            >
              {row.slNumber}
            </Link>
            <KindTag kind={row.kind} />
          </span>
          <span className="font-mono text-[10.5px] text-muted-foreground">
            {shortChallanNumber(row.challanNumber)}
          </span>
        </div>
      </td>

      <td className={cn(CELL, 'tabular-nums')}>{formatDate(row.date)}</td>
      <td className={CELL}>
        <TripNumbersCell tripNumbers={row.tripNumbers} />
      </td>
      <td className={CELL}>
        <RowStatusBadge status={row.deliveryStatus} />
      </td>
      <td className={CELL}>
        <TextCell value={row.customerName} width="max-w-[13rem]" strong />
      </td>
      <td className={CELL}>
        <TextCell value={row.deliveryAddress} width="max-w-[18rem]" muted />
      </td>
      <td className={CELL}>{row.district || <Dash />}</td>
      <td className={CELL}>{row.thana || <Dash />}</td>
      <td className={CELL}>
        <LocationCell locationType={row.locationType} />
      </td>
      <td className={cn(CELL, 'font-mono tabular-nums')}>{row.receiverMobile || <Dash />}</td>
      <td className={CELL}>
        <TextCell value={row.zonePo ?? ''} width="max-w-[9rem]" />
      </td>
      <td className={cn(CELL, kind.text)}>
        <TextCell value={row.productName} width="max-w-[12rem]" strong />
      </td>
      <td className={cn(CELL, 'font-mono text-[12px]', kind.text)}>{row.model || <Dash />}</td>
      <td className={cn(CELL, 'text-right')}>
        <QtyCell row={row} />
      </td>
      <td className={cn(CELL, 'text-right tabular-nums')} title={rateDescription(row.rate, t)}>
        {row.rate ? rateLabel(row.rate) : <Dash />}
      </td>
      <td className={cn(CELL, 'text-right font-medium tabular-nums')}>
        {row.amount === null ? <Dash /> : formatTaka(row.amount)}
      </td>
      <td className={CELL}>
        <TextCell value={row.capacity} width="max-w-[10rem]" muted />
      </td>
      <td className={cn(CELL, 'font-mono text-[12px]')}>{link?.csd || <Dash />}</td>
      <td className={cn(CELL, 'font-mono text-[12px]')}>{link?.unit || <Dash />}</td>
      <td className={CELL}>
        <BillRefChip bill={row.bill} />
      </td>

      <td
        className={cn(
          CELL,
          'sticky right-0 z-10 border-l bg-inherit py-1.5 pr-1 shadow-[-10px_0_14px_-14px_var(--foreground)]',
        )}
      >
        <div className="flex items-center gap-1">
          {/* A billed row keeps the Trip DO the bill charged it under. */}
          <TripDoLinkCell row={row} canWrite={canWrite && !row.bill} onLink={actions.onLink} />
          <TripDoRowMenu row={row} canWrite={canWrite} {...actions} />
        </div>
      </td>
    </tr>
  )
}
