import { useEffect, useMemo, useState } from 'react'
import { Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { isPdf } from '../lib/gate-pass-document'
import type { BatchItem, ScanBatch } from '../hooks/use-scan-batch'
import { ScanSheetActions } from './scan-sheet-actions'
import { ScanSheetTile } from './scan-sheet-tile'
import { ScanTrayHeader } from './scan-tray-header'

interface ScanBatchTrayProps {
  batch: ScanBatch
  /** Offered only while nothing has been filed — see the comment below. */
  onCombine?: () => void
  /**
   * Joins the named sheets into one gate pass document. Awaited, because the
   * merge is real work on real bytes and the tray has to say so.
   */
  onJoin: (ids: string[]) => Promise<boolean>
  isJoining?: boolean
  /**
   * True when this workspace holds one record and therefore one document —
   * correcting a gate pass. The sheets are then pages of a single scan rather
   * than a queue of gate passes waiting to be typed, and everything the tray
   * says about filing, skipping and going next is wrong.
   */
  singleDocument?: boolean
  disabled?: boolean
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
      // A joined sheet is a PDF, which cannot be an <img> — but the sheets it
      // was made from are still here, so it keeps the picture of its first
      // page rather than becoming an icon the moment it is joined.
      const shown = isPdf(item.file.type)
        ? (item.parts.find((part) => !isPdf(part.file.type))?.file ?? null)
        : item.file

      if (shown) {
        map[item.id] = URL.createObjectURL(shown)
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
 *
 * The tray is also where a stack is told apart from a document. Ten sheets are
 * usually ten gate passes, but a printed challan is not always one sheet — so
 * the sheets belonging to one Trip DO are ticked here and joined into a single
 * document before that gate pass is filed. Correcting a record is the same
 * mechanism with the question already answered: there is one record, so every
 * sheet staged against it is a page of its one scan.
 */
export function ScanBatchTray({
  batch,
  onCombine,
  onJoin,
  isJoining,
  singleDocument = false,
  disabled,
}: ScanBatchTrayProps) {
  const thumbnails = useThumbnails(batch.items)

  /** Null while the tray is picking a sheet to type; a list while selecting. */
  const [selection, setSelection] = useState<string[] | null>(null)

  const pending = batch.items.filter((item) => item.status === 'pending')
  const busy = Boolean(disabled || isJoining)

  /**
   * Selecting mode, closed when there is nothing left to select.
   *
   * Derived rather than reset, because a stack drops below two candidates on
   * its own — a join itself does exactly that, and so does filing the
   * second-to-last sheet. Deriving it means the mode cannot be left standing
   * over a stack that no longer offers a choice.
   */
  const picking = pending.length >= 2 ? selection : null

  if (!batch.isBatch && !batch.hasJoined) {
    return null
  }

  const toggle = (id: string) => {
    setSelection((current) =>
      current === null
        ? current
        : current.includes(id)
          ? current.filter((value) => value !== id)
          : [...current, id],
    )
  }

  const join = async (ids: string[]) => {
    if (ids.length < 2) {
      return
    }
    await onJoin(ids)
    setSelection(null)
  }

  const removePicked = () => {
    if (picking === null || picking.length === 0) {
      return
    }
    batch.removeMany(picking)
    setSelection(null)
  }

  const active = batch.active

  return (
    <section aria-label="Scanned sheets" className="border-b bg-muted/20">
      <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
        <ScanTrayHeader
          batch={batch}
          singleDocument={singleDocument}
          pendingCount={pending.length}
          picking={picking}
          isJoining={Boolean(isJoining)}
          busy={busy}
          canJoin={picking !== null && picking.length >= 2}
          onStartPicking={() => setSelection([])}
          onCancelPicking={() => setSelection(null)}
          onJoin={() => void join(picking ?? [])}
          onRemove={removePicked}
          onCombine={onCombine}
        />
      </header>

      {/* One record takes one document, so a stack staged against a correction
          is not a choice the operator can leave open — the save is blocked
          until it is one, and this is the one click that does it. */}
      {singleDocument && picking === null && pending.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-tone-amber/25 bg-tone-amber/5 px-4 py-2 sm:px-5">
          <p className="max-w-md text-xs leading-relaxed text-pretty">
            <span className="font-semibold">This gate pass holds one document.</span> Join these{' '}
            {pending.length} sheets into one, or remove the ones that do not belong.
          </p>
          <Button
            size="xs"
            onClick={() => void join(pending.map((item) => item.id))}
            disabled={busy}
          >
            <Layers data-icon="inline-start" aria-hidden />
            Join all {pending.length}
          </Button>
        </div>
      )}

      {/* Horizontal scroll rather than a wrapping grid: the sheets are in the
          order they came off the feeder, and that order is worth keeping
          readable at any width. */}
      <ol className="flex gap-2 overflow-x-auto px-4 pb-3 sm:px-5">
        {batch.items.map((item, index) => (
          <li key={item.id} className="shrink-0">
            <ScanSheetTile
              item={item}
              position={index + 1}
              thumbnail={thumbnails[item.id]}
              isActive={item.id === batch.activeId}
              isSelected={picking === null ? null : picking.includes(item.id)}
              isSelectable={item.status === 'pending'}
              onClick={() => (picking === null ? batch.select(item.id) : toggle(item.id))}
            />
          </li>
        ))}
      </ol>

      {picking === null && active && active.status === 'pending' && (
        <ScanSheetActions
          item={active}
          position={batch.activePosition}
          total={batch.total}
          singleDocument={singleDocument}
          busy={busy}
          onSplit={() => batch.split(active.id)}
          onSkip={() => batch.skip(active.id)}
          onRemove={() => batch.remove(active.id)}
        />
      )}
    </section>
  )
}
