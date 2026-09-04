import { useEffect, useMemo } from 'react'
import { Check, FileText, Layers, SkipForward, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isPdf } from '../lib/gate-pass-document'
import type { BatchItem, BatchItemStatus, ScanBatch } from '../hooks/use-scan-batch'

interface ScanBatchTrayProps {
  batch: ScanBatch
  /** Offered only while nothing has been filed — see the comment below. */
  onCombine?: () => void
  disabled?: boolean
}

interface StatusStyle {
  ring: string
  badge: string
  label: string
}

/**
 * Full literal class strings, because Tailwind scans source text — the same
 * rule as `layout/nav-accents.ts` and `lib/roles.ts`.
 */
const STATUS_STYLES: Record<BatchItemStatus, StatusStyle> = {
  pending: {
    ring: 'ring-border',
    badge: 'bg-muted text-muted-foreground',
    label: 'Not entered yet',
  },
  submitted: {
    ring: 'ring-tone-emerald/50',
    badge: 'bg-tone-emerald text-background',
    label: 'Submitted',
  },
  draft: {
    ring: 'ring-tone-amber/50',
    badge: 'bg-tone-amber text-background',
    label: 'Saved as a draft',
  },
  skipped: {
    ring: 'ring-border',
    badge: 'bg-muted-foreground text-background',
    label: 'Skipped',
  },
}

/**
 * Object URLs for every sheet in the stack, created once per set of files and
 * revoked together.
 *
 * Ten live handles into memory is ten leaks if they are not released, and a
 * per-item hook is not an option — the list changes length. One map, one
 * cleanup.
 */
function useThumbnails(items: BatchItem[]): Record<string, string> {
  const urls = useMemo(() => {
    const map: Record<string, string> = {}
    for (const item of items) {
      // A PDF cannot be shown as an <img>; those get an icon instead.
      if (!isPdf(item.file.type)) {
        map[item.id] = URL.createObjectURL(item.file)
      }
    }
    return map
  }, [items])

  useEffect(() => {
    return () => {
      for (const url of Object.values(urls)) {
        URL.revokeObjectURL(url)
      }
    }
  }, [urls])

  return urls
}

/**
 * The stack of scanned sheets, and how far through it the operator is.
 *
 * This is what makes a ten-sheet feeder run usable: every sheet is on screen
 * at once, the one being typed is obvious, and a filed sheet carries the gate
 * pass number it became — so nobody types the same challan twice, and nobody
 * has to remember where they were after a phone call.
 */
export function ScanBatchTray({ batch, onCombine, disabled }: ScanBatchTrayProps) {
  const thumbnails = useThumbnails(batch.items)

  if (!batch.isBatch) {
    return null
  }

  return (
    <section aria-label="Scanned sheets" className="border-b bg-muted/20">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <Layers className="size-4 text-muted-foreground" aria-hidden />
          <p className="text-[13px] font-semibold tracking-tight">
            {batch.total} sheets scanned
          </p>
          <span className="text-xs text-muted-foreground" aria-live="polite">
            {batch.filed} of {batch.total} filed
            {batch.remaining > 0 ? ` · ${batch.remaining} to go` : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Only while the stack is untouched. Once a sheet has become a gate
              pass, merging the rest into one document would contradict a
              record that already exists. */}
          {onCombine && batch.filed === 0 && (
            <Button variant="ghost" size="xs" onClick={onCombine} disabled={disabled}>
              These are one gate pass
            </Button>
          )}

          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={batch.clear}
            disabled={disabled}
          >
            <X data-icon="inline-start" aria-hidden />
            Clear all
          </Button>
        </div>
      </header>

      {/* Horizontal scroll rather than a wrapping grid: the sheets are in the
          order they came off the feeder, and that order is worth keeping
          readable at any width. */}
      <ol className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-5">
        {batch.items.map((item, index) => {
          const style = STATUS_STYLES[item.status]
          const isActive = item.id === batch.activeId
          const thumbnail = thumbnails[item.id]

          return (
            <li key={item.id} className="shrink-0">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      onClick={() => batch.select(item.id)}
                      aria-current={isActive ? 'true' : undefined}
                      className={cn(
                        'relative block w-16 overflow-hidden rounded-lg bg-card ring-1 transition-all outline-none',
                        'focus-visible:ring-2 focus-visible:ring-ring',
                        style.ring,
                        isActive && 'ring-2 ring-primary',
                        item.status === 'skipped' && 'opacity-50',
                      )}
                    />
                  }
                >
                  <span className="flex h-20 items-center justify-center overflow-hidden bg-muted/60">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="size-full object-cover object-top" />
                    ) : (
                      <FileText className="size-6 text-muted-foreground" aria-hidden />
                    )}
                  </span>

                  <span className="block truncate px-1 py-1 text-[10px] leading-tight font-medium">
                    {item.gatePassId ?? `Sheet ${index + 1}`}
                  </span>

                  {item.status !== 'pending' && (
                    <span
                      className={cn(
                        'absolute top-1 right-1 flex size-4 items-center justify-center rounded-full',
                        style.badge,
                      )}
                      aria-hidden
                    >
                      {item.status === 'skipped' ? (
                        <SkipForward className="size-2.5" />
                      ) : (
                        <Check className="size-2.5" />
                      )}
                    </span>
                  )}
                </TooltipTrigger>

                <TooltipContent>
                  Sheet {index + 1} · {style.label}
                  {item.gatePassId ? ` · ${item.gatePassId}` : ''}
                </TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ol>

      {batch.active && batch.active.status === 'pending' && (
        <div className="flex items-center justify-between gap-2 border-t px-4 py-2 sm:px-5">
          <p className="text-xs text-muted-foreground">
            Entering sheet{' '}
            <span className="font-medium text-foreground">{batch.activePosition}</span> of{' '}
            {batch.total}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => batch.skip(batch.active!.id)}
              disabled={disabled}
            >
              <SkipForward data-icon="inline-start" aria-hidden />
              Skip this sheet
            </Button>
            <Button
              variant="ghost"
              size="xs"
              className="text-muted-foreground"
              onClick={() => batch.remove(batch.active!.id)}
              disabled={disabled}
            >
              <Trash2 data-icon="inline-start" aria-hidden />
              Discard
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
