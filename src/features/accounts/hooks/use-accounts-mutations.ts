import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UseMutationResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  createEntry,
  createFinalBill,
  createWallet,
  deleteEntry,
  deleteFinalBill,
  deleteWallet,
  removeEntryVoucher,
  updateEntry,
  updateFinalBill,
  updateWallet,
  uploadEntryVoucher,
} from '../api/accounts-api'
import { t } from '@/lib/i18n'
import { kindMeta } from '../lib/accounts-meta'
import type { EntryRecord, FinalBillInput, FinalBillRecord, WalletInput, WalletRecord } from '../types'
import { accountsKeys, reportAccountsError } from './use-accounts'

function useInvalidateAccounts() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: accountsKeys.all }),
      // The trip advance picker shows what each trip has already been advanced.
      queryClient.invalidateQueries({ queryKey: ['accounts-trip-options'] }),
      queryClient.invalidateQueries({ queryKey: ['accounts-final-bill-slot'] }),
    ])
}

const taka = (amount: number) => `৳${amount.toLocaleString('en-IN')}`

export function useSaveEntry(): UseMutationResult<
  EntryRecord,
  ApiError,
  { id: string | null; body: Record<string, unknown> }
> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, body }) => (id ? updateEntry({ id, body }) : createEntry(body)),
    onSuccess: (entry, variables) => {
      toast.success(
        variables.id
          ? t('accounts.toasts.kindUpdated', { kind: kindMeta(entry.kind, t).label })
          : t('accounts.toasts.kindSaved', { kind: kindMeta(entry.kind, t).label }),
        {
        description: `${entry.entryNumber} · ${taka(entry.amount)}`,
      })
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

/**
 * The voucher arriving, or replacing the one on record.
 *
 * Its own mutation rather than part of saving the entry, because the two are
 * two calls: the object key contains the entry id, so the entry has to exist
 * first. Toasting is left to the caller for the same reason — attaching a
 * voucher while recording an expense is one action to the operator, and two
 * toasts for one press is two too many.
 */
export function useSaveEntryVoucher(): UseMutationResult<
  EntryRecord,
  ApiError,
  { id: string; file: Blob; fileName: string; pageCount?: number | null }
> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: uploadEntryVoucher,
    onSuccess: () => {
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

export function useRemoveEntryVoucher(): UseMutationResult<EntryRecord, ApiError, string> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: removeEntryVoucher,
    onSuccess: (entry) => {
      toast.success(t('accounts.toasts.voucherRemoved', { entry: entry.entryNumber }))
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

export function useDeleteEntry(): UseMutationResult<{ id: string; entryNumber: string }, ApiError, string> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: deleteEntry,
    onSuccess: (result) => {
      toast.success(t('accounts.toasts.entryDeleted', { entry: result.entryNumber }))
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

export function useSaveWallet(): UseMutationResult<
  WalletRecord,
  ApiError,
  { id: string | null; input: Partial<WalletInput> & { isActive?: boolean } }
> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, input }) => (id ? updateWallet({ id, input }) : createWallet(input as WalletInput)),
    onSuccess: (wallet, variables) => {
      toast.success(
        variables.id
          ? t('accounts.toasts.walletUpdated', { name: wallet.name })
          : t('accounts.toasts.walletAdded', { name: wallet.name }),
      )
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

export function useDeleteWallet(): UseMutationResult<{ id: string; outcome: 'deleted' | 'closed' }, ApiError, string> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: deleteWallet,
    onSuccess: (result) => {
      toast.success(
        result.outcome === 'deleted'
          ? t('accounts.toasts.walletDeleted')
          : t('accounts.toasts.walletClosed'),
        {
          description:
            result.outcome === 'closed' ? t('accounts.toasts.walletClosedNote') : undefined,
      })
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

export function useSaveFinalBill(): UseMutationResult<
  FinalBillRecord,
  ApiError,
  { id: string | null; input: FinalBillInput }
> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, input }) => (id ? updateFinalBill({ id, input }) : createFinalBill(input)),
    onSuccess: (bill, variables) => {
      toast.success(
        variables.id
          ? t('accounts.toasts.finalBillUpdated')
          : t('accounts.toasts.finalBillSaved'),
        {
        description: `${bill.unit} · ${bill.periodLabel} · ${taka(bill.finalAmount)}`,
      })
      void invalidate()
    },
    onError: reportAccountsError,
  })
}

export function useDeleteFinalBill(): UseMutationResult<{ id: string; label: string }, ApiError, string> {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: deleteFinalBill,
    onSuccess: (result) => {
      toast.success(t('accounts.toasts.finalBillDeleted', { label: result.label }))
      void invalidate()
    },
    onError: reportAccountsError,
  })
}
