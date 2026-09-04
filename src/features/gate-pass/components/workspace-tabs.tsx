import { FileText, ScanLine } from 'lucide-react'
import { cn } from '@/lib/utils'

export type WorkspacePane = 'form' | 'document'

interface WorkspaceTabsProps {
  value: WorkspacePane
  onChange: (pane: WorkspacePane) => void
  /** Shows a dot on the document tab once something is attached. */
  hasDocument: boolean
}

const TABS: { value: WorkspacePane; label: string; icon: typeof FileText }[] = [
  { value: 'form', label: 'Details', icon: FileText },
  { value: 'document', label: 'Scan', icon: ScanLine },
]

/**
 * Splits the workspace into two panes on a narrow screen.
 *
 * The desktop layout puts the form and the scan side by side, which is the
 * whole point of it — you read one and type the other. On a phone there is no
 * side by side, and stacking them would put the scanner half a screen below
 * the fields that depend on it. Tabs keep both one tap away.
 *
 * A real tablist, so the arrow keys work and a screen reader announces which
 * pane is showing.
 */
export function WorkspaceTabs({ value, onChange, hasDocument }: WorkspaceTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Gate pass workspace"
      className="grid grid-cols-2 gap-1 rounded-lg border bg-card p-1 lg:hidden"
      onKeyDown={(event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return
        }
        event.preventDefault()
        onChange(value === 'form' ? 'document' : 'form')
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
            {tab.value === 'document' && hasDocument && (
              <span className="size-1.5 rounded-full bg-tone-emerald" aria-hidden />
            )}
          </button>
        )
      })}
    </div>
  )
}
