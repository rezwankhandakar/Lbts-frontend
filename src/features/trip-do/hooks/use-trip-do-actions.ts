import { useCallback, useState } from 'react'
import { linkTargetForRow, linkTargetForRows } from '../lib/link-target'
import type { GatePassOption, LinkTarget, TripDoRowRecord } from '../types'
import {
  useBulkLinkTripDo,
  useLinkTripDo,
  useMergeTripDo,
  useSplitTripDo,
  useUnlinkTripDo,
} from './use-trip-do-mutations'

/**
 * Which dialog the sheet has open and on what, and the writes behind them.
 * Kept out of the page so the page reads as composition.
 */
export function useTripDoActions(onBulkLinked: () => void) {
  const [linkTarget, setLinkTarget] = useState<LinkTarget | null>(null)
  const [splitRow, setSplitRow] = useState<TripDoRowRecord | null>(null)
  const [unlinkRow, setUnlinkRow] = useState<TripDoRowRecord | null>(null)

  const link = useLinkTripDo()
  const bulk = useBulkLinkTripDo()
  const unlink = useUnlinkTripDo()
  const split = useSplitTripDo()
  const merge = useMergeTripDo()

  const openLink = useCallback((row: TripDoRowRecord) => setLinkTarget(linkTargetForRow(row)), [])
  const openBulk = useCallback(
    (rows: readonly TripDoRowRecord[]) => setLinkTarget(linkTargetForRows(rows)),
    [],
  )

  const confirmLink = (option: GatePassOption, qty: number) => {
    const target = linkTarget
    if (!target) {
      return
    }
    const close = () => setLinkTarget(null)
    const { id: gatePassId, lineKey } = option

    if (target.rowIds.length > 1) {
      bulk.mutate(
        { rowIds: target.rowIds, gatePassId, lineKey },
        { onSuccess: () => (close(), onBulkLinked()) },
      )
      return
    }

    link.mutate(
      { rowId: target.anchorRowId, gatePassId, lineKey, qty: qty < target.qty ? qty : undefined },
      { onSuccess: close },
    )
  }

  const confirmSplit = (parts: number[]) => {
    if (splitRow) {
      split.mutate({ rowId: splitRow.id, parts }, { onSuccess: () => setSplitRow(null) })
    }
  }

  const confirmUnlink = () => {
    if (unlinkRow) {
      unlink.mutate(unlinkRow.id, { onSuccess: () => setUnlinkRow(null) })
    }
  }

  return {
    linkTarget,
    splitRow,
    unlinkRow,
    openLink,
    openBulk,
    openSplit: setSplitRow,
    openUnlink: setUnlinkRow,
    merge: (row: TripDoRowRecord) => merge.mutate(row.id),
    closeLink: () => setLinkTarget(null),
    closeSplit: () => setSplitRow(null),
    closeUnlink: () => setUnlinkRow(null),
    confirmLink,
    confirmSplit,
    confirmUnlink,
    isLinking: link.isPending || bulk.isPending,
    isSplitting: split.isPending,
    isUnlinking: unlink.isPending,
  }
}
