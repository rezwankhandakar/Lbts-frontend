import { FileText, PencilLine } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WorkspacePane = 'pdf' | 'form'

interface WorkspaceTabsProps {
  value: WorkspacePane
  onChange: (pane: WorkspacePane) => void
  /** Shows a dot on the form tab once something has been typed. */
  hasEntry: boolean
}

const TABS: { value: WorkspacePane; label: string; icon: typeof FileText }[] = [
  { value: 'pdf', label: 'PDF', icon: FileText },
  { value: 'form', label: 'Entry', icon: PencilLine },
]

/**
 * Splits the workspace into two panes on a narrow screen.
 *
 * The desktop layout puts the PDF and the form side by side, which is the
 * whole point of it — you read one and type the other. On a phone there is no
 * side by side, and stacking them would put the page range control half a
 * screen away from the pages it selects. Tabs keep both one tap away.
 *
 * A real tablist, so the arrow keys work and a screen reader announces which
 * pane is showing. The same component the Gate Pass workspace uses, for the
 * same reason.
 */
export function WorkspaceTabs({ value, onChange, hasEntry }: WorkspaceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Challan workspace"
      className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1 lg:hidden"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return
        }
        event.preventDefault()
        onChange(value === 'pdf' ? 'form' : 'pdf')
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.value === value

        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex items-center justify-center gap-2 rounded-md px-3 py-2 text-[13px] font-medium transition-colors outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <tab.icon className="size-4" aria-hidden />
            {tab.label}
            {tab.value === 'form' && hasEntry && (
              <span className="size-1.5 rounded-full bg-tone-emerald" aria-hidden />
            )}
          </button>
        )
      })}
    </div>
  )
}
