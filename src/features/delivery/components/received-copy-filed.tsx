import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatBytes } from '@/lib/document-file-rules'
import { countOf, useT } from '@/lib/i18n'
import type { ReceivedCopyRecord, TripChallanRecord } from '../types'
import { ReceivedCopyThumbnail } from './received-copy-thumbnail'

interface ReceivedCopyFiledProps {
  copy: ReceivedCopyRecord
  challan: TripChallanRecord
  canWrite: boolean
  busy: boolean
  onView: () => void
  onToggleReplace: () => void
  onRemove: () => void
}

/**
 * A filed signed copy: a small preview of the sheet, its name and who filed
 * it, and what can be done to it.
 *
 * The buttons take a line of their own on a phone, so the file name is not
 * squeezed to three letters between the preview and them; from `sm` they sit
 * at the end of the row.
 */
export function ReceivedCopyFiled({
  copy,
  challan,
  canWrite,
  busy,
  onView,
  onToggleReplace,
  onRemove,
}: ReceivedCopyFiledProps) {
  const t = useT()

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-tone-emerald/25 bg-tone-emerald/5 px-3 py-2.5">
      <ReceivedCopyThumbnail key={copy.uploadedAt} copy={copy} onOpen={onView} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium">{copy.originalName || t('delivery.copy.fallbackName')}</p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(copy.size)}
          {copy.pageCount ? t('delivery.copy.pagesSuffix', { pages: countOf(copy.pageCount, 'nouns.page', t) }) : ''}
          {challan.completedBy ? t('delivery.copy.filedBy', { name: challan.completedBy.name }) : ''}
        </p>
      </div>

      <div className="flex w-full items-center justify-end gap-1 sm:w-auto">
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          {t('common.actions.view')}
        </Button>
        {canWrite && (
          <>
            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={onToggleReplace}>
              {t('delivery.copy.replace')}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 text-destructive"
              aria-label={t('delivery.copy.removeAria')}
              disabled={busy}
              onClick={onRemove}
            >
              <Trash2 aria-hidden />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
