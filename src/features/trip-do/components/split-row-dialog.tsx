import { useState } from 'react'
import { CircleCheck, Plus, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MAX_SPLIT_PARTS, evenParts, splitProblem } from '../lib/split-parts'
import type { TripDoRowRecord } from '../types'

interface SplitRowDialogProps {
  row: TripDoRowRecord | null
  open: boolean
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (parts: number[]) => void
}

/** One hue per part, as full literal classes, so the bar reads as separate pieces. */
const SEGMENTS = ['bg-tone-indigo', 'bg-tone-cyan', 'bg-tone-violet', 'bg-tone-emerald', 'bg-tone-amber']

/**
 * Dividing a row before its parts are given different Trip DOs — five on the
 * challan that came out on two gate passes as three and two.
 */
export function SplitRowDialog({ row, open, isPending, onOpenChange, onConfirm }: SplitRowDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {row && (
          <SplitBody
            key={row.id}
            row={row}
            isPending={isPending}
            onCancel={() => onOpenChange(false)}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SplitBody({
  row,
  isPending,
  onCancel,
  onConfirm,
}: {
  row: TripDoRowRecord
  isPending: boolean
  onCancel: () => void
  onConfirm: (parts: number[]) => void
}) {
  const [parts, setParts] = useState(() => evenParts(row.qty, 2))
  const problem = splitProblem(parts, row.qty)
  const presets = [2, 3, 4].filter((count) => count <= row.qty)

  const setPart = (index: number, value: number) =>
    setParts((current) => current.map((part, at) => (at === index ? value : part)))

  return (
    <>
      <DialogHeader>
        <DialogTitle>Split quantity</DialogTitle>
        <DialogDescription>
          {row.productName} · <span className="font-mono">{row.model}</span> · {row.qty} pcs on{' '}
          {row.challanNumber}.{' '}
          {row.link
            ? `Every part keeps Trip DO ${row.link.tripDo}; change a part's Trip DO afterwards.`
            : 'Each part can then be given its own Trip DO.'}
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Evenly into</span>
        {presets.map((count) => (
          <Button
            key={count}
            variant={parts.length === count && !problem ? 'secondary' : 'outline'}
            size="xs"
            onClick={() => setParts(evenParts(row.qty, count))}
          >
            {count} parts
          </Button>
        ))}
      </div>

      <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        {parts.map((part, index) => (
          <div
            key={index}
            className={cn('h-full rounded-full transition-[width] duration-300', SEGMENTS[index % SEGMENTS.length])}
            style={{ width: `${(Math.max(0, part) / Math.max(row.qty, 1)) * 100}%` }}
          />
        ))}
      </div>

      <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {parts.map((part, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <span
              className={cn('size-2.5 shrink-0 rounded-full', SEGMENTS[index % SEGMENTS.length])}
              aria-hidden
            />
            <span className="w-14 text-xs text-muted-foreground">Part {index + 1}</span>
            <Input
              type="number"
              inputMode="numeric"
              min={1}
              value={part}
              onChange={(event) => setPart(index, Number.parseInt(event.target.value, 10) || 0)}
              className="h-8 w-24 tabular-nums"
              aria-label={`Pieces in part ${index + 1}`}
            />
            {parts.length > 2 && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setParts((current) => current.filter((_, at) => at !== index))}
                aria-label={`Remove part ${index + 1}`}
              >
                <X aria-hidden />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setParts((current) => [...current, 1])}
          disabled={parts.length >= Math.min(MAX_SPLIT_PARTS, row.qty)}
        >
          <Plus data-icon="inline-start" aria-hidden />
          Add part
        </Button>
        <p
          className={cn(
            'flex items-center gap-1.5 text-xs',
            problem ? 'text-tone-amber' : 'text-tone-emerald',
          )}
          aria-live="polite"
        >
          {problem ? <TriangleAlert className="size-3.5" aria-hidden /> : <CircleCheck className="size-3.5" aria-hidden />}
          {problem ?? `${parts.join(' + ')} = ${row.qty}`}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button onClick={() => onConfirm(parts)} disabled={Boolean(problem) || isPending}>
          {isPending ? 'Splitting…' : `Split into ${parts.length}`}
        </Button>
      </DialogFooter>
    </>
  )
}
