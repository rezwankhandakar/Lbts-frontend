import { CircleDashed, Factory } from 'lucide-react'
import { formatNumber, formatTaka } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { LABOUR_TAB_PANEL_ID, labourTabElementId } from '../lib/labour-bill-meta'
import { groupTotalsOf } from '../types'
import type { LabourCsdGroupRecord, LabourTab } from '../types'

interface LabourUnitTabsProps {
  tabs: LabourTab<LabourCsdGroupRecord>[]
  value: string
  onChange: (id: string) => void
}

/**
 * One tab per unit — WFR, WAC — and one for the rows still waiting for a Trip
 * DO.
 *
 * A unit is billed on its own, so a WFR challan and a WAC challan scanned one
 * after the other belong on two different tabs rather than interleaved down one
 * sheet; each tab then holds that unit's CSD sections exactly as before. A scan
 * opens the tab its rows landed on, which is how an operator working through a
 * mixed stack sees where each challan went without looking for it.
 *
 * A real `tablist`, so the arrow keys move between tabs and a screen reader
 * announces which unit is showing — the treatment the vendor workspace gives its
 * own tabs. It scrolls sideways on a phone rather than wrapping, for the reason
 * that one gives: every unit stays one tap away and the chrome above the sheet
 * stays one row tall.
 */
export function LabourUnitTabs({ tabs, value, onChange }: LabourUnitTabsProps) {
  const t = useT()

  const ids = tabs.map((tab) => tab.id)

  return (
    <div
      role="tablist"
      aria-label={t('labourBill.tabs.aria')}
      className="flex gap-1 overflow-x-auto border-b bg-muted/10 px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return
        }
        event.preventDefault()

        const index = ids.indexOf(value)
        const next =
          event.key === 'ArrowRight'
            ? ids[(index + 1) % ids.length]
            : ids[(index - 1 + ids.length) % ids.length]

        if (next !== undefined) {
          onChange(next)
          document.getElementById(labourTabElementId({ id: next }))?.focus()
        }
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === value
        const totals = groupTotalsOf(tab.groups.flatMap((group) => group.lines))
        const Icon = tab.isPending ? CircleDashed : Factory
        const label = tab.isPending
          ? t('labourBill.tripDoPending')
          : tab.unit || t('labourBill.tabs.noUnit')

        return (
          <button
            key={tab.id || 'none'}
            id={labourTabElementId(tab)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={LABOUR_TAB_PANEL_ID}
            tabIndex={isActive ? 0 : -1}
            title={t('labourBill.tabs.title', {
              rows: t('labourBill.stats.rowCount', {
                count: totals.rows,
                n: formatNumber(totals.rows),
              }),
              challans: t('labourBill.stats.challanCount', {
                count: totals.challans,
                n: formatNumber(totals.challans),
              }),
              amount: formatTaka(totals.totalAmount),
            })}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex min-h-9 shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold whitespace-nowrap transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              tab.isPending
                ? isActive
                  ? 'bg-tone-amber/12 text-tone-amber ring-1 ring-tone-amber/25'
                  : 'text-tone-amber hover:bg-tone-amber/8'
                : isActive
                  ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {label}
            <span
              className={cn(
                'rounded-full px-1.5 py-px text-[11px] font-semibold tabular-nums',
                isActive ? 'bg-current/12' : 'bg-muted-foreground/15',
              )}
            >
              {formatNumber(totals.rows)}
            </span>
            <span className="hidden text-[12px] font-medium tabular-nums opacity-75 sm:inline">
              {formatTaka(totals.totalAmount)}
            </span>
          </button>
        )
      })}
    </div>
  )
}
