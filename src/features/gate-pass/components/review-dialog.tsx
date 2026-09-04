import { useState } from 'react'
import { BadgeCheck, CircleSlash, Undo2 } from 'lucide-react'
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
import type { GatePassRecord } from '../types'

export type ReviewDecision = 'Verified' | 'Rejected' | 'Cancelled'

interface DecisionCopy {
  title: string
  description: (record: GatePassRecord) => string
  confirm: string
  icon: typeof BadgeCheck
  iconClass: string
  /** A rejection nobody can act on is worse than no rejection at all. */
  noteRequired: boolean
  noteLabel: string
  notePlaceholder: string
}

const DECISIONS: Record<ReviewDecision, DecisionCopy> = {
  Verified: {
    title: 'Verify this gate pass',
    description: (record) =>
      `Confirm that ${record.gatePassId} matches the scanned document in every detail.`,
    confirm: 'Verify',
    icon: BadgeCheck,
    iconClass: 'text-tone-emerald',
    noteRequired: false,
    noteLabel: 'Note (optional)',
    notePlaceholder: 'Anything worth recording about this check',
  },
  Rejected: {
    title: 'Send back for correction',
    description: (record) =>
      `${record.gatePassId} returns to its author, who can fix it and submit it again.`,
    confirm: 'Send back',
    icon: Undo2,
    iconClass: 'text-tone-rose',
    noteRequired: true,
    noteLabel: 'What needs correcting',
    notePlaceholder: 'Vehicle number does not match the challan',
  },
  Cancelled: {
    title: 'Cancel this gate pass',
    description: (record) =>
      `${record.gatePassId} stays on record but no longer counts. This cannot be undone.`,
    confirm: 'Cancel gate pass',
    icon: CircleSlash,
    iconClass: 'text-tone-orange',
    noteRequired: false,
    noteLabel: 'Reason (optional)',
    notePlaceholder: 'Why this gate pass is being withdrawn',
  },
}

interface ReviewDialogProps {
  record: GatePassRecord | null
  decision: ReviewDecision | null
  isPending: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (note: string) => void
}

/**
 * The reviewer's decision, with the one field that decides whether it is
 * actionable.
 *
 * A rejection has to say what is wrong — the server refuses one without a
 * note, and this stops the operator from finding that out after typing
 * nothing. Verification and cancellation take a note but do not need one.
 */
export function ReviewDialog({
  record,
  decision,
  isPending,
  onOpenChange,
  onConfirm,
}: ReviewDialogProps) {
  const [note, setNote] = useState('')

  /**
   * A note is about one decision on one record, so it never survives either.
   * Adjusted during render rather than in an effect: an effect would let one
   * frame render with the previous note in the box, and React re-runs this
   * component immediately without committing the stale value.
   */
  const subject = `${record?.id ?? ''}:${decision ?? ''}`
  const [renderedSubject, setRenderedSubject] = useState(subject)
  if (subject !== renderedSubject) {
    setRenderedSubject(subject)
    setNote('')
  }

  if (!record || !decision) {
    return null
  }

  const copy = DECISIONS[decision]
  const Icon = copy.icon
  const blocked = copy.noteRequired && note.trim().length === 0

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className={cn('size-4', copy.iconClass)} aria-hidden />
            {copy.title}
          </DialogTitle>
          <DialogDescription>{copy.description(record)}</DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5">
          <Label htmlFor="review-note" className="text-[13px] font-medium">
            {copy.noteLabel}
          </Label>
          <Textarea
            id="review-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={copy.notePlaceholder}
            rows={3}
            maxLength={400}
            aria-invalid={blocked ? true : undefined}
          />
          {copy.noteRequired && (
            <p className="text-xs text-muted-foreground">
              The author sees this, so say what to change.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => onConfirm(note.trim())} disabled={isPending || blocked}>
            {isPending ? 'Working…' : copy.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
