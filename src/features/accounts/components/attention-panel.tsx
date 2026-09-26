import { ChevronRight, CircleCheckBig, FileClock, FileWarning, HandCoins, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { taka } from '../lib/accounts-meta'
import type { AccountsOverview } from '../types'
import { Panel } from './account-atoms'

interface Item {
  icon: LucideIcon
  chip: string
  title: string
  detail: string
  to: string
}

/**
 * What still wants doing, each a way in. Nothing wrong means no rows at all
 * and a line saying so — the list is a to-do list, not a set of statuses.
 */
export function AttentionPanel({ overview }: { overview: AccountsOverview | undefined }) {
  const t = useT()

  if (!overview) {
    return <Skeleton className="h-72 rounded-xl" />
  }

  const items: Item[] = []
  if (overview.vendorDue.total > 0) {
    items.push({
      icon: Truck,
      chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
      title: `${taka(overview.vendorDue.total)} owed to vendors`,
      detail: `${overview.vendorDue.vendors} ${overview.vendorDue.vendors === 1 ? 'vendor' : 'vendors'} across every month`,
      to: '/accounts/vendor-bills?status=due',
    })
  }
  if (overview.vendorDue.blankBills > 0) {
    items.push({
      icon: FileWarning,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      title: `${overview.vendorDue.blankBills} ${overview.vendorDue.blankBills === 1 ? 'trip has' : 'trips have'} no bill entered`,
      detail: t('accounts.attention.blankBillDetail'),
      to: '/accounts/vendor-bills',
    })
  }
  if (overview.pendingFinalBills > 0) {
    items.push({
      icon: FileClock,
      chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
      title: `${overview.pendingFinalBills} Excel ${overview.pendingFinalBills === 1 ? 'bill is' : 'bills are'} awaiting a final bill`,
      detail: t('accounts.attention.pendingFinalDetail'),
      to: '/accounts/final-bills',
    })
  }
  if (overview.receivable.outstanding > 0) {
    items.push({
      icon: FileClock,
      chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
      title: `${taka(overview.receivable.outstanding)} to receive from Walton`,
      detail: `${overview.receivable.count} final ${overview.receivable.count === 1 ? 'bill' : 'bills'} not fully paid`,
      to: '/accounts/final-bills',
    })
  }
  if (overview.advances.outstanding > 0) {
    items.push({
      icon: HandCoins,
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      title: `${taka(overview.advances.outstanding)} in open advances`,
      detail: `${overview.advances.count} ${overview.advances.count === 1 ? 'advance' : 'advances'} not yet settled`,
      to: '/accounts/advances',
    })
  }

  return (
    <Panel
      title={t('accounts.attention.heading')}
      description={t('accounts.attention.description')}
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <CircleCheckBig className="size-6 text-tone-emerald" aria-hidden />
          <p className="text-sm font-medium">{t('accounts.attention.allCaughtUp')}</p>
          <p className="text-xs text-muted-foreground">
            {t('accounts.attention.nothingWaiting')}
          </p>
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((item) => (
            <li key={item.title}>
              <Link
                to={item.to}
                className="flex items-center gap-3 px-4 py-3 transition outline-none hover:bg-muted/40 focus-visible:bg-muted/40 sm:px-5"
              >
                <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg ring-1', item.chip)}>
                  <item.icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium">{item.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.detail}</span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
