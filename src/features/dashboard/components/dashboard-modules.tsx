import { ArrowRight, Building2, PackageCheck, ReceiptText, ScanLine } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { navSections, canSeeNavItem } from '@/app/nav-config'
import type { NavItem } from '@/app/nav-config'
import { formatTaka } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { DashboardData } from '../types'

/**
 * Where the modules are, with what each of them holds.
 *
 * A module gets a **card** when there is a real aggregation behind it, and a
 * plain **link** when there is not. That split is the whole design of this
 * section and it is not a compromise: CLAUDE.md's rule is that nothing on the
 * dashboard is ever a placeholder figure, and Trip DO, the Excel Bill, the
 * Labour Bill and the System pages have no stats endpoint. A link is an honest
 * thing to offer for those — it promises a destination and claims no number.
 * When one of them grows a `/stats`, it graduates to a card here and nothing
 * else has to change.
 *
 * Every card is scoped by the viewer's own `canRead*`, so a role never meets a
 * summary of something it would be refused. Presentation only — `RoleRoute`
 * guards the URL and the API refuses the request either way.
 */
export function DashboardModules({ dashboard }: { dashboard: DashboardData }) {
  const cards = moduleCards(dashboard)
  const links = jumpLinks(dashboard, cards)

  if (cards.length === 0 && links.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="modules-heading" className="space-y-2.5">
      <header>
        <h2 id="modules-heading" className="text-[13px] font-semibold tracking-tight">
          Your modules
        </h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          What each one holds, and a way into it.
        </p>
      </header>

      {cards.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <ModuleCard key={card.to} card={card} />
          ))}
        </div>
      )}

      {links.length > 0 && (
        <nav aria-label="Other modules" className="flex flex-wrap gap-2 pt-0.5">
          {links.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="group inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-xs font-medium shadow-sm transition-colors outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <item.icon className={cn('size-3.5 shrink-0', ACCENT_TEXT[item.accent])} aria-hidden />
              {item.label}
              <ArrowRight
                className="size-3 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          ))}
        </nav>
      )}
    </section>
  )
}

/**
 * Accent classes as **full literal strings**, per the rule in CLAUDE.md:
 * Tailwind scans source text, so a composed `text-brand-${accent}` generates
 * nothing and the colour silently disappears. `nav-accents.ts` spells out the
 * sidebar's set; this is the one class this section needs.
 */
const ACCENT_TEXT: Record<NavItem['accent'], string> = {
  indigo: 'text-brand-indigo',
  cyan: 'text-brand-cyan',
  violet: 'text-brand-violet',
  emerald: 'text-brand-emerald',
  amber: 'text-brand-amber',
}

interface Figure {
  label: string
  value: string
  className?: string
}

interface ModuleCardData {
  icon: LucideIcon
  title: string
  description: string
  /** Icon chip: tinted surface, ring and text, as a full literal string. */
  chip: string
  to: string
  headline: string | undefined
  headlineLabel: string
  figures: Figure[]
  /** True while the module's own query has not answered yet. */
  pending: boolean
  failed: boolean
}

