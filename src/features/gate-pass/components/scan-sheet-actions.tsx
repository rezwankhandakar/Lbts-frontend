import { SkipForward, Split, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import type { BatchItem } from '../hooks/use-scan-batch'
import { useT } from '@/lib/i18n'

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
  const t = useT()

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 sm:px-5">
      <p className="text-xs text-muted-foreground">
        {t(singleDocument ? 'gatePass.tray.showingSheet' : 'gatePass.tray.enteringSheet', {
          position: formatNumber(position),
          total: formatNumber(total),
        })}
        {item.parts.length > 0 && (
          <>
            {' · '}
            <span className="font-medium text-foreground">
              {t('gatePass.scanner.sheetsJoined', {
                count: item.parts.length,
                n: formatNumber(item.parts.length),
              })}
            </span>
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
            {t('gatePass.tray.separate')}
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
            {t('gatePass.tray.skip')}
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
          {t('gatePass.tray.discard')}
        </Button>
      </div>
    </div>
  )
}
