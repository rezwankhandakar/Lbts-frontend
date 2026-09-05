import { CircleCheck, CircleDot, Circle, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatRange } from '../lib/challan-meta'
import type { ChallanEntry } from '../lib/challan-session'

interface ChallanQueueProps {
  entries: ChallanEntry[]
  activeId: string | null
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onAdd: () => void
  /** False once every page of the source belongs to a filed challan. */
  canAdd: boolean
  disabled?: boolean
}

/**
 * The challans cut out of this PDF, and which one is being worked on.
 *
 * It is a horizontal strip rather than a sidebar because it sits under a
 * two-column workspace that has no third column to give it, and because what
 * an operator needs from it is a glance: which are done, which is current,
 * how many are left. Opening one is a click; that is the whole interaction.
 *
 * A filed challan keeps its place in the strip with the number it was given.
 * That is deliberate — an operator working through a stack wants to see the
 * challan numbers accumulating, and it is also how they spot that they have
 * filed the same sheet twice.
 */
export function ChallanQueue({
  entries,
  activeId,
  onSelect,
  onRemove,
  onAdd,
  canAdd,
  disabled,
}: ChallanQueueProps) {
  return (
    <section
      aria-label="Challans in this PDF"
      className="rounded-xl border bg-card p-3 shadow-sm"
    >
      <div className="mb-2.5 flex items-center justify-between gap-3">
        <h2 className="text-[13px] font-semibold tracking-tight">
          Challan queue
          <span className="ml-2 font-normal text-muted-foreground">{entries.length}</span>
        </h2>

        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={onAdd}
          disabled={disabled || !canAdd}
          title={canAdd ? undefined : 'Every page of this PDF already belongs to a challan'}
        >
          <Plus data-icon="inline-start" aria-hidden />
          Add challan
        </Button>
      </div>

      <ul className="flex gap-2 overflow-x-auto pb-1">
        {entries.map((entry, index) => {
          const isActive = entry.id === activeId
          const isFiled = entry.status === 'submitted'

          return (
            <li key={entry.id} className="shrink-0">
              <div
                className={cn(
                  'group relative flex w-44 flex-col rounded-lg border p-2.5 text-left transition-colors',
                  isActive
                    ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/25'
                    : 'bg-card hover:bg-muted/50',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(entry.id)}
                  disabled={disabled}
                  aria-current={isActive ? 'true' : undefined}
                  className="rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center gap-1.5">
                    {isFiled ? (
                      <CircleCheck className="size-3.5 shrink-0 text-tone-emerald" aria-hidden />
                    ) : isActive ? (
                      <CircleDot className="size-3.5 shrink-0 text-primary" aria-hidden />
                    ) : (
                      <Circle className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    )}
                    <span className="text-xs font-semibold">
                      Challan {String(index + 1).padStart(2, '0')}
                    </span>
                  </span>

                  <span className="mt-1 block text-[11px] text-muted-foreground">
                    {formatRange(entry)}
                  </span>

                  <span
                    className={cn(
                      'mt-1 block truncate text-[11px]',
                      isFiled ? 'font-medium text-tone-emerald' : 'text-muted-foreground',
                    )}
                  >
                    {isFiled
                      ? `SL ${entry.slNumber} · ${entry.challanNumber}`
                      : entry.values
                        ? 'In progress'
                        : 'Not started'}
                  </span>
                </button>

                {/* Only an unfiled challan can leave the queue. A filed one is
                    a permanent record, and removing it is a delete against the
                    API rather than a change to a list. */}
                {!isFiled && entries.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemove(entry.id)}
                    disabled={disabled}
                    aria-label={`Remove challan ${index + 1} from the queue`}
                    className="absolute top-1.5 right-1.5 rounded-md p-0.5 text-muted-foreground opacity-0 transition-opacity outline-none group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring hover:text-destructive"
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
