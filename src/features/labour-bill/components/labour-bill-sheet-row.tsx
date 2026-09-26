import { X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { formatAmount, formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { MAX_FLOOR_NUMBER, MAX_LABOUR_AMOUNT } from '../types'
import type { LabourBillLinePatch, LabourBillLineRecord } from '../types'
import { LabourDriftMark, NoTripDoChip } from './labour-bill-badges'
import { LabourCellInput, LabourTextCell } from './labour-cell-input'
import { SignedCopyButton } from './signed-copy-button'

export interface LabourRemoveTarget {
  lineIds: string[]
  label: string
}

interface LabourBillSheetRowProps {
  line: LabourBillLineRecord
  /** Every row of this challan, for the SL cell's remove button. */
  groupLineIds: string[]
  banded: boolean
  canEdit: boolean
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

export const CELL = 'border-r border-b border-border/60 px-2.5 py-1.5 text-center align-middle'
/** The three typed columns carry a tint, so what is entered by hand reads apart from what was copied. */
export const TYPED_CELL = 'border-r border-b border-border/60 px-1 py-1 align-middle bg-primary/[0.035]'

function Dash() {
  return <span className="text-muted-foreground/60">—</span>
}

/**
 * One row of the labour bill, column for column as the Excel file prints it.
 *
 * The SL cell is drawn once per challan and spans its models, so the screen and
 * the file can never disagree about which models share a number — the preview
 * **is** the file, the arrangement the Excel Bill's sheet already has.
 *
 * What is different here is that four cells are writable, and they are tinted
 * to say so: everything to the left of Ven/Pulling/Labour was copied off the
 * Trip DO sheet and is corrected there, and everything from it rightwards is
 * somebody's own figure and exists nowhere else.
 */
export function LabourBillSheetRow({
  line,
  groupLineIds,
  banded,
  canEdit,
  onSave,
  onRemove,
}: LabourBillSheetRowProps) {
  const t = useT()

  const save = (patch: LabourBillLinePatch) => onSave(line.id, patch)

  return (
    <tr
      className={cn(
        'transition-colors hover:bg-accent/40',
        banded ? 'bg-[color-mix(in_oklch,var(--card),var(--muted)_50%)]' : 'bg-card',
        line.drift !== 'none' && 'shadow-[inset_3px_0_0_var(--tone-amber)]',
      )}
    >
      {line.slRowSpan > 0 && (
        <td
          rowSpan={line.slRowSpan}
          className={cn(CELL, 'group/sl relative w-14 bg-inherit text-[15px] font-semibold tabular-nums')}
        >
          {line.sl}
          {/* The paper this challan was signed for on, at the row that charges
              its handling. Drawn for every reader, and absent while the bill's
              copies are still being read. */}
          <span className="mt-0.5 flex justify-center">
            <SignedCopyButton challanId={line.challanId} challanNumber={line.challanNumber} />
          </span>
          {canEdit && (
            <button
              type="button"
              onClick={() =>
                onRemove({
                  lineIds: groupLineIds,
                  label: t('labourBill.cells.challanLabel', { challan: line.challanNumber }),
                })
              }
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-md text-muted-foreground opacity-0 transition group-hover/sl:opacity-100 hover:bg-destructive/10 hover:text-destructive focus-visible:opacity-100"
              aria-label={t('labourBill.cells.removeChallan', { challan: line.challanNumber })}
              title={t('labourBill.cells.removeChallan', { challan: line.challanNumber })}
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </td>
      )}

      <td className={cn(CELL, 'min-w-[11rem] font-medium')}>
        <span className="inline-flex items-center justify-center gap-1.5">
          <LabourDriftMark drift={line.drift} />
          {line.customerName || <Dash />}
        </span>
      </td>
      <td className={cn(CELL, 'font-mono text-[12px] whitespace-nowrap')}>{line.csd || <Dash />}</td>
      <td className={cn(CELL, 'font-mono whitespace-nowrap tabular-nums')}>
        {line.receiverMobile || <Dash />}
      </td>
      <td className={cn(CELL, 'min-w-[15rem] max-w-[22rem] text-pretty text-muted-foreground leading-snug')}>
        {line.deliveryAddress || <Dash />}
      </td>

      <td className={cn(TYPED_CELL, 'min-w-[9rem]')}>
        <LabourTextCell
          value={line.company}
          maxLength={60}
          disabled={!canEdit}
          placeholder={line.unit || '—'}
          label={t('labourBill.cells.company', {
            challan: line.challanNumber,
            model: line.model,
          })}
          onCommit={(company) => save({ company })}
        />
      </td>

      <td className={cn(CELL, 'font-mono text-[12px] whitespace-nowrap')}>{line.model || <Dash />}</td>
      <td className={cn(CELL, 'font-mono text-[12px] font-semibold whitespace-nowrap')}>
        {line.tripDo ? (
          <Link
            to={`/trip-do?q=${encodeURIComponent(line.tripDo)}`}
            className="hover:text-primary hover:underline"
            title={`${line.gatePassNumber} · ${line.tripDate ? formatTripDate(line.tripDate) : ''} · ${line.challanNumber}`}
          >
            {line.tripDo}
          </Link>
        ) : (
          <NoTripDoChip />
        )}
      </td>
      <td className={cn(CELL, 'text-[13px] font-semibold tabular-nums')}>
        {formatNumber(line.qty)}
      </td>

      <td className={cn(TYPED_CELL, 'w-[7.5rem]')}>
        <LabourCellInput
          value={line.labourAmount}
          max={MAX_LABOUR_AMOUNT}
          disabled={!canEdit}
          label={t('labourBill.cells.labour', {
            challan: line.challanNumber,
            model: line.model,
          })}
          onCommit={(labourAmount) => save({ labourAmount })}
        />
      </td>
      <td className={cn(TYPED_CELL, 'w-[4.5rem]')}>
        <LabourCellInput
          value={line.floorNo}
          max={MAX_FLOOR_NUMBER}
          disabled={!canEdit}
          label={t('labourBill.cells.floorNo', {
            challan: line.challanNumber,
            model: line.model,
          })}
          onCommit={(floorNo) => save({ floorNo })}
          className="text-center"
        />
      </td>
      <td className={cn(TYPED_CELL, 'w-[6.5rem]')}>
        <LabourCellInput
          value={line.floorAmount}
          max={MAX_LABOUR_AMOUNT}
          disabled={!canEdit}
          label={t('labourBill.cells.floorAmount', {
            challan: line.challanNumber,
            model: line.model,
          })}
          onCommit={(floorAmount) => save({ floorAmount })}
        />
      </td>

      <td
        className={cn(
          CELL,
          'w-[7rem] text-right font-semibold whitespace-nowrap tabular-nums',
          line.total === null && 'text-tone-amber',
        )}
      >
        {line.total === null ? (
          <span title={t('labourBill.fields.untypedRow')}>{t('labourBill.notSet')}</span>
        ) : (
          formatAmount(line.total)
        )}
      </td>

      {canEdit && (
        <td className={cn(CELL, 'px-1')}>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() =>
              onRemove({
                lineIds: [line.id],
                label: t('labourBill.cells.lineLabel', {
                  challan: line.challanNumber,
                  model: line.model || line.productName,
                }),
              })
            }
            aria-label={t('labourBill.cells.removeLine', {
              challan: line.challanNumber,
              model: line.model,
            })}
            className="text-muted-foreground hover:text-destructive"
          >
            <X aria-hidden />
          </Button>
        </td>
      )}
    </tr>
  )
}
