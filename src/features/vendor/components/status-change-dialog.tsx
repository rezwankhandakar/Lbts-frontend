import { useState } from 'react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { StatusMeta } from '../lib/vendor-meta'

interface StatusChangeDialogProps<TStatus extends string> {
  open: boolean
  isPending: boolean
  /** What is being moved: "Malek Transport", "DHAKA METRO-TA-11-1234". */
  subject: string
  /** "vendor", "vehicle", "driver" — used in the sentences below. */
  noun: string
  current: TStatus
  /** The states this subject may move to. Empty means it is already everywhere. */
  options: readonly TStatus[]
  meta: (value: string) => StatusMeta
  /** What each state means for this subject, beyond the generic description. */
  consequence?: (status: TStatus) => string | undefined
  onOpenChange: (open: boolean) => void
  onConfirm: (status: TStatus, note: string) => void
}

/**
 * Moving a vendor, a vehicle or a driver between states.
 *
 * One dialog for all three, because the decision is identical in shape: pick a
 * target, read what it will mean, optionally say why, confirm. Three
 * hand-written versions would be three chances to forget the consequence line,
 * which is the part that actually matters — "Inactive" on its own tells nobody
 * that the assignment form will stop offering this vendor tomorrow.
 *
 * Picking a state only stages it. The summary underneath spells out the move
 * and the operator still has to confirm, so nothing changes on a stray click —
 * the same pattern the administration role dialog uses.
 */
export function StatusChangeDialog<TStatus extends string>({
  open,
  isPending,
  subject,
  noun,
  current,
  options,
  meta,
  consequence,
  onOpenChange,
  onConfirm,
}: StatusChangeDialogProps<TStatus>) {
  const [selected, setSelected] = useState<TStatus | null>(null)
  const [note, setNote] = useState('')

  /**
   * Clears the staged choice whenever the dialog opens, or opens for a
   * different subject, so a decision made for one record can never carry to the
   * next. Adjusted during render rather than in an effect — the same pattern
   * `change-role-dialog.tsx` uses — which avoids the extra render pass.
   */
  const [session, setSession] = useState<string | null>(null)
  const currentSession = open ? subject : null
  if (currentSession !== session) {
    setSession(currentSession)
    setSelected(null)
    setNote('')
  }

  const currentMeta = meta(current)
  const targets = options.filter((option) => option !== current)
  const staged = selected ? meta(selected) : null
  const note_required = selected !== null && selected !== ('Active' as TStatus)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change status</DialogTitle>
          <DialogDescription>
            A {noun}&apos;s status decides what can be done with it next. Nothing already recorded
            is changed or removed by it.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
          <p className="truncate text-[13px] font-medium">{subject}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('size-1.5 shrink-0 rounded-full', currentMeta.dot)} aria-hidden />
            Currently {currentMeta.label.toLowerCase()}
          </p>
        </div>

        <div role="group" aria-label="Select a status" className="grid gap-2 sm:grid-cols-2">
          {targets.map((option) => {
            const optionMeta = meta(option)
            const Icon = optionMeta.icon
            const isSelected = option === selected

            return (
              <button
                key={option}
                type="button"
                aria-pressed={isSelected}
                disabled={isPending}
                onClick={() => setSelected(option)}
                className={cn(
                  'flex items-start gap-2.5 rounded-xl border p-3 text-left transition-all duration-150 outline-none',
                  'focus-visible:ring-2 focus-visible:ring-ring',
                  isSelected
                    ? 'border-primary bg-primary/[0.06] ring-1 ring-primary/25'
                    : 'hover:border-primary/35 hover:bg-primary/[0.03]',
                )}
              >
                <span
                  className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg ring-1',
                    optionMeta.chip,
                  )}
                >
                  <Icon className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold">{optionMeta.label}</span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-muted-foreground">
                    {optionMeta.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {staged && selected && (
          <div className="space-y-3 rounded-lg border border-primary/25 bg-primary/[0.05] p-3">
            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span className="font-semibold">{currentMeta.label}</span>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
              <span className="font-semibold">{staged.label}</span>
            </div>

            {consequence?.(selected) && (
              <p className="text-[11.5px] leading-snug text-muted-foreground">
                {consequence(selected)}
              </p>
            )}

            {note_required && (
              <div className="space-y-1.5">
                <Label htmlFor="status-note" className="text-xs">
                  Reason (optional)
                </Label>
                <Textarea
                  id="status-note"
                  rows={2}
                  value={note}
                  maxLength={400}
                  disabled={isPending}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Recorded on the record, and cleared when it becomes active again."
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!selected || isPending}
            onClick={() => selected && onConfirm(selected, note.trim())}
          >
            {isPending && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />}
            Confirm change
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
