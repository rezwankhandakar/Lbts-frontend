import { useMemo, useState } from 'react'
import { Building2, ChevronDown, Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useSaveCompletion } from '../hooks/use-deliveries'
import { completionPayload } from '../lib/completion-payload'
import { floorLabel, taka } from '../lib/delivery-meta'
import { MAX_FLOOR } from '../types'
import type { CarryingChargeRecord, TripChallanRecord, TripRecord } from '../types'
import { CarryingChargesEditor } from './carrying-charges-editor'

interface DeliveryExtrasSectionProps {
  trip: TripRecord
  challan: TripChallanRecord
  canWrite: boolean
}

/**
 * Floor, carrying and a note — worth recording, never what somebody opened the
 * page to do. So it folds away, opens by itself when something is already on
 * record, and says in its closed header what that is.
 */
export function DeliveryExtrasSection({ trip, challan, canWrite }: DeliveryExtrasSectionProps) {
  const [open, setOpen] = useState(
    challan.floorNo !== null || challan.carrying.length > 0 || challan.deliveryNote !== '',
  )
  const [floor, setFloor] = useState(challan.floorNo === null ? '' : String(challan.floorNo))
  const [carrying, setCarrying] = useState<CarryingChargeRecord[]>(challan.carrying)
  const [note, setNote] = useState(challan.deliveryNote)
  const save = useSaveCompletion()
  const locked = !canWrite || save.isPending

  const dirty = useMemo(() => {
    const storedFloor = challan.floorNo === null ? '' : String(challan.floorNo)
    if (floor.trim() !== storedFloor || note !== challan.deliveryNote) {
      return true
    }
    return (
      carrying.length !== challan.carrying.length ||
      carrying.some(
        (entry, index) =>
          entry.kind !== challan.carrying[index].kind ||
          entry.description !== challan.carrying[index].description ||
          entry.amount !== challan.carrying[index].amount,
      )
    )
  }, [challan, floor, note, carrying])

  const summary = [
    challan.floorNo !== null ? floorLabel(challan.floorNo) : null,
    challan.carryingTotal > 0 ? `Carrying ${taka(challan.carryingTotal)}` : null,
    challan.deliveryNote ? 'Note' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  const onSave = () => {
    const floorNo = floor.trim() === '' ? null : Number.parseInt(floor, 10)
    if (floorNo !== null && (Number.isNaN(floorNo) || floorNo > MAX_FLOOR)) {
      toast.error(`A floor has to be between 0 and ${MAX_FLOOR}, or left blank.`)
      return
    }
    save.mutate({
      tripId: trip.id,
      challanId: challan.challanId,
      payload: completionPayload(challan, { floorNo, carrying, deliveryNote: note }),
    })
  }

  return (
    <section className="rounded-xl border bg-card">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-left"
      >
        <Building2 className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight">Floor, carrying &amp; note</span>
          <span className="block text-xs text-muted-foreground">{summary || 'Optional'}</span>
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div className="space-y-4 border-t px-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="delivery-floor">Carried up to which floor</Label>
              <Input
                id="delivery-floor"
                className="max-w-32"
                inputMode="numeric"
                value={floor}
                disabled={locked}
                onChange={(event) => setFloor(event.target.value.replace(/\D/g, ''))}
              />
              <p className="text-xs text-muted-foreground">
                {floor.trim() === '' ? 'Blank if it never went up.' : floorLabel(Number.parseInt(floor, 10))}
                {' · '}0 is the ground floor.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="delivery-note">Delivery note</Label>
              <Textarea
                id="delivery-note"
                rows={3}
                maxLength={600}
                value={note}
                disabled={locked}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Carrying</p>
            <CarryingChargesEditor entries={carrying} disabled={locked} onChange={setCarrying} />
          </div>

          {canWrite && (
            <Button type="button" disabled={!dirty || save.isPending} onClick={onSave}>
              {save.isPending ? (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              ) : (
                <Save data-icon="inline-start" aria-hidden />
              )}
              Save details
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
