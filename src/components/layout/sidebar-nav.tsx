import { Link, useLocation } from 'react-router-dom'
import { isNavItemActive, visibleNavSections } from '@/app/nav-config'
import type { NavItem } from '@/app/nav-config'
import { NAV_ACCENTS } from '@/components/layout/nav-accents'
import { useCurrentRole } from '@/hooks/use-current-role'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SidebarNavProps {
  collapsed?: boolean
  onNavigate?: () => void
}

export function SidebarNav({ collapsed = false, onNavigate }: SidebarNavProps) {
  const { pathname } = useLocation()
  const role = useCurrentRole()

  // Restricted destinations are filtered out rather than disabled: a Manager
  // has no business knowing Administration exists. The route guard and the API
  // are what actually enforce it — this is presentation.
  const sections = visibleNavSections(role)

  return (
    <nav aria-label="Main" className="flex flex-col gap-6 px-3 py-4">
      {sections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          {collapsed ? (
            <div className="mx-auto mb-1 h-px w-7 bg-sidebar-border first:hidden" aria-hidden />
          ) : (
            <p className="mb-1.5 px-2.5 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground/65 uppercase">
              {section.label}
            </p>
          )}

          {section.items.map((item) => (
            <SidebarNavLink
              key={item.path}
              item={item}
              active={isNavItemActive(item, pathname)}
              collapsed={collapsed}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      ))}
    </nav>
  )
}

interface SidebarNavLinkProps {
  item: NavItem
  active: boolean
  collapsed: boolean
  onNavigate?: () => void
}

function SidebarNavLink({ item, active, collapsed, onNavigate }: SidebarNavLinkProps) {
  const Icon = item.icon
  const accent = NAV_ACCENTS[item.accent]

  const linkProps = {
    to: item.path,
    'aria-current': active ? ('page' as const) : undefined,
    'aria-disabled': item.disabled,
    tabIndex: item.disabled ? -1 : undefined,
    onClick: onNavigate,
    className: cn(
      'group relative flex h-9.5 items-center gap-3 rounded-lg text-[13.5px] whitespace-nowrap',
      'transition-all duration-200 outline-none',
      'focus-visible:ring-ring focus-visible:ring-offset-sidebar focus-visible:ring-2 focus-visible:ring-offset-1',
      active
        ? cn('bg-gradient-to-r font-semibold', accent.activeSurface, accent.label)
        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground font-medium',
      item.disabled && 'pointer-events-none opacity-45',
      collapsed ? 'justify-center px-0' : 'px-2.5',
    ),
  }

  const content = (
    <>
      {/* Slim rail marker; suppressed when collapsed, where the tint alone reads. */}
      {active && !collapsed && (
        <span
          className={cn(
            'absolute top-1/2 -left-3 h-5 w-1 -translate-y-1/2 rounded-r-full',
            accent.rail,
          )}
          aria-hidden
        />
      )}
      <Icon
        className={cn(
          'size-[17px] shrink-0 transition-colors duration-200',
          active ? accent.iconActive : accent.icon,
        )}
        aria-hidden
      />
      <span className={collapsed ? 'sr-only' : 'truncate'}>{item.label}</span>
    </>
  )

  if (!collapsed) {
    return <Link {...linkProps}>{content}</Link>
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<Link {...linkProps} />}>{content}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}
