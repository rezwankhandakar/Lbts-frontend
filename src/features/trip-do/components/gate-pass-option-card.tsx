import { Check } from 'lucide-react'
import { formatTripDate } from '@/features/gate-pass/lib/gate-pass-meta'
import { cn } from '@/lib/utils'
import type { GatePassOption, MatchLevel } from '../types'

interface GatePassOptionCardProps {
  option: GatePassOption
  isChosen: boolean
  onChoose: (option: GatePassOption) => void
}

/**
 * The two papers are typed apart, so a gate pass line is offered when its model
 * or customer is *close* to the row's — and says so, in words, beside the value
 * it is close to. A close match is something to read before pressing.
 */
const MATCH_TAG: Record<MatchLevel, { label: string; className: string } | null> = {
  exact: null,
  close: { label: 'close', className: 'bg-tone-amber/10 text-tone-amber' },
  different: { label: 'differs', className: 'bg-tone-rose/10 text-tone-rose' },
}

function MatchTag({ level, what }: { level: MatchLevel; what: string }) {
  const tag = MATCH_TAG[level]
  if (!tag) {
    return null
  }
  return (
    <span
      className={cn('rounded px-1 text-[10px] font-semibold', tag.className)}
      title={`The ${what} on this gate pass is ${level === 'close' ? 'close to' : 'not'} the row's`}
    >
      {what} {tag.label}
    </span>
  )
}

export function GatePassOptionCard({ option, isChosen, onChoose }: GatePassOptionCardProps) {
  const isFull = option.remainingQty === 0 && !option.isCurrent
  const used = option.qty > 0 ? Math.round((option.allocatedQty / option.qty) * 100) : 0

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isChosen}
      disabled={isFull}
      onClick={() => onChoose(option)}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left transition outline-none hover:border-primary/40 focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-55',
        isChosen && 'border-primary/60 bg-primary/5 ring-2 ring-primary/15',
      )}
    >
      <span
        className={cn(
          'flex size-4 shrink-0 items-center justify-center rounded-full border',
          isChosen ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
        )}
        aria-hidden
      >
        {isChosen && <Check className="size-3" />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-mono text-[13px] font-semibold">{option.tripDo}</span>
          <span className="text-[11px] text-muted-foreground">{option.gatePassNumber}</span>
          {option.isCurrent && (
            <span className="rounded bg-tone-emerald/10 px-1.5 text-[10px] font-semibold text-tone-emerald">
              Current
            </span>
          )}
          {option.isOrderTripDo && !option.isCurrent && (
            <span className="rounded bg-tone-indigo/10 px-1.5 text-[10px] font-semibold text-tone-indigo">
              Same as order row
            </span>
          )}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11.5px]">
          <span className="max-w-[14rem] truncate font-mono text-foreground">{option.model}</span>
          <MatchTag level={option.modelMatch} what="model" />
          <span className="max-w-[12rem] truncate text-muted-foreground">{option.customerName}</span>
          <MatchTag level={option.customerMatch} what="customer" />
        </span>
        <span className="mt-0.5 flex flex-wrap gap-x-3 text-[11.5px] text-muted-foreground">
          <span>{formatTripDate(option.tripDate)}</span>
          <span>
            CSD <span className="font-medium text-foreground">{option.csd}</span>
          </span>
          <span>
            Unit <span className="font-medium text-foreground">{option.unit}</span>
          </span>
          <span className="max-w-[12rem] truncate">{option.vehicleNo}</span>
        </span>
      </span>

      <span className="w-24 shrink-0 text-right">
        {option.countsTowardQty ? (
          <>
            <span className="text-[13px] font-semibold tabular-nums">{option.remainingQty}</span>
            <span className="text-[11px] text-muted-foreground"> left of {option.qty}</span>
            <span className="mt-1 block h-1 overflow-hidden rounded-full bg-muted">
              <span className="block h-full rounded-full bg-tone-indigo" style={{ width: `${used}%` }} />
            </span>
          </>
        ) : (
          <span className="text-[11px] text-muted-foreground" title="Returned and re-sent pieces do not use up the gate pass">
            <span className="text-[13px] font-semibold text-foreground tabular-nums">{option.qty}</span> on
            gate pass
          </span>
        )}
      </span>
    </button>
  )
}