function moduleCards(dashboard: DashboardData): ModuleCardData[] {
  const cards: ModuleCardData[] = []
  const n = (value: number): string => value.toLocaleString()

  if (dashboard.can.gatePass) {
    const s = dashboard.gatePass.data
    cards.push({
      icon: ScanLine,
      title: 'Gate Pass',
      description: 'Trips recorded against a scanned hard copy.',
      chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
      to: '/gate-pass',
      headlineLabel: 'On record',
      headline: s && n(s.total),
      figures: s
        ? [
            { label: 'Verified', value: n(s.verified), className: 'text-tone-emerald' },
            { label: 'Awaiting check', value: n(s.submitted), className: 'text-tone-amber' },
            { label: 'Drafts', value: n(s.draft) },
          ]
        : [],
      pending: dashboard.gatePass.isPending,
      failed: dashboard.gatePass.isError,
    })
  }

  if (dashboard.can.challan) {
    const s = dashboard.challan.data
    cards.push({
      icon: ReceiptText,
      title: 'Challan',
      description: "Deliveries filed out of the office's PDFs.",
      chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
      to: '/challan',
      headlineLabel: 'On record',
      headline: s && n(s.total),
      figures: s
        ? [
            { label: 'Pieces', value: n(s.totalQty) },
            /*
             * The charge total sits beside the count of challans nothing could
             * price, never on its own: a figure that quietly leaves records
             * out is worse than no figure, which is the rule the records list
             * follows for the same pair.
             */
            { label: 'Charged', value: formatTaka(s.totalAmount) },
            {
              label: 'Source PDFs open',
              value: n(s.batchesProcessing),
              className: s.batchesProcessing > 0 ? 'text-tone-amber' : undefined,
            },
          ]
        : [],
      pending: dashboard.challan.isPending,
      failed: dashboard.challan.isError,
    })
  }

  if (dashboard.can.delivery) {
    const s = dashboard.delivery.data
    cards.push({
      icon: PackageCheck,
      title: 'Delivery',
      description: 'Trips, and the challans that went out on them.',
      chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
      to: '/delivery',
      headlineLabel: 'Trips run',
      headline: s && n(s.total),
      figures: s
        ? [
            { label: 'Signed for', value: n(s.completed), className: 'text-tone-emerald' },
            {
              label: 'Awaiting copies',
              value: n(s.open),
              className: s.open > 0 ? 'text-tone-amber' : undefined,
            },
            { label: 'Pieces today', value: n(s.todayQty) },
          ]
        : [],
      pending: dashboard.delivery.isPending,
      failed: dashboard.delivery.isError,
    })
  }

  if (dashboard.can.vendor) {
    /**
     * The staff-side vendor card CLAUDE.md's Known gaps names as missing:
     * "`GET /vendors/stats` is scoped to the viewer and already returns
     * everything such a card would show, so it is a component rather than an
     * endpoint's worth of work." This is that component.
     */
    const s = dashboard.vendor.data
    const lapsing = s ? s.expiredDocuments + s.expiringDocuments : 0
    cards.push({
      icon: Building2,
      title: 'Vendors',
      description: 'The fleet behind the trips, and its papers.',
      chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
      to: '/vendors',
      headlineLabel: 'Active vendors',
      headline: s && n(s.active),
      figures: s
        ? [
            { label: 'Vehicles', value: n(s.vehicles) },
            { label: 'Drivers', value: n(s.drivers) },
            /*
             * "In date" rather than "0", for the reason the vendor dashboard's
             * fleet strip gives: a zero here reads as a count of documents
             * rather than a count of problems, which is precisely the wrong
             * thing to tell somebody whose papers are all filed and all valid.
             */
            lapsing > 0
              ? { label: 'Papers lapsing', value: n(lapsing), className: 'text-tone-amber' }
              : { label: 'Papers', value: 'In date', className: 'text-tone-emerald' },
          ]
        : [],
      pending: dashboard.vendor.isPending,
      failed: dashboard.vendor.isError,
    })
  }

  return cards
}

/**
 * The modules with no figures to show, read straight off the sidebar's own
 * config so this strip can never offer a destination the sidebar does not, or
 * miss one it does. Anything already drawn as a card is dropped, and so is
 * the dashboard itself.
 */
function jumpLinks(dashboard: DashboardData, cards: ModuleCardData[]): NavItem[] {
  const carded = new Set(cards.map((card) => card.to))

  return navSections
    .flatMap((section) => section.items)
    .filter(
      (item) =>
        item.path !== '/' &&
        !item.disabled &&
        !carded.has(item.path) &&
        canSeeNavItem(item, dashboard.role),
    )
}

function ModuleCard({ card }: { card: ModuleCardData }) {
  return (
    <Link
      to={card.to}
      className="group flex min-w-0 flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg ring-1', card.chip)}
          aria-hidden
        >
          <card.icon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13px] font-semibold tracking-tight">{card.title}</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
            {card.description}
          </p>
        </div>
        <ArrowRight
          className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </div>

      <div className="mt-4">
        <p className="text-[11px] text-muted-foreground">{card.headlineLabel}</p>
        {card.headline === undefined ? (
          <Skeleton className="mt-1 h-7 w-16" />
        ) : (
          <p className="mt-0.5 text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {card.headline}
          </p>
        )}
      </div>

      {card.failed ? (
        <p className="mt-4 border-t pt-3 text-[11px] text-muted-foreground">
          These figures could not be loaded.
        </p>
      ) : (
        <dl className="mt-4 grid gap-1.5 border-t pt-3">
          {(card.figures.length > 0
            ? card.figures
            : [{ label: '', value: '' }, { label: '', value: '' }, { label: '', value: '' }]
          ).map((figure, index) => (
            <div
              key={figure.label || index}
              className="flex items-baseline justify-between gap-2 text-[11px]"
            >
              {card.pending || card.figures.length === 0 ? (
                <>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-8" />
                </>
              ) : (
                <>
                  <dt className="truncate text-muted-foreground">{figure.label}</dt>
                  <dd
                    className={cn(
                      'shrink-0 font-medium tabular-nums',
                      figure.className ?? 'text-foreground',
                    )}
                  >
                    {figure.value}
                  </dd>
                </>
              )}
            </div>
          ))}
        </dl>
      )}
    </Link>
  )
}
