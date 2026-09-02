import { Bell, PanelLeft } from 'lucide-react'
import { usePageMeta } from '@/hooks/use-page-meta'
import { useSidebarStore } from '@/stores/use-sidebar-store'
import { HEADER_ICON_BUTTON } from '@/components/layout/header-styles'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { UserMenu } from '@/components/layout/user-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const UNREAD_NOTIFICATIONS = 3

interface AppHeaderProps {
  mobileOpen: boolean
  onOpenMobileSidebar: () => void
}

export function AppHeader({ mobileOpen, onOpenMobileSidebar }: AppHeaderProps) {
  const { title, section } = usePageMeta()
  const collapsed = useSidebarStore((state) => state.collapsed)
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed)

  return (
    <header className="relative sticky top-0 z-30 flex h-14 shrink-0 items-center gap-1.5 border-b bg-background/85 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 md:px-4">
      {/* Faint brand wash so the bar reads as part of the shell, not a strip. */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent"
        aria-hidden
      />

      <Button
        variant="ghost"
        size="icon"
        className={cn(HEADER_ICON_BUTTON, 'relative md:hidden')}
        onClick={onOpenMobileSidebar}
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        aria-controls="app-sidebar-drawer"
      >
        <PanelLeft aria-hidden />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(HEADER_ICON_BUTTON, 'relative hidden md:inline-flex')}
        onClick={toggleCollapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        aria-controls="app-sidebar"
      >
        <PanelLeft aria-hidden />
      </Button>

      <div className="relative ml-1.5 min-w-0">
        {section && (
          <p className="hidden text-[10px] leading-none font-semibold tracking-[0.12em] text-primary/70 uppercase sm:block">
            {section}
          </p>
        )}
        <h1 className="mt-1 truncate text-[15px] leading-none font-semibold tracking-tight">
          {title}
        </h1>
      </div>

      <div className="relative ml-auto flex items-center gap-0.5">
        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          className={cn(HEADER_ICON_BUTTON, 'relative')}
          aria-label={`Notifications, ${UNREAD_NOTIFICATIONS} unread`}
        >
          <Bell aria-hidden />
          <span
            className="absolute top-1.5 right-1.5 size-2 rounded-full bg-brand-amber ring-2 ring-background"
            aria-hidden
          />
        </Button>

        <div className="mx-1.5 hidden h-5 w-px bg-border sm:block" aria-hidden />

        <UserMenu />
      </div>
    </header>
  )
}
