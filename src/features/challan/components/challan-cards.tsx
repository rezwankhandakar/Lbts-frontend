import type { ChallanRecord } from '../types'
import { ChallanCard } from './challan-card'
import type { ChallanActions } from './challan-action-menu'

interface ChallanCardsProps {
  records: ChallanRecord[]
  actions: ChallanActions
  onOpen: (record: ChallanRecord) => void
}

/**
 * The records, two to a row.
 *
 * One layout at every width rather than a table above md and cards below it:
 * the card is what this list is, and two presentations of the same records
 * were two things that had to be kept saying the same thing. Below lg the grid
 * is a single column, which is the phone view the cards were written for.
 *
 * The grid sits on the muted canvas so the cards read as raised panels, which
 * is the same three-surface rule the shell uses.
 */
export function ChallanCards({ records, actions, onOpen }: ChallanCardsProps) {
  return (
    <ul className="grid gap-3 bg-muted/30 p-3 lg:grid-cols-2">
      {records.map((record) => (
        <ChallanCard key={record.id} record={record} actions={actions} onOpen={onOpen} />
      ))}
    </ul>
  )
}
