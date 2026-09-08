import { CircleDollarSign, MapPinOff, ScanSearch } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChallanFilterPatch, ChallanListParams, PageMeta } from '../types'

interface BacklogChipsProps {
  meta: PageMeta | undefined
  params: ChallanListParams
  onChange: (patch: ChallanFilterPatch) => void
}

interface Chip {
  key: string
  label: string
  count: number
  icon: LucideIcon
  /** Full literal strings — Tailwind scans source text, so a template makes nothing. */
  tone: string
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
 * Three backlogs, and they are genuinely three different jobs. A challan
 * nobody charged is fixed on the rate card or by setting a location. A challan
 * nobody located is fixed in the location editor. A location the machine
 * inferred and nobody read is fixed by looking at it and agreeing — the
 * cheapest of the three and the easiest to skip, which is exactly why a wrong
 * district hides there.
 *
 * They are **buttons, not badges**. A count nobody can act on is a number to
 * scroll past; CLAUDE.md already says as much about the location backlog —
 * "it would want to be a clickable card rather than a fifth number nobody
 * acts on". Pressing one filters the list to it, pressing it again clears it,
 * and the pressed state is what stops the counts underneath being a mystery.
 *
 * A chip with nothing behind it is not drawn. This row is a to-do list, and a
 * to-do list that keeps showing finished work is one people stop reading —
 * unlike a status badge on a row, where an absent chip would wrongly read as
 * "no information".
 */
export function BacklogChips({ meta, params, onChange }: BacklogChipsProps) {
  if (!meta) {
    return null
  }

  const chips: Chip[] = [
    {
      key: 'amount',
      label: 'Blank amount',
      count: meta.blankAmount ?? 0,
      icon: CircleDollarSign,
      tone: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20 hover:bg-tone-amber/20',
      activeTone: 'bg-tone-amber/25 text-tone-amber ring-tone-amber/40',
      isActive: params.amount === 'unpriced',
      patch: { amount: 'unpriced' },
      clearPatch: { amount: 'all' },
      title: 'Challans where nothing has been charged. Either the location is not set, or the products are not on the rate card.',
    },
    {
      key: 'partial',
      label: 'Partly charged',
      count: meta.partialAmount ?? 0,
      icon: CircleDollarSign,
      tone: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20 hover:bg-tone-orange/20',
      activeTone: 'bg-tone-orange/25 text-tone-orange ring-tone-orange/40',
      isActive: params.amount === 'partial',
      patch: { amount: 'partial' },
      clearPatch: { amount: 'all' },
      title: 'Challans charged for some of their product lines but not all of them — the amount shown is less than the full charge.',
    },
    {
      key: 'location-pending',
      label: 'Location pending',
      count: meta.locationPending ?? 0,
      icon: MapPinOff,
      tone: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20 hover:bg-tone-amber/20',
      activeTone: 'bg-tone-amber/25 text-tone-amber ring-tone-amber/40',
      isActive: params.location === 'pending',
      patch: { location: 'pending' },
      clearPatch: { location: 'all' },
      title: 'Challans whose district and thana have not been determined. Setting one also prices its lines.',
    },
    {
      key: 'location-review',
      label: 'Unconfirmed match',
      count: meta.locationReview ?? 0,
      icon: ScanSearch,
      tone: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20 hover:bg-tone-orange/20',
      activeTone: 'bg-tone-orange/25 text-tone-orange ring-tone-orange/40',
      isActive: params.location === 'review',
      patch: { location: 'review' },
      clearPatch: { location: 'all' },
      title: 'Locations the system inferred that nobody has confirmed. Opening one and agreeing takes it out of this list.',
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
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((chip) => (
        <button
          key={chip.key}
          type="button"
          aria-pressed={chip.isActive}
          title={chip.title}
          onClick={() => onChange(chip.isActive ? chip.clearPatch : chip.patch)}
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 transition-colors outline-none focus-visible:ring-2',
            chip.isActive ? chip.activeTone : chip.tone,
          )}
        >
          <chip.icon className="size-3" aria-hidden />
          {chip.label}
          <span className="tabular-nums">{chip.count}</span>
        </button>
      ))}
    </div>
  )
}
