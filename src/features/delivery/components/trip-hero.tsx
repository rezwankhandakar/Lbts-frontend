import type { TripActions } from '../hooks/use-trip-actions'
import type { TripRecord } from '../types'
import { TripActionsBar } from './trip-actions-bar'
import { TripHeroBand } from './trip-hero-band'
import { TripHeroFacts } from './trip-hero-facts'
import { TripProductChips } from './trip-product-chips'
import { TripQuickTiles } from './trip-quick-tiles'
import { TripStopChips } from './trip-stop-chips'

interface TripHeroProps {
  trip: TripRecord
  actions: TripActions
  /** A stop was pressed: take the reader to that challan's card. */
  onStopSelect: (challanId: string) => void
  /** A bill was saved: take the reader back to the bill backlog. */
  onBillSaved?: () => void
}

/**
 * Everything about a trip that is not one challan, in one panel at the top of
 * its page, read from the headline down to the doors:
 *
 * 1. **The band** — the number, where it stands, the day it ran, the actions,
 *    who ran it as one row of chips, and a segment per delivery saying which
 *    are done.
 * 2. **What it cost, and what was said** — the notes log and the bill, each
 *    one row tall, opening their form on demand.
 * 3. **What went** — the load by product, on one line.
 * 4. **Where it went** — a small card per stop, wrapping onto as many rows as
 *    it needs: address, thana and district, returns, floor, carrying and note.
 *
 * **The whole panel fits a laptop screen** for an ordinary trip, and every
 * part of it is laid out against that: each section is one row tall except
 * the stops, which show every door rather than scroll some out of sight. It
 * replaced a sidebar
 * that carried the bill form, the note composer and the parties down a narrow
 * column beside the manifest, which made the page's two halves compete for
 * one screen.
 */
export function TripHero({ trip, actions, onStopSelect, onBillSaved }: TripHeroProps) {
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

        <div className="bg-muted/20 px-4 pt-2.5 pb-2 sm:px-5">
          <TripStopChips challans={challans} onSelect={onStopSelect} />
        </div>
      </div>
    </section>
  )
}
