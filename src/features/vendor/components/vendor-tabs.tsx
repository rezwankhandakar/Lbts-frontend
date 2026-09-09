import { Activity, FileText, LayoutGrid, Route, Truck, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VENDOR_TABS } from '../types'
import type { VendorTab } from '../types'

interface TabDef {
  value: VendorTab
  label: string
  icon: LucideIcon
}

const TABS: Record<VendorTab, TabDef> = {
  overview: { value: 'overview', label: 'Overview', icon: LayoutGrid },
  vehicles: { value: 'vehicles', label: 'Vehicles', icon: Truck },
  drivers: { value: 'drivers', label: 'Drivers', icon: Users },
  assignments: { value: 'assignments', label: 'Assignments', icon: Route },
  documents: { value: 'documents', label: 'Documents', icon: FileText },
  activity: { value: 'activity', label: 'Activity', icon: Activity },
}

interface VendorTabsProps {
  value: VendorTab
  onChange: (tab: VendorTab) => void
  /** Counts drawn beside a label, where the tab has something to report. */
  counts?: Partial<Record<VendorTab, number>>
  /** Tabs carrying something that needs attention, drawn with a dot. */
  alerting?: Partial<Record<VendorTab, boolean>>
}

/**
 * The six tabs on a vendor.
 *
 * A real `tablist`, so the arrow keys move between tabs and a screen reader
 * announces which panel is showing — the same treatment the Challan and Gate
 * Pass workspaces give their two-pane switch.
 *
 * It **scrolls horizontally on a narrow screen** rather than wrapping onto two
 * rows or collapsing into a select. Six labels do not fit on a 360px phone, and
 * of the three ways out, scrolling is the only one that keeps every destination
 * visible and one tap away: wrapping doubles the height of the chrome above the
 * content, and a select hides five of the six behind an interaction. The
 * scrollbar itself is hidden and the row is edge-to-edge, so it reads as a strip
 * that moves rather than as a broken layout.
 *
 * A count beside a label is drawn only when the tab has one to report, and a dot
 * only where something wants attention — a row of zeroes is a row nobody reads.
 */
export function VendorTabs({ value, onChange, counts, alerting }: VendorTabsProps) {
  const order = [...VENDOR_TABS]

  return (
    <div
      role="tablist"
      aria-label="Vendor sections"
      className="-mx-4 mb-5 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return
        }
        event.preventDefault()

        const index = order.indexOf(value)
        const next =
          event.key === 'ArrowRight'
            ? order[(index + 1) % order.length]
            : order[(index - 1 + order.length) % order.length]

        onChange(next)
      }}
    >
      {order.map((key) => {
        const tab = TABS[key]
        const Icon = tab.icon
        const isActive = tab.value === value
        const count = counts?.[key]

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`vendor-panel-${tab.value}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {tab.label}

            {typeof count === 'number' && count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-[10px] font-semibold tabular-nums',
                  isActive ? 'bg-primary/15' : 'bg-muted-foreground/15',
                )}
              >
                {count}
              </span>
            )}

            {alerting?.[key] && (
              <span
                className="size-1.5 shrink-0 rounded-full bg-tone-rose"
                aria-label="Needs attention"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
