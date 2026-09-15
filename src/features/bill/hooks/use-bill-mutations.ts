import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  addBillLines,
  createBill,
  deleteBill,
  finalizeBill,
  refreshBill,
  removeBillLines,
  reopenBill,
  updateBill,
} from '../api/bill-api'
import type { AddBillLinesResult, BillInput, BillRecord } from '../types'
import { billKeys, reportBillError } from './use-bills'

/**
 * A bill write moves more than the bill. Adding or removing rows changes the
 * Bill column on the Trip DO sheet and the billing status on every challan and
 * gate pass behind them, so all four namespaces are refetched together —
 * refetching one would leave the app telling two stories.
 */
function useInvalidateBilling() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [billKeys.all, ['trip-do'], ['challans'], ['gate-passes']].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
}

export function useCreateBill(): UseMutationResult<BillRecord, ApiError, BillInput> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: createBill,
    onSuccess: (bill) => {
      toast.success(`${bill.billNumber} opened`, { description: `Unit ${bill.unit} · ${bill.periodLabel}` })
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useUpdateBill(): UseMutationResult<
  BillRecord,
  ApiError,
  { id: string; input: Partial<BillInput> }
> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: updateBill,
    onSuccess: (bill) => {
      toast.success(`${bill.billNumber} updated`)
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useDeleteBill(): UseMutationResult<{ billNumber: string; released: number }, ApiError, string> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: deleteBill,
    onSuccess: (result) => {
      toast.success(`${result.billNumber} deleted`, {
        description:
          result.released > 0
            ? `${result.released} Trip DO ${result.released === 1 ? 'row is' : 'rows are'} free to bill again.`
            : undefined,
      })
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useAddBillLines(): UseMutationResult<
  AddBillLinesResult,
  ApiError,
  { id: string; rowIds: string[] }
> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: addBillLines,
    onSuccess: (result) => {
      if (result.added === 0) {
        toast.info(`Already on ${result.billNumber}`)
      } else {
        toast.success(`${result.added} ${result.added === 1 ? 'row' : 'rows'} added to ${result.billNumber}`, {
          description: `${result.tripDoCount} Trip DO${result.tripDoCount === 1 ? '' : 's'}${
            result.skipped > 0 ? ` · ${result.skipped} already on the bill` : ''
          }`,
        })
      }
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useRemoveBillLines(): UseMutationResult<
  { billNumber: string; removed: number },
  ApiError,
  { id: string; lineIds: string[] }
> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: removeBillLines,
    onSuccess: (result) => {
      toast.success(`${result.removed} ${result.removed === 1 ? 'row' : 'rows'} taken off ${result.billNumber}`, {
        description: 'They are free to bill again.',
      })
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useRefreshBill(): UseMutationResult<
  { billNumber: string; updated: number; removed: number },
  ApiError,
  string
> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: refreshBill,
    onSuccess: (result) => {
      toast.success(`${result.billNumber} refreshed from the Trip DO sheet`, {
        description: `${result.updated} updated · ${result.removed} taken off`,
      })
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useFinalizeBill(): UseMutationResult<BillRecord, ApiError, string> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: finalizeBill,
    onSuccess: (bill) => {
      toast.success(`${bill.billNumber} finalized`)
      void invalidate()
    },
    onError: reportBillError,
  })
}

export function useReopenBill(): UseMutationResult<BillRecord, ApiError, string> {
  const invalidate = useInvalidateBilling()
  return useMutation({
    mutationFn: reopenBill,
    onSuccess: (bill) => {
      toast.success(`${bill.billNumber} reopened`, { description: 'It is a draft again.' })
      void invalidate()
    },
    onError: reportBillError,
  })
}
