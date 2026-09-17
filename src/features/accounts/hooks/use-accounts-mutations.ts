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
  updateEntry,
  updateFinalBill,
  updateWallet,
} from '../api/accounts-api'
import { KIND_META } from '../lib/accounts-meta'
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
      toast.success(`${KIND_META[entry.kind].label} ${variables.id ? 'updated' : 'saved'}`, {
        description: `${entry.entryNumber} · ${taka(entry.amount)}`,
      })
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
      toast.success(`${result.entryNumber} deleted`)
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
      toast.success(`${wallet.name} ${variables.id ? 'updated' : 'added'}`)
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
      toast.success(result.outcome === 'deleted' ? 'Wallet deleted' : 'Wallet closed', {
        description: result.outcome === 'closed' ? 'It has entries, so its history is kept.' : undefined,
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
      toast.success(`Final bill ${variables.id ? 'updated' : 'saved'}`, {
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
      toast.success(`Final bill for ${result.label} deleted`)
      void invalidate()
    },
    onError: reportAccountsError,
  })
}
