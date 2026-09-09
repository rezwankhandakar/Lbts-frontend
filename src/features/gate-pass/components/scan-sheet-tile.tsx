import { Check, FileText, Layers, SkipForward } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { BatchItem, BatchItemStatus } from '../hooks/use-scan-batch'

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

interface ScanSheetTileProps {
  item: BatchItem
  /** 1-based, as the operator counts them. */
  position: number
  thumbnail: string | undefined
  isActive: boolean
  /** Null when the tray is not choosing sheets to join. */
  isSelected: boolean | null
  /** False for a sheet that may not be joined — one already filed. */
  isSelectable: boolean
  onClick: () => void
}

/**
 * One scanned sheet in the tray.
 *
 * Its own file because it does two jobs at once: it is the picker for which
 * sheet is being typed, and in joining mode it is a checkbox. Both states need
 * the same thumbnail, the same status badge and the same ring, and keeping
 * them together is what stops the two drifting apart.
 */
export function ScanSheetTile({
  item,
  position,
  thumbnail,
  isActive,
  isSelected,
  isSelectable,
  onClick,
}: ScanSheetTileProps) {
  const style = STATUS_STYLES[item.status]
  const isJoining = isSelected !== null
  const isJoined = item.parts.length > 0

  const label = item.gatePassId ?? (isJoined ? `${item.pageCount} pages` : `Sheet ${position}`)

  const description = isJoined
    ? `${item.parts.length} sheets joined into one gate pass · ${style.label}`
    : `Sheet ${position} · ${style.label}`

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            onClick={onClick}
            disabled={isJoining && !isSelectable}
            aria-current={!isJoining && isActive ? 'true' : undefined}
            aria-pressed={isJoining ? Boolean(isSelected) : undefined}
            className={cn(
              'relative block w-16 overflow-hidden rounded-lg bg-card ring-1 transition-all outline-none',
              'focus-visible:ring-2 focus-visible:ring-ring',
              style.ring,
              !isJoining && isActive && 'ring-2 ring-primary',
              isJoining && isSelected && 'ring-2 ring-primary',
              isJoining && !isSelectable && 'cursor-not-allowed opacity-40',
              !isJoining && item.status === 'skipped' && 'opacity-50',
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

        <span className="flex items-center justify-center gap-1 truncate px-1 py-1 text-[10px] leading-tight font-medium">
          {isJoined && <Layers className="size-2.5 shrink-0 text-muted-foreground" aria-hidden />}
          <span className="truncate">{label}</span>
        </span>

        {/* In joining mode the corner is a tick box, because that is what the
            tile has become. Outside it, it reports what the sheet is. */}
        {isJoining ? (
          <span
            className={cn(
              'absolute top-1 right-1 flex size-4 items-center justify-center rounded border',
              isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card',
            )}
            aria-hidden
          >
            {isSelected && <Check className="size-2.5" />}
          </span>
        ) : (
          item.status !== 'pending' && (
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
          )
        )}
      </TooltipTrigger>

      <TooltipContent>
        {description}
        {item.gatePassId ? ` · ${item.gatePassId}` : ''}
        {isJoining && !isSelectable ? ' · already filed, cannot be joined' : ''}
      </TooltipContent>
    </Tooltip>
  )
}
