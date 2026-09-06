import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { LocationSelect } from '@/features/location/components/location-select'
import type { LocationSelection } from '@/features/location/components/location-select'
import type { ChallanRecord } from '../types'

interface SetChallanLocationDialogProps {
  record: ChallanRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (locationId: string | null) => void
}

/**
 * Setting a filed challan's district and thana by hand.
 *
 * The end of the resolution ladder and the final authority in it: whatever the
 * matcher and the assisted step between them decided, a person choosing here
 * overrules it, and nothing re-resolves over the result afterwards.
 *
 * Two things are said out loud because operators would otherwise reasonably
 * assume the opposite. **The challan text does not change** — the thana and
 * district as transcribed stay exactly as they were typed, because what the
 * paper said is a fact about the paper. And **the document is not
 * regenerated**: the back page prints that transcribed text, which this does
 * not touch, so nothing already printed becomes untrue and there is nothing to
 * reprint.
 *
 * Clearing is offered on a record that has one, because a location put on the
 * wrong challan has to be removable — and removing it returns the record to
 * pending rather than to some third state.
 */
export function SetChallanLocationDialog({
  record,
  open,
  isPending,
  onOpenChange,
  onConfirm,
}: SetChallanLocationDialogProps) {
  const [selection, setSelection] = useState<LocationSelection | null>(null)

  /**
   * Opens on whatever the record already has, so "change the thana, keep the
   * district" is two clicks rather than five — and resets between openings,
   * because on a list of near-identical challans a stale selection is how the
   * wrong location gets set.
   *
   * Adjusted during render rather than in an effect: the alternative paints
   * the previous challan's location for a frame, which on a dialog somebody is
   * about to press a button in is exactly long enough to act on.
   */
  const key = open ? (record?.id ?? '') : ''
  const [openedFor, setOpenedFor] = useState('')

  if (key !== openedFor) {
    setOpenedFor(key)
    const existing = record?.resolvedLocation
    setSelection(
      key && existing
        ? {
            id: existing.masterId,
            district: existing.district,
            thana: existing.thana,
            locationType: existing.locationType,
          }
        : null,
    )
  }

  if (!record) {
    return null
  }

  const hasExisting = record.resolvedLocation !== null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Set the location for {record.challanNumber}</DialogTitle>
          <DialogDescription>
            Choose the district and thana from the master list. The location type follows from the
            pair. What was transcribed onto the challan is not changed, and the stored document is
            not regenerated.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <LocationSelect
            value={selection}
            onChange={setSelection}
            disabled={isPending}
            idPrefix="set-challan-location"
          />

          <div className="rounded-lg border bg-muted/30 p-3 text-xs leading-snug text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">As transcribed:</span>{' '}
              {record.thana || '—'} / {record.district || '—'}
            </p>
            <p className="mt-1">{record.deliveryAddress}</p>
          </div>
        </div>

        <DialogFooter>
          {hasExisting && (
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground sm:mr-auto"
              disabled={isPending}
              onClick={() => onConfirm(null)}
            >
              Clear location
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>

          <Button
            type="button"
            disabled={isPending || !selection}
            onClick={() => selection && onConfirm(selection.id)}
          >
            {isPending && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />}
            Set location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
