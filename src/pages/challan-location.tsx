import { ArrowLeft, TriangleAlert } from 'lucide-react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ChallanDetailsSkeleton } from '@/features/challan/components/challan-details-skeleton'
import { ChallanLocationEditor } from '@/features/challan/components/challan-location-editor'
import { LocationStatusBadge } from '@/features/location/components/location-badges'
import { useSetChallanLocation } from '@/features/challan/hooks/use-challan-mutations'
import { useChallan } from '@/features/challan/hooks/use-challans'
import type { LocationRunState } from '@/features/challan/hooks/use-challan-location-review'

/**
 * Settling one challan's district and thana.
 *
 * A page rather than a dialog, and the reason is the work rather than the
 * pixels. Deciding a location means reading a delivery address against a
 * master list — several lines of transcribed text, a matcher's verdict and the
 * reasoning behind it, and two cascading selectors — and a modal is a box that
 * gets smaller the more of that you put in it. On a page the transcribed text
 * sits beside the choice at full size, the address is not a two-line
 * afterthought, and the browser's own back button means something.
 *
 * **The run travels in router state, not in the URL.** A backlog is cleared in
 * a run — filter to what needs attention, work down it — and the order of that
 * run is a property of the list somebody was looking at, not of any one
 * record. Putting it in the URL would mean a link that promises a run it
 * cannot reproduce once the records change underneath it; putting it in
 * navigation state means a reload honestly degrades to this one challan, which
 * is still a complete, useful page. Stepping on `replace`s rather than pushes,
 * so Back returns to the list rather than walking every record again.
 */
export function ChallanLocationPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { state } = useLocation()

  const run = (state ?? null) as LocationRunState | null
  const returnTo = run?.returnTo ?? '/challan'
  const queue = run?.queue ?? []

  const position = id ? queue.indexOf(id) : -1
  const nextId = position === -1 ? undefined : queue[position + 1]

  const query = useChallan(id)
  const record = query.data ?? null
  const setLocation = useSetChallanLocation()

  /**
   * On to the next in the run, or back to where the run started. Never a wrap:
   * a location backlog is a list that is never empty for long, and looping to
   * the top of it would make "am I done?" unanswerable.
   */
  const goOn = () => {
    if (nextId) {
      navigate(`/challan/${nextId}/location`, { state: run, replace: true })
      return
    }
    goBack()
  }

  /** Back to the list that started the run, still filtered the way it was. */
  function goBack() {
    navigate(returnTo, {
      state: run?.returnFilters ? { challanFilters: run.returnFilters } : undefined,
    })
  }

  if (query.isPending) {
    return <ChallanDetailsSkeleton />
  }

  if (query.isError || !record) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Challan not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {query.error?.message ?? 'It may have been deleted, or you may not have access to it.'}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={goBack}>
          Back to challans
        </Button>
      </div>
    )
  }

  const isSettled = record.locationStatus === 'Verified'

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-1 -ml-2 text-muted-foreground"
          onClick={goBack}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden />
          Back to challans
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {isSettled ? 'Check the location' : 'Set the location'}
          </h1>
          {!isSettled && <LocationStatusBadge value="Pending" />}
          {/* Where this one sits in the run, so somebody working down a
              filtered list knows whether they are three in or nearly done. */}
          {position !== -1 && queue.length > 1 && (
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground tabular-nums">
              {position + 1} of {queue.length}
            </span>
          )}
        </div>

        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
          {record.challanNumber} · SL {record.slNumber} · nothing on the challan or in the stored
          document changes, so there is never anything to reprint.
        </p>
      </header>

      {/* Keyed on the record, so a run resets every piece of the editor's state
          between challans rather than opening the next one holding the last
          one's district. */}
      <ChallanLocationEditor
        key={record.id}
        record={record}
        isPending={setLocation.isPending}
        onCancel={goBack}
        onSkip={nextId ? goOn : undefined}
        onSubmit={(locationId) =>
          setLocation.mutate(
            { id: record.id, locationId },
            {
              onSuccess: () => {
                /**
                 * Only a decision moves the run on. Clearing a location leaves
                 * the record wanting one, so whoever just cleared it stays on
                 * it — a blanked challan that scrolled away is one somebody
                 * deliberately emptied and then lost.
                 */
                if (locationId !== null) {
                  goOn()
                }
              },
            },
          )
        }
      />
    </div>
  )
}
