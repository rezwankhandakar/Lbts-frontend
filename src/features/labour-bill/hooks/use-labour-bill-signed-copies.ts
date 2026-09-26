import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import { printDocument } from '@/lib/print-document'
import { saveBlob } from '@/lib/save-blob'
import { downloadLabourBillSignedCopies, fetchLabourBillSignedCopies } from '../api/labour-bill-api'
import type { LabourSignedCopyChallan, LabourSignedCopyList, LabourSignedCopyRef } from '../types'
import { reportLabourBillError } from './use-labour-bills'

/**
 * Deliberately outside `['labour-bills', …]`, the rule CLAUDE.md sets for keys
 * a module's writes should not drag along: typing a labour amount invalidates
 * that namespace, and what paper has come back off a lorry has nothing to do
 * with what four men were paid. Only the writes that change *which challans
 * are on the bill* refresh this, and they say so where they do it.
 */
export const labourSignedCopyKeys = {
  bill: (id: string) => ['labour-bill-signed-copies', id] as const,
}

export function useLabourBillSignedCopies(
  id: string | undefined,
): UseQueryResult<LabourSignedCopyList, ApiError> {
  return useQuery({
    queryKey: labourSignedCopyKeys.bill(id ?? ''),
    queryFn: () => fetchLabourBillSignedCopies(id ?? ''),
    enabled: Boolean(id),
    staleTime: 30_000,
    // A cold Render instance can take most of a minute to wake.
    retry: 2,
  })
}

export interface LabourSignedCopyActions {
  /** The bill's challans by id, for the row that wants only its own. */
  byChallan: Map<string, LabourSignedCopyChallan>
  /** The section key currently being assembled, `''` included; null while idle. */
  busy: string | null
  isBusy: boolean
  print: (csd?: string) => void
  download: (csd?: string) => void
}

/**
 * Printing and downloading the assembled PDF.
 *
 * Both fetch the same bytes from the same endpoint, because a second assembly
 * path is how the printed copy and the filed one come to disagree about what a
 * bill's paper is — the rule the challan batch keeps for its own download.
 *
 * The object URL a print is handed belongs here. It is **not** revoked when
 * `printDocument` returns: the browser's print dialog is still reading from it,
 * and revoking under an open dialog prints a blank sheet. Each print therefore
 * revokes the one before it, and the last is revoked on unmount — the same
 * arrangement `useReceivedCopy` has for the copy it opens.
 */
export function useLabourBillSignedCopyActions(
  id: string,
  list: LabourSignedCopyList | undefined,
): LabourSignedCopyActions {
  const [busy, setBusy] = useState<string | null>(null)
  const urlRef = useRef<string | null>(null)

  const byChallan = useMemo(() => {
    const map = new Map<string, LabourSignedCopyChallan>()
    for (const section of list?.sections ?? []) {
      for (const challan of section.challans) {
        // A challan billed under two CSDs carries the same copies in both, so
        // the first entry answers for the row wherever it is drawn.
        if (!map.has(challan.challanId)) {
          map.set(challan.challanId, challan)
        }
      }
    }
    return map
  }, [list])

  const revoke = useCallback(() => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current)
      urlRef.current = null
    }
  }, [])

  useEffect(() => revoke, [revoke])

  const run = useCallback(
    (csd: string | undefined, then: (blob: Blob, filename: string) => void, done: string) => {
      // `'all'` cannot collide with a section: a key is `comparisonKey` of the
      // CSD, so it is upper case or — for the pending section — empty.
      const marker = csd ?? 'all'
      if (busy !== null) {
        return
      }

      setBusy(marker)
      const toastId = toast.loading(t('labourBill.copies.collectingToast'))

      void downloadLabourBillSignedCopies({ id, csd })
        .then(({ blob, filename }) => {
          then(blob, filename)
          toast.success(done, { id: toastId, description: filename })
        })
        .catch((error: ApiError) => {
          toast.dismiss(toastId)
          reportLabourBillError(error)
        })
        .finally(() => setBusy(null))
    },
    [busy, id],
  )

  const print = useCallback(
    (csd?: string) =>
      run(
        csd,
        (blob) => {
          revoke()
          const url = URL.createObjectURL(blob)
          urlRef.current = url
          printDocument(url, 'application/pdf')
        },
        t('labourBill.copies.printed'),
      ),
    [revoke, run],
  )

  const download = useCallback(
    (csd?: string) => run(csd, (blob, filename) => saveBlob(blob, filename), t('labourBill.copies.downloaded')),
    [run],
  )

  return { byChallan, busy, isBusy: busy !== null, print, download }
}

/**
 * What a component inside the bill's page gets: the read, the two assembly
 * actions, and the one viewer's opener.
 *
 * The context lives beside the hooks rather than in the provider's own file,
 * the arrangement `use-entry-dialog.ts` has in Accounts — a `.tsx` exporting a
 * component and a hook together is what stops fast refresh working.
 */
export interface LabourSignedCopies extends LabourSignedCopyActions {
  /** Undefined while the first read is in flight, or if it failed. */
  list: LabourSignedCopyList | undefined
  isLoading: boolean
  /** Opens one copy full screen, where it can be read, printed or saved on its own. */
  view: (copy: LabourSignedCopyRef, challanNumber: string) => void
}

export const LabourSignedCopyContext = createContext<LabourSignedCopies | null>(null)

/** The signed copies behind this bill. Only available inside `LabourSignedCopyProvider`. */
export function useLabourSignedCopies(): LabourSignedCopies {
  const context = useContext(LabourSignedCopyContext)
  if (!context) {
    throw new Error('useLabourSignedCopies must be used inside LabourSignedCopyProvider.')
  }
  return context
}
