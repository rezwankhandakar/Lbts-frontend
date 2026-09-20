import { useState } from 'react'
import { FileQuestion, PackageCheck, Paperclip, Trash2, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useClearCopyMissing,
  useMarkCopyMissing,
  useRemoveReceivedCopy,
  useUploadReceivedCopy,
} from '../hooks/use-deliveries'
import { useReceivedCopy } from '../hooks/use-received-copy'
import { formatBytes } from '@/lib/document-file-rules'
import type { TripChallanRecord, TripRecord } from '../types'
import { CopyMissingForm } from './copy-missing-form'
import { QuickCopyScan } from './quick-copy-scan'
import { ReceivedCopyViewer } from './received-copy-viewer'

interface ReceivedCopySectionProps {
  trip: TripRecord
  challan: TripChallanRecord
  canWrite: boolean
}

/**
 * The receiver's signed copy, in whichever of four states the delivery is in:
 * filed, not needed because everything came back, declared lost, or still
 * waiting — where the scan button is the first thing on offer.
 */
export function ReceivedCopySection({ trip, challan, canWrite }: ReceivedCopySectionProps) {
  const upload = useUploadReceivedCopy()
  const remove = useRemoveReceivedCopy()
  const markMissing = useMarkCopyMissing()
  const clearMissing = useClearCopyMissing()
  const copyFile = useReceivedCopy()

  const [viewing, setViewing] = useState(false)
  const [replacing, setReplacing] = useState(false)
  const [askingMissing, setAskingMissing] = useState(false)

  const target = { tripId: trip.id, challanId: challan.challanId }
  const busy = upload.isPending || remove.isPending || markMissing.isPending || clearMissing.isPending
  const copy = challan.receivedCopy

  const fileIt = (file: File, pageCount: number | null) =>
    upload.mutate(
      { ...target, file, fileName: file.name, pageCount },
      { onSuccess: () => setReplacing(false) },
    )

  const scan = (label: string) => (
    <QuickCopyScan uploading={upload.isPending} disabled={busy} scanLabel={label} onFile={fileIt} />
  )

  return (
    <section className="space-y-3 rounded-xl border bg-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold tracking-tight">
        <PackageCheck className="size-4 text-muted-foreground" aria-hidden />
        Signed copy
      </h2>

      {copy ? (
        <>
          <div className="flex items-center gap-2.5 rounded-lg border border-tone-emerald/25 bg-tone-emerald/5 px-3 py-2.5">
            <Paperclip className="size-4 shrink-0 text-tone-emerald" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium">{copy.originalName || 'Signed copy'}</p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(copy.size)}
                {copy.pageCount ? ` · ${copy.pageCount} pages` : ''}
                {challan.completedBy ? ` · filed by ${challan.completedBy.name}` : ''}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setViewing(true)
                void copyFile.open(copy)
              }}
            >
              View
            </Button>
            {canWrite && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={busy}
                  onClick={() => setReplacing((current) => !current)}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive"
                  aria-label="Remove the signed copy"
                  disabled={busy}
                  onClick={() => remove.mutate(target)}
                >
                  <Trash2 aria-hidden />
                </Button>
              </>
            )}
          </div>
          {canWrite && replacing && scan('Scan the new copy')}
        </>
      ) : challan.completionMethod === 'Returned' ? (
        <p className="flex items-start gap-2 rounded-lg border border-tone-rose/25 bg-tone-rose/5 px-3 py-2.5 text-sm text-tone-rose">
          <Undo2 className="mt-0.5 size-4 shrink-0" aria-hidden />
          Everything came back, so no signed copy is needed. This delivery is closed.
        </p>
      ) : challan.copyMissing ? (
        <>
          <div className="flex flex-wrap items-start gap-2.5 rounded-lg border border-tone-orange/25 bg-tone-orange/5 px-3 py-2.5">
            <FileQuestion className="mt-0.5 size-4 shrink-0 text-tone-orange" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Completed without the signed copy</p>
              <p className="text-xs text-muted-foreground">
                {challan.copyMissingReason ? `“${challan.copyMissingReason}”` : 'No reason given.'}
                {challan.completedBy ? ` — ${challan.completedBy.name}` : ''}
              </p>
            </div>
            {canWrite && (
              <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => clearMissing.mutate(target)}>
                Undo
              </Button>
            )}
          </div>
          {canWrite && scan('Found it? Scan the copy')}
        </>
      ) : !canWrite ? (
        <p className="text-sm text-muted-foreground">Waiting for the signed copy.</p>
      ) : (
        <>
          {scan('Scan signed copy')}
          {askingMissing ? (
            <CopyMissingForm
              busy={markMissing.isPending}
              onCancel={() => setAskingMissing(false)}
              onConfirm={(reason) =>
                markMissing.mutate({ ...target, reason }, { onSuccess: () => setAskingMissing(false) })
              }
            />
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              disabled={busy}
              onClick={() => setAskingMissing(true)}
            >
              <FileQuestion data-icon="inline-start" aria-hidden />
              Copy missing? Complete without it
            </Button>
          )}
        </>
      )}

      <ReceivedCopyViewer
        copy={copy}
        challanNumber={challan.challanNumber}
        url={copyFile.url}
        blob={copyFile.blob}
        mimeType={copyFile.mimeType}
        isLoading={copyFile.isLoading}
        error={copyFile.error}
        open={viewing}
        onOpenChange={(next) => {
          setViewing(next)
          if (!next) {
            copyFile.close()
          }
        }}
        onDownload={() => {
          if (copy) {
            void copyFile.download(copy, `${challan.challanNumber}-signed`)
          }
        }}
      />
    </section>
  )
}
