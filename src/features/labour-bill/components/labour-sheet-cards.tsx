import { CircleDashed, MapPin, Phone, Trash2, Warehouse } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { formatAmount, formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import { MAX_FLOOR_NUMBER, MAX_LABOUR_AMOUNT, groupLineIds } from '../types'
import type { LabourBillLinePatch, LabourBillLineRecord, LabourCsdGroupRecord } from '../types'
import { LabourDriftMark, NoTripDoChip } from './labour-bill-badges'
import type { LabourRemoveTarget } from './labour-bill-sheet-row'
import { LabourCellInput, LabourTextCell } from './labour-cell-input'
import { SignedCopyButton } from './signed-copy-button'

interface LabourSheetCardsProps {
  groups: LabourCsdGroupRecord[]
  canEdit: boolean
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

/**
 * The sheet on a phone: one heading per CSD, one card per challan under it, one
 * block per model inside that.
 *
 * Not a scrollable copy of the table. Thirteen columns cannot be typed into at
 * 360px, and the three cells that matter here are exactly the ones a sideways
 * scroll would bury — so the card keeps what identifies the delivery, and gives
 * the typed figures the full width. The rule the Accounts lists follow: a table
 * from md up, a card list below it, and neither pretending to be the other.
 */
export function LabourSheetCards({ groups, canEdit, onSave, onRemove }: LabourSheetCardsProps) {
  return (
    <div className="space-y-5 p-3 md:hidden">
      {groups.map((group) => (
        <CsdSection
          key={group.key || 'pending'}
          group={group}
          canEdit={canEdit}
          onSave={onSave}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

interface CsdSectionProps {
  group: LabourCsdGroupRecord
  canEdit: boolean
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

/** One CSD's own bill: its heading, its challans, and what it comes to. */
function CsdSection({ group, canEdit, onSave, onRemove }: CsdSectionProps) {
  const lines = group.lines
  const members = groupLineIds(lines)
  const heads = lines.filter((line) => line.slRowSpan > 0)
  const Icon = group.isPending ? CircleDashed : Warehouse

  return (
    <section className="space-y-3">
      <header
        className={cn(
          'rounded-xl border px-3 py-2.5',
          group.isPending ? 'border-tone-amber/30 bg-tone-amber/5' : 'bg-muted/40',
        )}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-[13px] font-semibold',
              group.isPending && 'text-tone-amber',
            )}
          >
            <Icon className="size-4" aria-hidden />
            {group.label}
          </span>
          <span className="ml-auto text-[15px] font-semibold tabular-nums">
            {formatTaka(group.totals.totalAmount)}
          </span>
        </div>
        <p className="mt-0.5 text-[11.5px] text-muted-foreground">
          {group.totals.rows} {group.totals.rows === 1 ? 'row' : 'rows'} · {group.totals.challans}{' '}
          {group.totals.challans === 1 ? 'challan' : 'challans'} · {group.totals.qty} pcs ·{' '}
          {formatAmount(group.totals.labourTotal)} labour · {formatAmount(group.totals.floorTotal)}{' '}
          floor
        </p>
        {group.isPending && (
          <p className="mt-1 text-[11.5px] text-pretty text-muted-foreground">
            No Trip DO yet, so nothing says which CSD these belong to. Set it on the Trip DO sheet
            and each one moves into its own section by itself — with the amounts typed here.
          </p>
        )}
      </header>

      {heads.map((head) => {
        const rows = lines.slice(lines.indexOf(head), lines.indexOf(head) + head.slRowSpan)

        return (
          <article key={head.id} className="overflow-hidden rounded-xl border bg-card shadow-xs">
            <header className="flex items-start gap-3 border-b bg-muted/30 px-3 py-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[13px] font-bold text-primary tabular-nums ring-1 ring-primary/15">
                {head.sl}
              </span>

              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <LabourDriftMark drift={head.drift} />
                  <span className="truncate">{head.customerName || 'No customer'}</span>
                </p>
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">
                  {head.challanNumber} · SL {head.challanSlNumber}
                </p>
              </div>

              <SignedCopyButton
                challanId={head.challanId}
                challanNumber={head.challanNumber}
                className="mt-0.5"
              />

              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Take challan ${head.challanNumber} off the labour bill`}
                  onClick={() =>
                    onRemove({
                      lineIds: members.get(head.id) ?? [head.id],
                      label: `challan ${head.challanNumber}`,
                    })
                  }
                >
                  <Trash2 aria-hidden />
                </Button>
              )}
            </header>

            <dl className="grid gap-1.5 px-3 py-2.5 text-[12.5px]">
              {head.deliveryAddress && (
                <div className="flex gap-1.5 text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span className="text-pretty">{head.deliveryAddress}</span>
                </div>
              )}
              {head.receiverMobile && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="size-3.5 shrink-0" aria-hidden />
                  <a href={`tel:${head.receiverMobile}`} className="font-mono tabular-nums hover:text-primary">
                    {head.receiverMobile}
                  </a>
                </div>
              )}
            </dl>

            <div className="divide-y border-t">
              {rows.map((line) => (
                <ModelBlock key={line.id} line={line} canEdit={canEdit} onSave={onSave} onRemove={onRemove} />
              ))}
            </div>
          </article>
        )
      })}
    </section>
  )
}

interface ModelBlockProps {
  line: LabourBillLineRecord
  canEdit: boolean
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

const FIELD = 'grid gap-1'
const FIELD_LABEL = 'text-[10.5px] font-medium tracking-wide text-muted-foreground uppercase'
const BOXED = 'rounded-md border bg-background'

function ModelBlock({ line, canEdit, onSave, onRemove }: ModelBlockProps) {
  const save = (patch: LabourBillLinePatch) => onSave(line.id, patch)

  return (
    <div className="px-3 py-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="font-mono text-[12px] font-semibold">{line.model || line.productName}</span>
        <span className="rounded-md border bg-muted/50 px-1.5 py-px text-[11px] font-semibold tabular-nums">
          × {line.qty}
        </span>
        {line.csd && (
          <span className="font-mono text-[11px] text-muted-foreground">CSD {line.csd}</span>
        )}
        {line.tripDo ? (
          <Link
            to={`/trip-do?q=${encodeURIComponent(line.tripDo)}`}
            className="font-mono text-[11px] font-semibold text-primary hover:underline"
          >
            DO {line.tripDo}
          </Link>
        ) : (
          <NoTripDoChip />
        )}
        {canEdit && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="ml-auto text-muted-foreground hover:text-destructive"
            aria-label={`Take ${line.model} off the labour bill`}
            onClick={() =>
              onRemove({
                lineIds: [line.id],
                label: `${line.challanNumber} · ${line.model || line.productName}`,
              })
            }
          >
            <Trash2 aria-hidden />
          </Button>
        )}
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className={cn(FIELD, 'col-span-2')}>
          {/* A span rather than a label: every cell carries its own aria-label,
              which names the challan and the model too, so a bare `for` here
              would replace a precise name with a generic one. */}
          <span className={FIELD_LABEL}>Unit / Company</span>
          <LabourTextCell
            value={line.company}
            maxLength={60}
            disabled={!canEdit}
            placeholder={line.unit || '—'}
            label={`Company for ${line.challanNumber} ${line.model}`}
            onCommit={(company) => save({ company })}
            className={cn(BOXED, 'text-left')}
          />
        </div>

        <div className={cn(FIELD, 'col-span-2')}>
          <span className={FIELD_LABEL}>Ven / Pulling / Labour</span>
          <LabourCellInput
            value={line.labourAmount}
            max={MAX_LABOUR_AMOUNT}
            disabled={!canEdit}
            label={`Ven, pulling and labour for ${line.challanNumber} ${line.model}`}
            onCommit={(labourAmount) => save({ labourAmount })}
            className={BOXED}
          />
        </div>

        <div className={FIELD}>
          <span className={FIELD_LABEL}>Floor no.</span>
          <LabourCellInput
            value={line.floorNo}
            max={MAX_FLOOR_NUMBER}
            disabled={!canEdit}
            label={`Floor number for ${line.challanNumber} ${line.model}`}
            onCommit={(floorNo) => save({ floorNo })}
            className={cn(BOXED, 'text-center')}
          />
        </div>

        <div className={FIELD}>
          <span className={FIELD_LABEL}>Floor amount</span>
          <LabourCellInput
            value={line.floorAmount}
            max={MAX_LABOUR_AMOUNT}
            disabled={!canEdit}
            label={`Floor amount for ${line.challanNumber} ${line.model}`}
            onCommit={(floorAmount) => save({ floorAmount })}
            className={BOXED}
          />
        </div>
      </div>

      <p className="mt-2 flex items-baseline justify-between gap-2 border-t pt-2">
        <span className={FIELD_LABEL}>Total</span>
        <span
          className={cn(
            'text-[15px] font-semibold tabular-nums',
            line.total === null && 'text-[12.5px] font-medium text-tone-amber',
          )}
        >
          {line.total === null ? 'Not set' : formatTaka(line.total)}
        </span>
      </p>
    </div>
  )
}
