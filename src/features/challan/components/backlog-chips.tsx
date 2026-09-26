import {
  CircleDollarSign,
  MapPinOff,
  PackageOpen,
  PackageX,
  ScanSearch,
  Undo2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { ChallanFilterPatch, ChallanListParams, PageMeta } from '../types'

interface BacklogChipsProps {
  meta: PageMeta | undefined
  params: ChallanListParams
  onChange: (patch: ChallanFilterPatch) => void
  className?: string
}

interface Chip {
  key: string
  label: string
  count: number
  icon: LucideIcon
  /** Full literal strings — Tailwind scans source text, so a template makes nothing. */
  iconTone: string
  activeTone: string
  isActive: boolean
  /** What to apply when pressed, and what pressing it again returns to. */
  patch: ChallanFilterPatch
  clearPatch: ChallanFilterPatch
  title: string
}

/**
 * What still wants somebody's attention, and how much of it there is.
 *
 * Seven backlogs, and they are genuinely different jobs. A challan nobody
 * charged is fixed on the rate card or by setting a location. A challan nobody
 * located is fixed in the location editor. A location the machine inferred and
 * nobody read is fixed by looking at it and agreeing — the cheapest and the
 * easiest to skip, which is exactly why a wrong district hides there. A challan
 * nobody has dispatched is fixed by putting it on a lorry.
 *
 * They are **buttons, not badges**. Pressing one filters the list to it,
 * pressing it again clears it, and the pressed state is what stops the counts
 * underneath being a mystery. At rest they are neutral pills with a coloured
 * icon, so a row of seven reads calmly; the pressed one takes its colour.
 *
 * A chip with nothing behind it is not drawn, and a row with no chips is not
 * drawn at all. This row is a to-do list, and a to-do list that keeps showing
 * finished work is one people stop reading.
 */
export function BacklogChips({ meta, params, onChange, className }: BacklogChipsProps) {
  const t = useT()

  if (!meta) {
    return null
  }

  const chips: Chip[] = [
    {
      key: 'amount',
      label: t('challan.backlog.blankAmount'),
      count: meta.blankAmount ?? 0,
      icon: CircleDollarSign,
      iconTone: 'text-tone-amber',
      activeTone: 'border-tone-amber/40 bg-tone-amber/10 text-tone-amber',
      isActive: params.amount === 'unpriced',
      patch: { amount: 'unpriced' },
      clearPatch: { amount: 'all' },
      title: t('challan.backlog.blankAmountHint'),
    },
    {
      key: 'partial',
      label: t('challan.backlog.partlyCharged'),
      count: meta.partialAmount ?? 0,
      icon: CircleDollarSign,
      iconTone: 'text-tone-orange',
      activeTone: 'border-tone-orange/40 bg-tone-orange/10 text-tone-orange',
      isActive: params.amount === 'partial',
      patch: { amount: 'partial' },
      clearPatch: { amount: 'all' },
      title: t('challan.backlog.partlyChargedHint'),
    },
    {
      key: 'location-pending',
      label: t('challan.backlog.locationPending'),
      count: meta.locationPending ?? 0,
      icon: MapPinOff,
      iconTone: 'text-tone-amber',
      activeTone: 'border-tone-amber/40 bg-tone-amber/10 text-tone-amber',
      isActive: params.location === 'pending',
      patch: { location: 'pending' },
      clearPatch: { location: 'all' },
      title: t('challan.backlog.locationPendingHint'),
    },
    {
      key: 'location-review',
      label: t('challan.backlog.unconfirmedMatch'),
      count: meta.locationReview ?? 0,
      icon: ScanSearch,
      iconTone: 'text-tone-orange',
      activeTone: 'border-tone-orange/40 bg-tone-orange/10 text-tone-orange',
      isActive: params.location === 'review',
      patch: { location: 'review' },
      clearPatch: { location: 'all' },
      title: t('challan.backlog.unconfirmedMatchHint'),
    },
    {
      key: 'not-dispatched',
      label: t('challan.backlog.notDispatched'),
      count: meta.notDispatched ?? 0,
      icon: PackageX,
      iconTone: 'text-tone-indigo',
      activeTone: 'border-tone-indigo/40 bg-tone-indigo/10 text-tone-indigo',
      isActive: params.dispatch === 'pending',
      patch: { dispatch: 'pending' },
      clearPatch: { dispatch: 'all' },
      title: t('challan.backlog.notDispatchedHint'),
    },
    {
      key: 'partly-dispatched',
      label: t('challan.backlog.partlySent'),
      count: meta.partlyDispatched ?? 0,
      icon: PackageOpen,
      iconTone: 'text-tone-cyan',
      activeTone: 'border-tone-cyan/40 bg-tone-cyan/10 text-tone-cyan',
      isActive: params.dispatch === 'partial',
      patch: { dispatch: 'partial' },
      clearPatch: { dispatch: 'all' },
      title: t('challan.backlog.partlySentHint'),
    },
    {
      key: 'returned',
      label: t('challan.backlog.returnedAtDepot'),
      count: meta.returnedAtDepot ?? 0,
      icon: Undo2,
      iconTone: 'text-tone-rose',
      activeTone: 'border-tone-rose/40 bg-tone-rose/10 text-tone-rose',
      isActive: params.dispatch === 'returned',
      patch: { dispatch: 'returned' },
      clearPatch: { dispatch: 'all' },
      title: t('challan.backlog.returnedAtDepotHint'),
    },
  ]

  /**
   * An active chip stays drawn even at zero. Filtering to the blank amounts
   * and clearing the last one would otherwise remove the only control that
   * says the filter is on, leaving an empty list with no visible reason.
   */
  const visible = chips.filter((chip) => chip.count > 0 || chip.isActive)

  if (visible.length === 0) {
    return null
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-x-2 gap-y-1.5', className)}>
      <span className="mr-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        {t('challan.backlog.heading')}
      </span>
      {visible.map((chip) => (
        <button
          key={chip.key}
          type="button"
          aria-pressed={chip.isActive}
          title={chip.title}
          onClick={() => onChange(chip.isActive ? chip.clearPatch : chip.patch)}
          className={cn(
            'inline-flex h-7 items-center gap-1.5 rounded-full border pr-1 pl-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
            chip.isActive
              ? chip.activeTone
              : 'border-border bg-background text-foreground/85 hover:bg-muted',
          )}
        >
          <chip.icon className={cn('size-3.5', !chip.isActive && chip.iconTone)} aria-hidden />
          {chip.label}
          <span
            className={cn(
              'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
              chip.isActive ? 'bg-background/70' : 'bg-muted text-muted-foreground',
            )}
          >
            {formatNumber(chip.count)}
          </span>
        </button>
      ))}
    </div>
  )
}
