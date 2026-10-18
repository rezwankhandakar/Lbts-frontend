import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripActionsBar } from './trip-actions-bar'
import { TripHeroBand } from './trip-hero-band'
import { TripHeroFacts } from './trip-hero-facts'
import { TripProductChips } from './trip-product-chips'
import { TripQuickTiles } from './trip-quick-tiles'

interface TripHeroProps {
  trip: TripRecord
  actions: TripActions
  /** A bill was saved: take the reader back to the bill backlog. */
  onBillSaved?: () => void
}

/**
 * Everything about a trip that is not one challan, in one panel at the top of
 * its page:
 *
 * 1. **The band** — the number, where it stands, the day it ran, the actions,
 *    who ran it as one row of chips, and a segment per delivery saying which
 *    are done.
 * 2. **What it cost, and what was said** — the notes log and the bill, each
 *    one row tall, opening their form on demand.
 * 3. **What went** — the load by product, on one line.
 *
 * Where each challan went — its address, returns, floor, carrying and note —
 * is on its own card below. There was a row of small "stop" cards here saying
 * the same thing a second time; the business asked for it off, and with it
 * went the only part of this panel whose height followed the load.
 *
 * **The whole panel fits a laptop screen**: every section is one row tall. It
 * replaced a sidebar that carried the bill form, the note composer and the
 * parties down a narrow column beside the manifest, which made the page's two
 * halves compete for one screen.
 */
export function TripHero({ trip, actions, onBillSaved }: TripHeroProps) {
  const challans = trip.challans ?? []
  const canChange = actions.canChange(trip)

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <TripHeroBand trip={trip} actions={<TripActionsBar trip={trip} actions={actions} />}>
        <TripHeroFacts trip={trip} />
      </TripHeroBand>

      <div className="divide-y">
        <div className="bg-muted/20 px-4 py-3 sm:px-5">
          <TripQuickTiles key={trip.id} trip={trip} canChange={canChange} onBillSaved={onBillSaved} />
        </div>

        <div className="px-4 py-2.5 sm:px-5">
          <TripProductChips challans={challans} />
        </div>
      </div>
    </section>
  )
}
