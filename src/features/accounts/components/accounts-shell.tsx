import {
  Banknote,
  BookOpenText,
  ChartNoAxesCombined,
  FileBadge,
  HandCoins,
  HardHat,
  LayoutGrid,
  Receipt,
  Truck,
  Wallet,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EntryDialogProvider } from './entry-dialog-provider'

interface AccountsTab {
  labelKey: TranslationKey
  to: string
  icon: LucideIcon
  end?: boolean
}

const TABS: AccountsTab[] = [
  { labelKey: 'accounts.nav.overview', to: '/accounts', icon: LayoutGrid, end: true },
  { labelKey: 'accounts.nav.cash', to: '/accounts/cash', icon: Banknote },
  { labelKey: 'accounts.nav.cashBook', to: '/accounts/cash-book', icon: BookOpenText },
  { labelKey: 'accounts.nav.vendorBills', to: '/accounts/vendor-bills', icon: Truck },
  { labelKey: 'accounts.nav.advances', to: '/accounts/advances', icon: HandCoins },
  { labelKey: 'accounts.nav.expenses', to: '/accounts/expenses', icon: Receipt },
  { labelKey: 'accounts.nav.finalBills', to: '/accounts/final-bills', icon: FileBadge },
  { labelKey: 'accounts.nav.labourBills', to: '/accounts/labour-bills', icon: HardHat },
  { labelKey: 'accounts.nav.profitLoss', to: '/accounts/profit-loss', icon: ChartNoAxesCombined },
  { labelKey: 'accounts.nav.wallets', to: '/accounts/wallets', icon: Wallet },
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
  const t = useT()

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
          aria-label={t('accounts.sectionsAria')}
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
                  {t(tab.labelKey)}
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
