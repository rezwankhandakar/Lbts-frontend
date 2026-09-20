import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ReceivedCopyViewer } from '@/features/delivery/components/received-copy-viewer'
import { useReceivedCopy } from '@/features/delivery/hooks/use-received-copy'
import {
  LabourSignedCopyContext,
  useLabourBillSignedCopies,
  useLabourBillSignedCopyActions,
} from '../hooks/use-labour-bill-signed-copies'
import type { LabourSignedCopies } from '../hooks/use-labour-bill-signed-copies'
import type { LabourSignedCopyRef } from '../types'

/**
 * The signed copies behind a labour bill, and the one viewer that shows them.
 *
 * A provider rather than four more props, because the two things that want this
 * sit at opposite ends of the page: the hero, which prints the month, and the
 * SL cell of every challan, which is three components down inside the sheet and
 * again inside the phone cards. Drilling the list, `busy`, `print` and `view`
 * through `LabourBillSheet` → section → row would put four arguments on every
 * one of them to reach the last. The arrangement `EntryDialogProvider` has in
 * Accounts, down to the context living beside the hooks.
 *
 * **One viewer for the page**, mounted here. `useReceivedCopy` owns an object
 * URL it has to revoke, so a viewer per row would be one of those per challan —
 * and the copy being read is always the one somebody just pressed.
 *
 * The copies themselves belong to Delivery: this composes that module's viewer
 * and its fetch hook by import rather than copying either, the way the Delivery
 * workspace composes Vendor's driver dialog. What is the labour bill's own is
 * only *which* challans are in question.
 */
export function LabourSignedCopyProvider({ id, children }: { id: string; children: ReactNode }) {
  const query = useLabourBillSignedCopies(id)
  const actions = useLabourBillSignedCopyActions(id, query.data)
  const viewer = useReceivedCopy()
  const [subject, setSubject] = useState<{
    copy: LabourSignedCopyRef
    challanNumber: string
  } | null>(null)

  const view = useCallback(
    (copy: LabourSignedCopyRef, challanNumber: string) => {
      setSubject({ copy, challanNumber })
      void viewer.open(copy)
    },
    [viewer],
  )

  const close = useCallback(() => {
    setSubject(null)
    viewer.close()
  }, [viewer])

  const value = useMemo<LabourSignedCopies>(
    () => ({ ...actions, list: query.data, isLoading: query.isPending, view }),
    [actions, query.data, query.isPending, view],
  )

  return (
    <LabourSignedCopyContext.Provider value={value}>
      {children}

      <ReceivedCopyViewer
        copy={subject?.copy ?? null}
        challanNumber={subject?.challanNumber ?? ''}
        url={viewer.url}
        blob={viewer.blob}
        mimeType={viewer.mimeType}
        isLoading={viewer.isLoading}
        error={viewer.error}
        open={subject !== null}
        onOpenChange={(next) => !next && close()}
        onDownload={() =>
          subject && void viewer.download(subject.copy, `${subject.challanNumber}-signed-copy`)
        }
      />
    </LabourSignedCopyContext.Provider>
  )
}
