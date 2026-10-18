import type { ReactNode } from 'react'
import { Plus, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface DeliveryListHeroProps {
  canWrite: boolean
  /** The three counts — trips today, awaiting copy, completed. */
  stats: ReactNode
  /** Where paper coming back off a lorry is read in; writers only. */
  scan?: ReactNode
}

/**
 * The head of the deliveries page, on the brand gradient the trip page opens
 * with: the page's name, the one thing somebody starts from — a new delivery
 * — and, beneath, the counts and the scanner.
 *
 * It replaced three boxes stacked down the page — a title, a scanner bar and a
 * row of stat cards — which between them pushed the list itself below the
 * fold before anybody had searched for anything. On one band the counts and
 * the scanner sit side by side, because they answer the same question: what is
 * waiting to come back, and here is where it comes back in.
 *
 * **Kept thin on purpose**: the list is what this page is for, so the band is
 * two short rows. It carried a sentence describing the page under the title;
 * somebody on their hundredth trip does not need it, and it cost the list two
 * lines of the screen.
 *
 * Its palette is `primary-foreground`, the dashboard hero's rule; what sits on
 * it is drawn for this surface rather than borrowed from a light card.
 */
export function DeliveryListHero({ canWrite, stats, scan }: DeliveryListHeroProps) {
  const t = useT()

  return (
    <section className="relative isolate mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-from to-brand-to px-4 py-3 text-primary-foreground shadow-md ring-1 ring-primary-foreground/10 sm:px-5">
      <div
        className="pointer-events-none absolute -top-24 -right-12 size-56 rounded-full bg-primary-foreground/15 blur-3xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-primary-foreground/25" aria-hidden />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/15 ring-1 ring-primary-foreground/25">
            <Truck className="size-4" aria-hidden />
          </span>
          <h1 className="truncate text-lg leading-none font-bold tracking-tight sm:text-xl">{t('delivery.title')}</h1>
        </div>

        {canWrite && (
          <Link
            to="/delivery/new"
            className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary-foreground px-3 text-[13px] font-semibold text-primary shadow-sm ring-1 ring-primary-foreground/30 transition outline-none hover:bg-primary-foreground/90 focus-visible:ring-3 focus-visible:ring-primary-foreground/60"
          >
            <Plus className="size-4" aria-hidden />
            {t('delivery.newDelivery')}
          </Link>
        )}
      </div>

      <div
        className={cn(
          'relative mt-2.5 grid gap-2',
          scan && 'xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]',
        )}
      >
        {stats}
        {scan}
      </div>
    </section>
  )
}
