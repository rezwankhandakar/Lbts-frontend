import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSaveCompletion } from '../hooks/use-deliveries'
import {
  completionPayload,
  everythingReturned,
  returnedTotal,
  storedReturns,
} from '../lib/completion-payload'
import type { ReturnQuantities } from '../lib/completion-payload'
import type { TripChallanRecord, TripRecord } from '../types'
import { CompletionChallanCard } from './completion-challan-card'
import { DeliveryExtrasSection } from './delivery-extras-section'
import { ReceivedCopySection } from './received-copy-section'
import { ReturnChoice } from './return-choice'
import type { ReturnChoiceValue } from './return-choice'

interface DeliveryCompletionEditorProps {
  trip: TripRecord
  challan: TripChallanRecord
  canWrite: boolean
}

/**
 * One challan's delivery, from the far end — in the order it is worked:
 *
 * 1. **The challan**, drawn as the manifest draws it.
 * 2. **What happened to the goods.** All delivered, some came back, or the
 *    whole challan came back. A return is never a correction: returned goods
 *    stay on the challan for another trip. A full return closes the delivery
 *    by itself, because nobody signed for anything.
 * 3. **The signed copy**, one press on the scanner. A lost copy can be
 *    declared instead, with a reason.
 * 4. **Floor, carrying and a note**, folded away.
 *
 * Mounted keyed on the challan id by its page: every piece of state here
 * belongs to one delivery.
 */
export function DeliveryCompletionEditor({ trip, challan, canWrite }: DeliveryCompletionEditorProps) {
  const save = useSaveCompletion()
  const [drafts, setDrafts] = useState<ReturnQuantities | null>(null)
  const [pending, setPending] = useState<ReturnChoiceValue | null>(null)

  const stored = storedReturns(challan)
  const storedQty = returnedTotal(stored)
  const storedChoice: ReturnChoiceValue =
    storedQty === 0 ? 'delivered' : storedQty >= challan.totalQty ? 'returned' : 'partial'
  const draftQty = drafts ? returnedTotal(drafts) : 0

  const saveReturns = (returns: ReturnQuantities, via: ReturnChoiceValue) => {
    setPending(via)
    save.mutate(
      {
        tripId: trip.id,
        challanId: challan.challanId,
        payload: completionPayload(challan, { returns }),
      },
      {
        onSuccess: () => setDrafts(null),
        onSettled: () => setPending(null),
      },
    )
  }

  const onChoose = (next: ReturnChoiceValue) => {
    if (next === 'partial') {
      setDrafts((current) => current ?? (storedChoice === 'partial' ? stored : {}))
      return
    }
    setDrafts(null)
    if (next !== storedChoice) {
      saveReturns(next === 'returned' ? everythingReturned(challan) : {}, next)
    }
  }

  return (
    <div className="space-y-4">
      <CompletionChallanCard
        challan={challan}
        returns={drafts ?? stored}
        editing={drafts !== null}
        disabled={save.isPending}
        onReturnChange={(lineIndex, qty) =>
          setDrafts((current) => ({ ...(current ?? {}), [lineIndex]: qty }))
        }
      />

      {canWrite && (
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight">What happened to the goods?</h2>
          <ReturnChoice
            value={drafts !== null ? 'partial' : storedChoice}
            pending={pending}
            disabled={save.isPending}
            onChoose={onChoose}
          />

          {drafts !== null && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
              <p className="min-w-48 flex-1 text-xs text-muted-foreground">
                {draftQty === 0
                  ? 'Set how many of each product came back on the lines above.'
                  : `${draftQty} of ${challan.totalQty} came back · ${challan.totalQty - draftQty} delivered.`}{' '}
                Returned goods stay on the challan for another trip.
              </p>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={save.isPending}
                onClick={() => setDrafts(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={save.isPending}
                onClick={() => saveReturns(drafts, 'partial')}
              >
                {pending === 'partial' ? (
                  <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
                ) : (
                  <Save data-icon="inline-start" aria-hidden />
                )}
                Save returns
              </Button>
            </div>
          )}
        </section>
      )}

      <ReceivedCopySection trip={trip} challan={challan} canWrite={canWrite} />
      <DeliveryExtrasSection trip={trip} challan={challan} canWrite={canWrite} />
    </div>
  )
}
