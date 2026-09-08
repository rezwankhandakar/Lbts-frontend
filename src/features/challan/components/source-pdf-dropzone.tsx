import { useRef, useState } from 'react'
import { FileUp, Loader2, ShieldCheck, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MAX_SOURCE_FILE_BYTES, MAX_SOURCE_PAGES } from '../types'

interface SourcePdfDropzoneProps {
  onOpen: (file: File) => void
  /**
   * The file this workspace is waiting for, when it is continuing a batch.
   *
   * It changes what is being asked for: not "a WhatsApp PDF" but *that* one,
   * the one whose pages are half filed. A file with a different number of
   * pages is refused rather than opened, so saying which is wanted here is
   * what stops the refusal being a surprise.
   */
  expecting?: { fileName: string; pageCount: number } | null
  isOpening: boolean
  error: string | null
  onDismissError: () => void
}

/**
 * Where a WhatsApp challan PDF comes into the workspace.
 *
 * The line about the file staying in the browser is not marketing — it is the
 * module's central rule, and an operator who does not know it will assume the
 * opposite and expect to find the file again tomorrow. Saying it here, at the
 * moment the file is chosen, is the only place it lands.
 */
export function SourcePdfDropzone({
  onOpen,
  expecting = null,
  isOpening,
  error,
  onDismissError,
}: SourcePdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const take = (file: File | undefined) => {
    if (!file) {
      return
    }
    onDismissError()
    onOpen(file)
  }

  const limitMb = Math.round(MAX_SOURCE_FILE_BYTES / (1024 * 1024))

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          take(event.dataTransfer.files?.[0])
        }}
        className={cn(
          'relative flex flex-col items-center overflow-hidden rounded-xl border-2 border-dashed bg-card px-6 py-14 text-center shadow-sm transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-border',
        )}
      >
        {/* Faint dot field, fading out downward, for depth without decoration —
            the same treatment EmptyState uses. */}
        <div
          className="pointer-events-none absolute inset-0 [background-image:radial-gradient(currentColor_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)] [background-size:22px_22px] text-border opacity-70"
          aria-hidden
        />

        <div className="relative flex flex-col items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
            {isOpening ? (
              <Loader2 className="size-6 animate-spin" aria-hidden />
            ) : (
              <FileUp className="size-6" aria-hidden />
            )}
          </div>

          <h2 className="mt-5 text-lg font-semibold tracking-tight text-balance">
            {isOpening
              ? 'Opening the PDF…'
              : expecting
                ? 'Open the same PDF again'
                : 'Open the challan PDF'}
          </h2>

          <p className="mt-2 max-w-md text-sm leading-relaxed text-pretty text-muted-foreground">
            {expecting ? (
              <>
                <span className="font-medium text-foreground">{expecting.fileName}</span> — the{' '}
                {expecting.pageCount}-page file this batch was started from. Drop it here or choose
                it from this computer.
              </>
            ) : (
              'The file Walton sent over WhatsApp, however many challans it holds. Drop it here or choose it from this computer.'
            )}
          </p>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="sr-only"
            onChange={(event) => {
              take(event.target.files?.[0])
              // Cleared so choosing the same file twice still fires a change.
              event.target.value = ''
            }}
          />

          <Button
            size="lg"
            className="mt-6"
            disabled={isOpening}
            onClick={() => inputRef.current?.click()}
          >
            <FileUp data-icon="inline-start" aria-hidden />
            Choose a PDF
          </Button>

          <p className="mt-6 text-xs text-muted-foreground/70">
            PDF up to {limitMb} MB, up to {MAX_SOURCE_PAGES} pages
          </p>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-sm leading-snug text-destructive"
        >
          <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{error}</span>
        </p>
      )}

      {/* Stated plainly, because it changes what the operator should expect:
          there is no "come back to it tomorrow" for the source file, and the
          only thing that survives is what they submit. */}
      <p className="mt-4 flex items-start gap-2.5 rounded-lg border bg-muted/30 px-3.5 py-3 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-tone-emerald" aria-hidden />
        <span>
          <span className="font-medium text-foreground">This PDF is never uploaded.</span> It is
          opened here on this computer so you can read it and mark out each challan. Only the pages
          of a challan you actually submit are sent to LBTS and stored — the rest of the file goes
          when you close this page.
        </span>
      </p>
    </div>
  )
}
