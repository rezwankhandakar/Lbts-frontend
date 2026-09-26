import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import { formatNumber } from '@/lib/format'
import { t } from '@/lib/i18n'
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
      toast.success(t('bill.actions.opened', { bill: bill.billNumber }), { description: t('bill.actions.openedNote', { unit: bill.unit, period: bill.periodLabel }) })
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
      toast.success(t('bill.actions.updated', { bill: bill.billNumber }))
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
      toast.success(t('bill.actions.deleted', { bill: result.billNumber }), {
        description:
          result.released > 0
            ? t('bill.actions.releasedNote', {
              count: result.released,
              n: formatNumber(result.released),
            })
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
        toast.info(t('bill.actions.alreadyOn', { bill: result.billNumber }))
      } else {
        toast.success(t('bill.actions.added', {
          count: result.added,
          n: formatNumber(result.added),
          bill: result.billNumber,
        }), {
          description: `${result.tripDoCount} Trip DO${result.tripDoCount === 1 ? '' : 's'}${
            result.skipped > 0 ? ` ${t('bill.actions.skippedNote', { n: formatNumber(result.skipped) })}` : ''
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
      toast.success(t('bill.actions.takenOff', {
          count: result.removed,
          n: formatNumber(result.removed),
          bill: result.billNumber,
        }), {
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
      toast.success(t('bill.actions.refreshed', { bill: result.billNumber }), {
        description: t('bill.actions.refreshedNote', {
          updated: formatNumber(result.updated),
          removed: formatNumber(result.removed),
        }),
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
      toast.success(t('bill.actions.finalized', { bill: bill.billNumber }))
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
      toast.success(t('bill.actions.reopened', { bill: bill.billNumber }), { description: 'It is a draft again.' })
      void invalidate()
    },
    onError: reportBillError,
  })
}
