import type { LucideIcon } from 'lucide-react'
import { FileCheck2, Truck, Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ComplianceSummary, DriverSummary, VehicleSummary } from '../types'

interface Breakdown {
  label: string
  value: number
  /** Drawn in a tone only where the number means somebody has to do something. */
  tone?: 'warning' | 'critical'
}

interface KpiCardProps {
  title: string
  icon: LucideIcon
  chip: string
  total: number
  totalLabel: string
  breakdown: Breakdown[]
  isLoading: boolean
}

/**
 * One KPI card: a headline number and what it is made of.
 *
 * The breakdown is the point. "12 vehicles" is a fact; "12 vehicles, 9 active, 2
 * in maintenance, 1 inactive" is a situation — and the second is what somebody
 * opens a vendor to find out. Putting it under the headline rather than in three
 * more cards is what keeps the row to three cards on a laptop instead of nine.
 *
 * Colour appears only on a number that means work: maintenance and expired are
 * toned, "active" and "valid" are not. A card where everything is coloured is a
 * card where nothing stands out.
 */
function KpiCard({
  title,
  icon: Icon,
  chip,
  total,
  totalLabel,
  breakdown,
  isLoading,
}: KpiCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground">{title}</p>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-lg ring-1',
            chip,
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
      </div>

      {isLoading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-2 flex items-baseline gap-1.5">
          <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {total}
          </span>
          <span className="text-[11px] text-muted-foreground">{totalLabel}</span>
        </p>
      )}

      <dl className="mt-3 space-y-1 border-t pt-2.5">
        {breakdown.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2">
            <dt className="text-[11.5px] text-muted-foreground">{item.label}</dt>
            <dd
              className={cn(
                'text-[13px] font-medium tabular-nums',
                item.value === 0 && 'text-muted-foreground/60',
                item.value > 0 && item.tone === 'warning' && 'text-tone-amber',
                item.value > 0 && item.tone === 'critical' && 'text-tone-rose',
              )}
            >
              {isLoading ? <Skeleton className="h-3.5 w-6" /> : item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

interface VendorKpiCardsProps {
  vehicles: VehicleSummary | undefined
  drivers: DriverSummary | undefined
  documents: ComplianceSummary | undefined
  isLoading: boolean
}

/**
 * The three questions a vendor page opens with: how big is the fleet, how many
 * people are available to drive it, and is anything about to stop it working.
 *
 * Real counts from the summary endpoint, never a placeholder — an overview that
 * invents figures is worse than one that admits it has none.
 */
export function VendorKpiCards({
  vehicles,
  drivers,
  documents,
  isLoading,
}: VendorKpiCardsProps) {
  const t = useT()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <KpiCard
        title={t('vendor.kpi.vehicles')}
        icon={Truck}
        chip="bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20"
        total={vehicles?.total ?? 0}
        totalLabel={t('vendor.kpi.inFleet')}
        isLoading={isLoading}
        breakdown={[
          { label: t('vendor.kpi.active'), value: vehicles?.active ?? 0 },
          {
            label: t('vendor.kpi.underMaintenance'),
            value: vehicles?.maintenance ?? 0,
            tone: 'warning',
          },
          {
            label: t('vendor.kpi.expiredPapers'),
            value: vehicles?.expired ?? 0,
            tone: 'critical',
          },
          {
            label: t('vendor.kpi.inactiveOrSuspended'),
            value: (vehicles?.inactive ?? 0) + (vehicles?.suspended ?? 0),
          },
        ]}
      />

      <KpiCard
        title={t('vendor.kpi.drivers')}
        icon={Users}
        chip="bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20"
        total={drivers?.total ?? 0}
        totalLabel={t('vendor.kpi.onBooks')}
        isLoading={isLoading}
        breakdown={[
          { label: t('vendor.kpi.active'), value: drivers?.active ?? 0 },
          { label: t('vendor.kpi.onLeave'), value: drivers?.onLeave ?? 0, tone: 'warning' },
          { label: t('vendor.kpi.suspended'), value: drivers?.suspended ?? 0, tone: 'critical' },
          { label: t('vendor.kpi.inactive'), value: drivers?.inactive ?? 0 },
        ]}
      />

      <KpiCard
        title={t('vendor.kpi.compliance')}
        icon={FileCheck2}
        chip="bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20"
        total={documents?.total ?? 0}
        totalLabel={t('vendor.kpi.documentsOnFile')}
        isLoading={isLoading}
        breakdown={[
          { label: t('vendor.kpi.valid'), value: documents?.valid ?? 0 },
          {
            label: t('vendor.kpi.expiringSoon'),
            value: documents?.expiringSoon ?? 0,
            tone: 'warning',
          },
          { label: t('vendor.kpi.expired'), value: documents?.expired ?? 0, tone: 'critical' },
        ]}
      />
    </div>
  )
}
