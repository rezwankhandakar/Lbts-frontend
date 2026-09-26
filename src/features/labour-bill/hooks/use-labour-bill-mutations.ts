import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import { formatNumber } from '@/lib/format'
import { t } from '@/lib/i18n'
import type { ApiError } from '@/lib/axios'
import {
  createLabourBill,
  deleteLabourBill,
  finalizeLabourBill,
  refreshLabourBill,
  removeLabourBillLines,
  reopenLabourBill,
  scanOntoLabourBill,
  updateLabourBill,
  updateLabourBillLine,
} from '../api/labour-bill-api'
import { groupTotalsOf, lineTotal } from '../lib/labour-bill-math'
import { rowsAndChallans } from '../lib/labour-bill-meta'
import type {
  LabourBillDetail,
  LabourBillInput,
  LabourBillLinePatch,
  LabourBillLineRecord,
  LabourBillRecord,
  LabourScanResult,
} from '../types'
import { labourSignedCopyKeys } from './use-labour-bill-signed-copies'
import { labourBillKeys, reportLabourBillError } from './use-labour-bills'

/**
 * Every write on a labour bill.
 *
 * Only this module's namespace is refetched, which is the whole point of the
 * design: a labour bill claims no Trip DO row and writes no billing status, so
 * the sheet, the challans and the gate passes behind it are exactly as they
 * were and refetching them would be four requests saying nothing changed.
 */
function useInvalidateLabourBills() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: labourBillKeys.all })
}

/**
 * And the paper behind it, for the three writes that change *which challans*
 * the bill carries. Typing a cell deliberately does not: a labour amount says
 * nothing about what came back off a lorry, and refetching the copies on every
 * keystroke would be the exhaustion CLAUDE.md warns about in its own small way.
 */
function useInvalidateSignedCopies() {
  const queryClient = useQueryClient()
  return (id: string) => queryClient.invalidateQueries({ queryKey: labourSignedCopyKeys.bill(id) })
}

export function useCreateLabourBill(): UseMutationResult<
  LabourBillRecord,
  ApiError,
  LabourBillInput
