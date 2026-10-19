import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { LABOUR_TAB_PANEL_ID, labourTabElementId } from '../lib/labour-bill-meta'
import { labourTabsOf } from '../types'
import type { LabourBillLinePatch, LabourBillRecord, LabourCsdGroupRecord } from '../types'
import { EmptyLabourSheet } from './labour-bill-details-states'
import { LabourBillSheet } from './labour-bill-sheet'
import type { LabourRemoveTarget } from './labour-bill-sheet-row'
import { LabourSheetCards } from './labour-sheet-cards'
import { LabourUnitTabs } from './labour-unit-tabs'

interface LabourSheetPanelProps {
  bill: LabourBillRecord
  groups: LabourCsdGroupRecord[]
  canEdit: boolean
  /** The tab somebody chose, or a scan opened; null until either has happened. */
  tab: string | null
  onTabChange: (id: string) => void
  onSave: (lineId: string, patch: LabourBillLinePatch) => void
  onRemove: (target: LabourRemoveTarget) => void
}

/**
 * The sheet itself: its heading, a tab per unit, and the active unit's CSD
 * sections — a table from `md` up, cards below it.
 *
 * Only the active tab's sections are drawn, so a WFR row and a WAC row are never
 * on screen together. The tab falls back to the first one whenever the chosen
 * tab has nothing left on it — the last WAC challan taken off, or the last
 * pending row matched to its gate pass — rather than showing an empty sheet
 * under a tab that no longer exists.
 */
export function LabourSheetPanel({
  bill,
  groups,
  canEdit,
  tab,
  onTabChange,
  onSave,
  onRemove,
}: LabourSheetPanelProps) {
  const t = useT()

  const lineCount = groups.reduce((sum, group) => sum + group.lines.length, 0)
  const tabs = labourTabsOf(groups)
  const active = tabs.find((candidate) => candidate.id === tab) ?? tabs[0]

  return (
    <section
      aria-label={t('labourBill.sheetAria')}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">{t('labourBill.sheetHeading')}</h2>
          <p className="text-xs text-pretty text-muted-foreground">
            {canEdit ? t('labourBill.details.sheetHint') : t('labourBill.details.sheetHintReadOnly')}
          </p>
        </div>
        {lineCount > 0 && (
          <p className="text-xs text-muted-foreground tabular-nums">
            {t('labourBill.stats.sheetSummary', {
              rows: t('labourBill.stats.rowCount', { count: lineCount, n: formatNumber(lineCount) }),
              challans: t('labourBill.stats.challanCount', {
                count: bill.challanCount,
                n: formatNumber(bill.challanCount),
              }),
              sections: t('labourBill.stats.sectionCount', {
                count: groups.length,
                n: formatNumber(groups.length),
              }),
            })}
          </p>
        )}
      </div>

      {lineCount === 0 || !active ? (
        <EmptyLabourSheet canScan={canEdit} />
      ) : (
        <>
          <LabourUnitTabs tabs={tabs} value={active.id} onChange={onTabChange} />
          <div
            role="tabpanel"
            id={LABOUR_TAB_PANEL_ID}
            aria-labelledby={labourTabElementId(active)}
          >
            <LabourBillSheet
              groups={active.groups}
              canEdit={canEdit}
              onSave={onSave}
              onRemove={onRemove}
            />
            <LabourSheetCards
              groups={active.groups}
              canEdit={canEdit}
              onSave={onSave}
              onRemove={onRemove}
            />
          </div>
        </>
      )}
    </section>
  )
}
