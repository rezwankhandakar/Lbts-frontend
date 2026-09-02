import { BrandLockup } from '@/components/shared/brand'
import { SidebarAccount } from '@/components/layout/sidebar-account'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function AppSidebar({ collapsed = false, onNavigate }: AppSidebarProps) {
  return (
    <div className="relative flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Brand light falling from the top; keeps the surface from reading flat
          without resorting to a heavy gradient. */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-primary/[0.06] via-transparent to-transparent"
        aria-hidden
      />

      {/* h-14 matches the header, so the two bottom borders form one line. */}
      <div
        className={cn(
          'relative flex h-14 shrink-0 items-center border-b border-sidebar-border px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <BrandLockup compact={collapsed} />
      </div>

      {/* Navigation scrolls; the account block below never leaves the bottom. */}
      <ScrollArea className="relative min-h-0 flex-1">
        <SidebarNav collapsed={collapsed} onNavigate={onNavigate} />
      </ScrollArea>

      <div className="relative shrink-0 border-t border-sidebar-border">
        <SidebarAccount collapsed={collapsed} />
      </div>
    </div>
  )
}