> {
  const invalidate = useInvalidateLabourBills()
  return useMutation({
    mutationFn: createLabourBill,
    onSuccess: (bill) => {
      toast.success(t('labourBill.actions.opened', { bill: bill.billNumber }), {
        description: bill.periodLabel,
      })
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}

export function useUpdateLabourBill(): UseMutationResult<
  LabourBillRecord,
  ApiError,
  { id: string; input: Partial<LabourBillInput> }
> {
  const invalidate = useInvalidateLabourBills()
  return useMutation({
    mutationFn: updateLabourBill,
    onSuccess: (bill) => {
      toast.success(t('labourBill.actions.updated', { bill: bill.billNumber }))
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}

export function useDeleteLabourBill(): UseMutationResult<
  { billNumber: string; removed: number },
  ApiError,
  string
> {
  const invalidate = useInvalidateLabourBills()
  return useMutation({
    mutationFn: deleteLabourBill,
    onSuccess: (result) => {
      toast.success(t('labourBill.actions.deleted', { bill: result.billNumber }), {
        description:
          result.removed > 0
            ? t('labourBill.actions.deletedNote', {
                count: result.removed,
                n: formatNumber(result.removed),
              })
            : undefined,
      })
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}

/**
 * One barcode read.
 *
 * The answer carries the whole sheet, so the detail cache is **written** rather
 * than invalidated: an operator working through a stack scans one challan every
 * few seconds, and a refetch behind each one would put the sheet back into a
 * loading state it does not need to be in. The list is still invalidated,
 * because its totals moved.
 *
 * The toast is deliberately quiet about success — the tone beside the scanner
 * says that faster than any text — and loud about the two answers somebody has
 * to act on: a challan already on the sheet, and rows that landed with no Trip
 * DO because nobody has matched their gate pass yet.
 */
export function useScanOntoLabourBill(): UseMutationResult<
  LabourScanResult,
  ApiError,
  { id: string; code: string }
> {
  const queryClient = useQueryClient()
  const invalidateCopies = useInvalidateSignedCopies()
  return useMutation({
    mutationFn: scanOntoLabourBill,
    onSuccess: (result, variables) => {
      queryClient.setQueryData(labourBillKeys.detail(variables.id), result.detail)
      void queryClient.invalidateQueries({ queryKey: ['labour-bills', 'list'] })
      void invalidateCopies(variables.id)

      const notes: string[] = []
      if (result.skipped.length > 0) {
        notes.push(
          t('labourBill.scan.skipped', {
            count: result.skipped.length,
            n: formatNumber(result.skipped.length),
          }),
        )
      }
      // Where the rows went, and what is still waiting. A challan routinely
      // goes out on more than one gate pass, so landing in two sections is
      // ordinary and worth saying rather than worth warning about.
      if (result.csds.length > 0) {
        notes.push(t('labourBill.scan.filedUnder', { csds: result.csds.join(', ') }))
      }
      if (result.withoutTripDo.length > 0) {
        notes.push(t('labourBill.scan.waiting', { models: result.withoutTripDo.join(', ') }))
      }

      if (result.added.length === 0) {
        toast.info(
          t('labourBill.scan.alreadyOn', {
            challan: result.challanNumber,
            bill: result.billNumber,
          }),
          {
            description: result.customerName || undefined,
          },
        )
        return
      }

      toast.success(
        t('labourBill.scan.added', {
          challan: result.challanNumber,
          count: result.added.length,
          n: formatNumber(result.added.length),
        }),
        { description: [result.customerName, ...notes].filter(Boolean).join(' · ') || undefined },
      )
    },
    onError: reportLabourBillError,
  })
}

interface LinePatchArgs {
  id: string
  lineId: string
  patch: LabourBillLinePatch
}

function applyPatch(line: LabourBillLineRecord, patch: LabourBillLinePatch): LabourBillLineRecord {
  const next = { ...line, ...patch }
  return { ...next, total: lineTotal(next.labourAmount, next.floorAmount) }
}

/**
 * Rewrites one row inside whichever CSD section holds it, and re-totals that
 * section.
 *
 * The section's foot has to move with the cell — a typed amount whose section
 * total lagged a round trip behind would read as a figure that had not been
 * saved. Only the section is re-totalled; the bill's own figures come back from
 * the server, which is the arithmetic that is actually stored.
 */
function withLine(
  detail: LabourBillDetail,
  lineId: string,
  replace: (line: LabourBillLineRecord) => LabourBillLineRecord,
): LabourBillDetail {
  return {
    ...detail,
    groups: detail.groups.map((group) => {
      if (!group.lines.some((line) => line.id === lineId)) {
        return group
      }
      const lines = group.lines.map((line) => (line.id === lineId ? replace(line) : line))
      return { ...group, lines, totals: groupTotalsOf(lines) }
    }),
  }
}

/**
 * Typing into one cell.
 *
 * Optimistic, because this is a spreadsheet: somebody tabs across a row of
 * three cells faster than a free-tier instance answers, and a cell that
 * snapped back to its old value between keystrokes would be unusable. The
 * server's answer then replaces the row and the bill's totals, so the foot of
 * the sheet is the server's arithmetic rather than the browser's.
 *
 * A failure rolls the cell back and says so. It is the one write here that
 * reports nothing on success — a toast per cell, down a sheet of three hundred
 * rows, is noise.
 */
export function useUpdateLabourBillLine(): UseMutationResult<
  { bill: LabourBillRecord; line: LabourBillLineRecord },
  ApiError,
  LinePatchArgs,
  { previous: LabourBillDetail | undefined }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateLabourBillLine,
    onMutate: async (variables) => {
      const key = labourBillKeys.detail(variables.id)
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<LabourBillDetail>(key)

      if (previous) {
        queryClient.setQueryData<LabourBillDetail>(
          key,
          withLine(previous, variables.lineId, (line) => applyPatch(line, variables.patch)),
        )
      }

      return { previous }
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(labourBillKeys.detail(variables.id), context.previous)
      }
      reportLabourBillError(error)
    },
    onSuccess: (result, variables) => {
      const key = labourBillKeys.detail(variables.id)
      const current = queryClient.getQueryData<LabourBillDetail>(key)
      if (current) {
        // The placement stays the client's: the server works it out over the
        // whole bill, while the sheet numbers each CSD section on its own.
        const patched = withLine(current, result.line.id, (line) => ({
          ...result.line,
          sl: line.sl,
          slRowSpan: line.slRowSpan,
        }))
        queryClient.setQueryData<LabourBillDetail>(key, { ...patched, bill: result.bill })
      }
      void queryClient.invalidateQueries({ queryKey: ['labour-bills', 'list'] })
    },
  })
}

export function useRemoveLabourBillLines(): UseMutationResult<
  { billNumber: string; removed: number },
  ApiError,
  { id: string; lineIds: string[] }
> {
  const invalidate = useInvalidateLabourBills()
  const invalidateCopies = useInvalidateSignedCopies()
  return useMutation({
    mutationFn: removeLabourBillLines,
    onSuccess: (result, variables) => {
      void invalidateCopies(variables.id)
      toast.success(
        t('labourBill.actions.takenOff', {
          count: result.removed,
          n: formatNumber(result.removed),
          bill: result.billNumber,
        }),
        { description: t('labourBill.confirm.nothingChanges') },
      )
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}

export function useRefreshLabourBill(): UseMutationResult<
  { billNumber: string; updated: number; removed: number },
  ApiError,
  string
> {
  const invalidate = useInvalidateLabourBills()
  const invalidateCopies = useInvalidateSignedCopies()
  return useMutation({
    mutationFn: refreshLabourBill,
    onSuccess: (result, id) => {
      void invalidateCopies(id)
      const unchanged = result.updated === 0 && result.removed === 0
      toast.success(
        unchanged
          ? t('labourBill.actions.alreadyMatches', { bill: result.billNumber })
          : t('labourBill.actions.refreshed', { bill: result.billNumber }),
        {
          description: unchanged
            ? undefined
            : t('labourBill.actions.refreshedNote', {
                updated: formatNumber(result.updated),
                removed: formatNumber(result.removed),
              }),
        },
      )
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}

export function useFinalizeLabourBill(): UseMutationResult<LabourBillRecord, ApiError, string> {
  const invalidate = useInvalidateLabourBills()
  return useMutation({
    mutationFn: finalizeLabourBill,
    onSuccess: (bill) => {
      toast.success(t('labourBill.actions.finalized', { bill: bill.billNumber }), {
        description: rowsAndChallans(bill.lineCount, bill.challanCount, t),
      })
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}

export function useReopenLabourBill(): UseMutationResult<LabourBillRecord, ApiError, string> {
  const invalidate = useInvalidateLabourBills()
  return useMutation({
    mutationFn: reopenLabourBill,
    onSuccess: (bill) => {
      toast.success(t('labourBill.actions.reopened', { bill: bill.billNumber }), {
        description: t('labourBill.actions.reopenedNote'),
      })
      void invalidate()
    },
    onError: reportLabourBillError,
  })
}
