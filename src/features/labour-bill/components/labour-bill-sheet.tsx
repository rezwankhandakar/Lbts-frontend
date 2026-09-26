import { CircleDashed, Warehouse } from 'lucide-react'
import { formatAmount, formatNumber, formatTaka } from '@/lib/format'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { groupLineIds } from '../types'
import type { LabourBillLinePatch, LabourCsdGroupRecord } from '../types'
import { CELL, LabourBillSheetRow } from './labour-bill-sheet-row'
import type { LabourRemoveTarget } from './labour-bill-sheet-row'

interface LabourBillSheetProps {
  groups: LabourCsdGroupRecord[]
  canEdit: boolean
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

/**
 * Headings that stand on their own, merged down both rows of the header.
 *
 * Keys rather than words: this is the **screen**. The workbook the office
 * sends is built on the server and keeps the English headings it has always
 * had — the split the Trip DO sheet and the Excel Bill both make.
 */
const SINGLE_HEADING_KEYS: TranslationKey[] = [
  'labourBill.columns.sl',
  'labourBill.columns.customer',
  'labourBill.columns.csd',
  'labourBill.columns.receiver',
  'labourBill.columns.address',
  'labourBill.columns.unit',
  'labourBill.columns.model',
  'labourBill.columns.tripDo',
  'labourBill.columns.qty',
  'labourBill.columns.labour',
]

const HEAD =
  'z-10 border-r border-b border-border/70 bg-[color-mix(in_oklch,var(--card),var(--primary)_10%)] px-2.5 py-2 text-center align-middle text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase'

const FOOT = cn(
  CELL,
  'border-t-2 border-t-border bg-[color-mix(in_oklch,var(--card),var(--muted)_80%)] py-2.5 font-semibold tabular-nums',
)

/**
 * The labour bill as the Excel file lays it out — the preview is the file.
 *
 * **One table, one section per CSD.** Each section carries a banner naming the
 * CSD, its own SL series starting at 1 and its own total row, because each CSD
 * is a bill the office sends separately — and each becomes its own worksheet on
 * download. They sit in one scrolling table rather than in separate panels so
 * the columns line up down the whole month, which is what makes a sheet
 * checkable.
 *
 * The header is **two rows deep**, because Floor is one column of two cells and
 * that is how the office writes it: flattening it into "Floor No." beside
 * "Floor Amount" would read as two unrelated columns, and the export would then
 * be printing something the screen never showed.
 *
 * It is the table half of the sheet — below `md` the page draws
 * `LabourSheetCards` instead, because thirteen columns on a phone is a sideways
 * scroll nobody can type into.
 */
export function LabourBillSheet({ groups, canEdit, onSave, onRemove }: LabourBillSheetProps) {
  const t = useT()

  const columns = SINGLE_HEADING_KEYS.length + 3 + (canEdit ? 1 : 0)

  return (
    <div className="relative hidden max-h-[calc(100dvh-11rem)] min-h-[16rem] overflow-auto overscroll-x-contain md:block">
      <table className="w-max min-w-full border-separate border-spacing-0 text-[12.5px]">
        <thead>
          <tr>
            {SINGLE_HEADING_KEYS.map((heading) => (
              <th key={heading} scope="col" rowSpan={2} className={cn(HEAD, 'sticky top-0')}>
                {t(heading)}
              </th>
            ))}
            <th scope="colgroup" colSpan={2} className={cn(HEAD, 'sticky top-0')}>
              {t('labourBill.columns.floor')}
            </th>
            <th scope="col" rowSpan={2} className={cn(HEAD, 'sticky top-0')}>
              {t('labourBill.columns.total')}
            </th>
            {canEdit && (
              <th scope="col" rowSpan={2} className={cn(HEAD, 'sticky top-0 w-10')}>
                <span className="sr-only">{t('labourBill.details.removeRow')}</span>
              </th>
            )}
          </tr>
          <tr>
            <th scope="col" className={cn(HEAD, 'sticky top-[2.0625rem]')}>
              {t('labourBill.columns.floorNo')}
            </th>
            <th scope="col" className={cn(HEAD, 'sticky top-[2.0625rem]')}>
              {t('labourBill.columns.floorAmount')}
            </th>
          </tr>
        </thead>

        {groups.map((group) => (
          <SectionBody
            key={group.key || 'pending'}
            group={group}
            columns={columns}
            canEdit={canEdit}
            onSave={onSave}
            onRemove={onRemove}
          />
        ))}
      </table>
    </div>
  )
}

interface SectionBodyProps {
  group: LabourCsdGroupRecord
  columns: number
  canEdit: boolean
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

/**
 * One CSD's section: a banner, its rows, and its own foot.
 *
 * A `<tbody>` per section rather than rows with a marker on them, so a browser
 * keeps a section together when it can and the banner is a real row of the
 * table rather than something floating over it.
 */
function SectionBody({ group, columns, canEdit, onSave, onRemove }: SectionBodyProps) {
  const t = useT()

  const groups = groupLineIds(group.lines)
  const Icon = group.isPending ? CircleDashed : Warehouse

  return (
    <tbody>
      <tr>
        <th
          scope="colgroup"
          colSpan={columns}
          className={cn(
            'sticky top-[4.125rem] z-9 border-y px-3 py-2 text-left',
            group.isPending
              ? 'bg-[color-mix(in_oklch,var(--card),var(--tone-amber)_12%)]'
              : 'bg-[color-mix(in_oklch,var(--card),var(--primary)_7%)]',
          )}
        >
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 text-[13px] font-semibold',
                group.isPending && 'text-tone-amber',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {group.label}
            </span>
            <span className="text-[11.5px] font-normal text-muted-foreground">
              {t('labourBill.stats.sectionSummary', {
                rows: t('labourBill.stats.rowCount', {
                  count: group.totals.rows,
                  n: formatNumber(group.totals.rows),
                }),
                challans: t('labourBill.stats.challanCount', {
                  count: group.totals.challans,
                  n: formatNumber(group.totals.challans),
                }),
                pcs: t('labourBill.stats.pcsCount', {
                  count: group.totals.qty,
                  n: formatNumber(group.totals.qty),
                }),
              })}
            </span>
            <span className="ml-auto text-[13px] font-semibold tabular-nums">
              {formatTaka(group.totals.totalAmount)}
            </span>
          </span>
          {group.isPending && (
            <span className="mt-0.5 block text-[11.5px] font-normal text-pretty text-muted-foreground">
              {t('labourBill.details.pendingHint')}
            </span>
          )}
        </th>
      </tr>

      {group.lines.map((line) => (
        <LabourBillSheetRow
          key={line.id}
          line={line}
          groupLineIds={groups.get(line.id) ?? [line.id]}
          banded={line.sl % 2 === 0}
          canEdit={canEdit}
          onSave={onSave}
          onRemove={onRemove}
        />
      ))}

      <tr>
        <td colSpan={8} className={cn(FOOT, 'pr-4 text-right tracking-wide uppercase')}>
          {t('labourBill.columns.sectionTotal', { section: group.label })}
        </td>
        <td className={cn(FOOT, 'text-[13px]')}>{formatNumber(group.totals.qty)}</td>
        <td className={cn(FOOT, 'text-right text-[13px] whitespace-nowrap')}>
          {formatAmount(group.totals.labourTotal)}
        </td>
        {/* Floors are not a quantity, so the column of them is not added up. */}
        <td className={FOOT} />
        <td className={cn(FOOT, 'text-right text-[13px] whitespace-nowrap')}>
          {formatAmount(group.totals.floorTotal)}
        </td>
        <td className={cn(FOOT, 'text-right text-[13.5px] whitespace-nowrap')}>
          {formatAmount(group.totals.totalAmount)}
        </td>
        {canEdit && <td className={FOOT} />}
      </tr>
    </tbody>
  )
}
