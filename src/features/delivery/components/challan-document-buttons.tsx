import { useState } from 'react'
import { FileCheck2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useReceivedCopy } from '../hooks/use-received-copy'
import type { TripChallanRecord } from '../types'
import { ChallanPdfDialog } from './challan-pdf-dialog'
import { ReceivedCopyViewer } from './received-copy-viewer'
import { useT } from '@/lib/i18n'

/**
 * The two papers behind one delivery, each behind its own button: the challan
 * PDF the office sent, and the copy the receiver signed.
 *
 * Two buttons rather than one "documents" menu, because they answer different
 * questions — what was ordered, and who took it — and somebody checking a
 * delivery usually wants one of them straight away. The signed-copy button is
 * drawn disabled when there is none, rather than hidden, so its absence reads
 * as "not filed yet" and not as a missing feature.
 */
export function ChallanDocumentButtons({ challan }: { challan: TripChallanRecord }) {
  const t = useT()

  const [pdfOpen, setPdfOpen] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)
  const copyFile = useReceivedCopy()
  const copy = challan.receivedCopy

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setPdfOpen(true)}>
        <FileText data-icon="inline-start" aria-hidden />
        {t('delivery.dispatch.challanPdf')}
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={!copy}
        title={copy ? undefined : t('delivery.dispatch.noSignedCopyYet')}
        onClick={() => {
          if (copy) {
            setCopyOpen(true)
            void copyFile.open(copy)
          }
        }}
      >
        <FileCheck2 data-icon="inline-start" aria-hidden />
        {t('delivery.dispatch.signedCopy')}
      </Button>

      <ChallanPdfDialog
        challanId={challan.challanId}
        challanNumber={challan.challanNumber}
        open={pdfOpen}
        onOpenChange={setPdfOpen}
      />

      <ReceivedCopyViewer
        copy={copy}
        challanNumber={challan.challanNumber}
        url={copyFile.url}
        blob={copyFile.blob}
        mimeType={copyFile.mimeType}
        isLoading={copyFile.isLoading}
        error={copyFile.error}
        open={copyOpen}
        onOpenChange={(next) => {
          setCopyOpen(next)
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
    </>
  )
}
