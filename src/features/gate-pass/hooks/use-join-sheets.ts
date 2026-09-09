import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { MergeDocumentsError, joinDocuments } from '../lib/merge-documents'
import type { ScanBatch } from './use-scan-batch'

/**
 * Joining staged sheets into one gate pass document.
 *
 * A hook rather than a handler inside the scanner panel, because two different
 * places need the same guarantee. The panel offers it as something an operator
 * chooses; the workspace needs to know whether the stack is one document yet,
 * because correcting a gate pass writes exactly one. Both go through here, so
 * neither can come to disagree with the other about what a join is or what it
 * says when it fails.
 *
 * The merge itself is `lib/merge-documents.ts`; this owns the busy flag and
 * what the operator is told.
 */
export interface JoinSheets {
  isJoining: boolean
  /**
   * Joins the named sheets, in the order they were scanned.
   *
   * Resolves true when the stack now holds one document for them — including
   * when there was nothing to do — and false when the merge was refused, which
   * is a state the caller must not save over.
   */
  join: (ids: string[]) => Promise<boolean>
}

export function useJoinSheets(batch: ScanBatch): JoinSheets {
  const [isJoining, setIsJoining] = useState(false)

  const join = useCallback(
    async (ids: string[]): Promise<boolean> => {
      const sheets = batch.items.filter((item) => ids.includes(item.id))

      if (sheets.length < 2) {
        return true
      }

      setIsJoining(true)

      try {
        const joined = await joinDocuments(
          sheets.map((sheet) => sheet.file),
          `gate-pass-${sheets.length}-sheets`,
        )

        batch.join(ids, joined)

        toast.success(`${sheets.length} sheets joined`, {
          description: `They are now one ${joined.pageCount}-page document, filed as one gate pass.`,
        })

        return true
      } catch (error) {
        toast.error(
          error instanceof MergeDocumentsError
            ? error.message
            : 'Those sheets could not be joined. Remove one, or scan the challan as a single PDF.',
        )
        return false
      } finally {
        setIsJoining(false)
      }
    },
    [batch],
  )

  return { isJoining, join }
}
