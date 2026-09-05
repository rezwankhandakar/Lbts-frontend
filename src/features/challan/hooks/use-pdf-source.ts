import { useCallback, useEffect, useRef, useState } from 'react'
import { SourcePdfError, openSourcePdf } from '../lib/pdf-source'
import type { SourcePdf } from '../lib/pdf-source'

export interface PdfSourceController {
  source: SourcePdf | null
  isOpening: boolean
  error: string | null
  open: (file: File) => void
  close: () => void
  clearError: () => void
}

/**
 * Holds the temporary source PDF for the workspace.
 *
 * This hook is where the module's central rule lives on the client: the
 * WhatsApp file goes into memory here and nowhere else. There is no upload, no
 * cache, no IndexedDB and no query key holding it — closing the tab is what
 * disposes of it, which is exactly what the business asked for.
 *
 * pdf.js keeps a worker and a parsed document per file, so the previous one is
 * destroyed whenever a new file is opened and when the workspace unmounts.
 * Without that, opening four PDFs in a session leaves four workers running and
 * four documents pinned.
 */
export function usePdfSource(): PdfSourceController {
  const [source, setSource] = useState<SourcePdf | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * The live document, read on unmount. State cannot be read from a cleanup
   * that runs after the component is gone, and a leaked worker is not
   * something a reload fixes.
   */
  const current = useRef<SourcePdf | null>(null)

  const replace = useCallback((next: SourcePdf | null) => {
    const previous = current.current
    current.current = next
    setSource(next)

    if (previous && previous !== next) {
      void previous.doc.loadingTask.destroy()
    }
  }, [])

  const open = useCallback(
    (file: File) => {
      setIsOpening(true)
      setError(null)

      void openSourcePdf(file)
        .then((next) => replace(next))
        .catch((failure: unknown) => {
          setError(
            failure instanceof SourcePdfError
              ? failure.message
              : 'That PDF could not be opened. Try the file again.',
          )
        })
        .finally(() => setIsOpening(false))
    },
    [replace],
  )

  const close = useCallback(() => {
    replace(null)
    setError(null)
  }, [replace])

  useEffect(() => {
    return () => {
      const held = current.current
      current.current = null
      if (held) {
        void held.doc.loadingTask.destroy()
      }
    }
  }, [])

  return {
    source,
    isOpening,
    error,
    open,
    close,
    clearError: useCallback(() => setError(null), []),
  }
}
