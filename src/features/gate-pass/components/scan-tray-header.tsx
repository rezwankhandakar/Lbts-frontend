import { Layers, Loader2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatNumber } from '@/lib/format'
import type { ScanBatch } from '../hooks/use-scan-batch'
import { useT } from '@/lib/i18n'

interface ScanTrayHeaderProps {
  batch: ScanBatch
  /** True when the tray builds one document rather than a queue of records. */
  singleDocument: boolean
  /** How many sheets are still candidates for joining or removing. */
  pendingCount: number
  /** Null while picking a sheet to type; the ticked ids while selecting. */
  picking: string[] | null
  isJoining: boolean
  busy: boolean
  canJoin: boolean
  onStartPicking: () => void
  onCancelPicking: () => void
  onJoin: () => void
  onRemove: () => void
  onCombine?: () => void
}

/**
 * The tray's top row, which says two entirely different things.
 *
 * Resting, it reports the stack: how many sheets and how far through them the
 * operator is. Selecting, it is a toolbar over ticked sheets, and the count in
 * front of the operator is the number of sheets about to change rather than
 * the number scanned. Keeping both here rather than in the tray is what stops
 * the second one being written as an afterthought on the first.
 */
export function ScanTrayHeader({
  batch,
  singleDocument,
  pendingCount,
  picking,
  isJoining,
  busy,
  canJoin,
  onStartPicking,
  onCancelPicking,
  onJoin,
  onRemove,
  onCombine,
}: ScanTrayHeaderProps) {
  const t = useT()

  if (picking !== null) {
    return (
      <>
        <p className="max-w-md text-xs leading-relaxed text-pretty text-muted-foreground">
          {t('gatePass.tray.pickHint')}
        </p>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={onCancelPicking}
            disabled={isJoining}
          >
            {t('common.actions.cancel')}
          </Button>

          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={onRemove}
            disabled={picking.length === 0 || busy}
          >
            <Trash2 data-icon="inline-start" aria-hidden />
            {picking.length > 0
              ? t('gatePass.tray.removeCount', { n: formatNumber(picking.length) })
              : t('gatePass.tray.remove')}
          </Button>

          <Button size="xs" onClick={onJoin} disabled={!canJoin || busy}>
            {isJoining ? (
              <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
            ) : (
              <Layers data-icon="inline-start" aria-hidden />
            )}
            {isJoining
              ? t('gatePass.tray.joining')
              : picking.length < 2
                ? t('gatePass.tray.joinSheets')
                : t('gatePass.tray.joinCount', { n: formatNumber(picking.length) })}
          </Button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-muted-foreground" aria-hidden />
        <p className="text-[13px] font-semibold tracking-tight">
          {t('gatePass.tray.sheetsScanned', {
            count: batch.total,
            n: formatNumber(batch.total),
          })}
        </p>
        <span className="text-xs text-muted-foreground" aria-live="polite">
          {singleDocument
            ? t('gatePass.tray.savedAsOne')
            : batch.remaining > 0
              ? t('gatePass.tray.filedOfToGo', {
                  filed: formatNumber(batch.filed),
                  total: formatNumber(batch.total),
                  remaining: formatNumber(batch.remaining),
                })
              : t('gatePass.tray.filedOf', {
                  filed: formatNumber(batch.filed),
                  total: formatNumber(batch.total),
                })}
        </span>
      </div>

      <div className="flex items-center gap-1">
        {/* A challan longer than one sheet is ordinary, and only the operator
            can see where one ends and the next begins. */}
        {pendingCount >= 2 && (
          <Button variant="ghost" size="xs" onClick={onStartPicking} disabled={busy}>
            <Layers data-icon="inline-start" aria-hidden />
            {t('gatePass.tray.selectSheets')}
          </Button>
        )}

        {/* Only while the stack is untouched. Once a sheet has become a gate
            pass, merging the rest into one document would contradict a record
            that already exists. */}
        {onCombine && batch.filed === 0 && batch.isBatch && (
          <Button variant="ghost" size="xs" onClick={onCombine} disabled={busy}>
            {t('gatePass.tray.theseAreOne')}
          </Button>
        )}

        <Button
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={batch.clear}
          disabled={busy}
        >
          <X data-icon="inline-start" aria-hidden />
          {t('gatePass.tray.clearAll')}
        </Button>
      </div>
    </>
  )
}
