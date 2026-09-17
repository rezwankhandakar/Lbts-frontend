import {
  Banknote,
  BookOpenText,
  ChartNoAxesCombined,
  FileBadge,
  HandCoins,
  LayoutGrid,
  Receipt,
  Truck,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { EntryDialogProvider } from './entry-dialog-provider'

interface AccountsTab {
  label: string
  to: string
  icon: LucideIcon
  end?: boolean
}

const TABS: AccountsTab[] = [
  { label: 'Overview', to: '/accounts', icon: LayoutGrid, end: true },
  { label: 'Cash', to: '/accounts/cash', icon: Banknote },
  { label: 'Cash Book', to: '/accounts/cash-book', icon: BookOpenText },
  { label: 'Vendor Bills', to: '/accounts/vendor-bills', icon: Truck },
  { label: 'Advances', to: '/accounts/advances', icon: HandCoins },
  { label: 'Expenses', to: '/accounts/expenses', icon: Receipt },
  { label: 'Walton Final Bill', to: '/accounts/final-bills', icon: FileBadge },
  { label: 'Profit & Loss', to: '/accounts/profit-loss', icon: ChartNoAxesCombined },
  { label: 'Wallets', to: '/accounts/wallets', icon: Wallet },
]

interface AccountsShellProps {
  title: string
  description: string
  /** Buttons beside the title. */
  actions?: ReactNode
  children: ReactNode
}

/**
 * Every Accounts page: its heading, the module's own tab bar, and the one
 * entry form they all share. The tab bar scrolls sideways on a phone rather
 * than wrapping into three rows of pills nobody can read.
 */
export function AccountsShell({ title, description, actions, children }: AccountsShellProps) {
  return (
    <EntryDialogProvider>
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">{description}</p>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>

        <nav
          aria-label="Accounts sections"
          className="-mx-4 mb-6 overflow-x-auto border-b px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
        >
          <ul className="flex min-w-max gap-1">
            {TABS.map((tab) => (
              <li key={tab.to}>
                <NavLink
                  to={tab.to}
                  end={tab.end}
                  className={({ isActive }) =>
                    cn(
                      'relative flex items-center gap-2 rounded-t-lg px-3 py-2.5 text-[13px] font-medium whitespace-nowrap transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                      isActive
                        ? 'text-primary after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary'
                        : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                    )
                  }
                >
                  <tab.icon className="size-4" aria-hidden />
                  {tab.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {children}
      </div>
    </EntryDialogProvider>
  )
}
