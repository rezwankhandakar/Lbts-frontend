import { useCallback, useState } from 'react'
import { Check, Copy, FileSearch, Loader2 } from 'lucide-react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { Button } from '@/components/ui/button'
import { extractText } from '../lib/pdf-source'
import type { PageRange } from '../types'

interface ExtractedTextPanelProps {
  doc: PDFDocumentProxy
  range: PageRange
}

/**
 * The selectable text on this challan's pages, if there is any.
 *
 * Purely assistive, and honest about its limits. Some of these PDFs are
 * generated documents with a real text layer, and copying out of a panel is
 * quicker and more accurate than copying out of a rendered page. Many are
 * scans with no text layer at all — and for those this says so plainly rather
 * than showing an empty box that looks broken.
 *
 * There is no OCR here and the wording must never imply there is. A scan
 * without text is a page the operator reads and types, which is the workflow
 * the whole module is built around anyway.
 */
export function ExtractedTextPanel({ doc, range }: ExtractedTextPanelProps) {
  const [text, setText] = useState<string | null>(null)
  const [isReading, setIsReading] = useState(false)
  const [copied, setCopied] = useState(false)

  const read = useCallback(() => {
    setIsReading(true)
    setCopied(false)

    void extractText(doc, range.startPage, range.endPage)
      .then((value) => setText(value))
      .catch(() => setText(''))
      .finally(() => setIsReading(false))
  }, [doc, range.startPage, range.endPage])

  const copy = useCallback(() => {
    if (!text) {
      return
    }
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }, [text])

  return (
    <div className="border-t bg-muted/20 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="text-muted-foreground"
          onClick={read}
          disabled={isReading}
        >
          {isReading ? (
            <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
          ) : (
            <FileSearch data-icon="inline-start" aria-hidden />
          )}
          {text === null ? 'Read the text on these pages' : 'Read again'}
        </Button>

        {text ? (
          <Button type="button" variant="ghost" size="xs" onClick={copy}>
            {copied ? (
              <Check data-icon="inline-start" className="text-tone-emerald" aria-hidden />
            ) : (
              <Copy data-icon="inline-start" aria-hidden />
            )}
            {copied ? 'Copied' : 'Copy all'}
          </Button>
        ) : null}
      </div>

      {text !== null && (
        <div className="mt-2" aria-live="polite">
          {text.length === 0 ? (
            <p className="text-xs leading-snug text-muted-foreground">
              No selectable text on these pages — this challan is a scanned image. Read it from the
              page above and type the values in.
            </p>
          ) : (
            <textarea
              readOnly
              value={text}
              rows={6}
              aria-label="Text found on these pages"
              className="w-full resize-y rounded-lg border bg-card p-2 font-mono text-[11px] leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}
        </div>
      )}
    </div>
  )
}
