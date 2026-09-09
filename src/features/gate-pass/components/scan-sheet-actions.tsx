import { SkipForward, Split, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BatchItem } from '../hooks/use-scan-batch'

interface ScanSheetActionsProps {
  item: BatchItem
  /** 1-based position of this sheet in the stack. */
  position: number
  total: number
  /** True when the tray builds one document rather than a queue of records. */
  singleDocument: boolean
  busy: boolean
  onSplit: () => void
  onSkip: () => void
  onRemove: () => void
}

/**
 * What can be done to the sheet on screen, and where it sits in the stack.
 *
 * Three verbs that are not variations of each other. **Separate again** undoes
 * a join and is offered only on a sheet that was one. **Skip** is a queue move
 * — not this sheet, the next one — so it is absent where there is no next one.
 * **Discard** drops the sheet entirely, and is the only one of the three that
 * applies wherever a sheet does.
 */
export function ScanSheetActions({
  item,
  position,
  total,
  singleDocument,
  busy,
  onSplit,
  onSkip,
  onRemove,
}: ScanSheetActionsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 sm:px-5">
      <p className="text-xs text-muted-foreground">
        {singleDocument ? 'Showing sheet ' : 'Entering sheet '}
        <span className="font-medium text-foreground">{position}</span> of {total}
        {item.parts.length > 0 && (
          <>
            {' · '}
            <span className="font-medium text-foreground">{item.parts.length} sheets joined</span>
          </>
        )}
      </p>

      <div className="flex items-center gap-1">
        {item.parts.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={onSplit}
            disabled={busy}
          >
            <Split data-icon="inline-start" aria-hidden />
            Separate again
          </Button>
        )}

        {!singleDocument && (
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={onSkip}
            disabled={busy}
          >
            <SkipForward data-icon="inline-start" aria-hidden />
            Skip this sheet
          </Button>
        )}

        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={onRemove}
          disabled={busy}
        >
          <Trash2 data-icon="inline-start" aria-hidden />
          Discard
        </Button>
      </div>
    </div>
  )
}
