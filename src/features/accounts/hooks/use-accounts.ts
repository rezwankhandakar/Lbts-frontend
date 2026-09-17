import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { ApiError } from '@/lib/axios'
import {
  fetchAdvances,
  fetchCashSummary,
  fetchEntries,
  fetchEntry,
  fetchExpenseNames,
  fetchFinalBill,
  fetchFinalBillSlot,
  fetchFinalBills,
  fetchOverview,
  fetchProfitLoss,
  fetchReceivableFinalBills,
  fetchTripOptions,
  fetchUnits,
  fetchVendorBill,
  fetchVendorBills,
  fetchWallets,
} from '../api/accounts-api'
import type {
  AccountsOverview,
  AdvanceListParams,
  AdvanceListResult,
  CashGroup,
  CashSummary,
  EntryDetail,
  EntryListParams,
  EntryListResult,
  FinalBillDetail,
  FinalBillListParams,
  FinalBillListResult,
  FinalBillRecord,
  FinalBillSlot,
  Period,
  ProfitLossReport,
  TripOption,
  VendorBillDetail,
  VendorBillList,
  VendorBillStatusFilter,
  WalletRecord,
} from '../types'

/**
 * Every Accounts read lives under one namespace, because almost every write
 * moves several of them at once — a vendor payment changes a wallet balance,
 * the vendor's month, the cash book and the overview together.
 */
export const accountsKeys = {
  all: ['accounts'] as const,
  overview: (today: string) => ['accounts', 'overview', today] as const,
  cash: (from: string, to: string, group: CashGroup) => ['accounts', 'cash', from, to, group] as const,
  profitLoss: (from: string, to: string) => ['accounts', 'profit-loss', from, to] as const,
  wallets: ['accounts', 'wallets'] as const,
  expenseNames: ['accounts', 'expense-names'] as const,
  entries: (params: EntryListParams) => ['accounts', 'entries', params] as const,
  entry: (id: string) => ['accounts', 'entry', id] as const,
  advances: (params: AdvanceListParams) => ['accounts', 'advances', params] as const,
  vendorBills: (period: Period, status: string, search: string) =>
    ['accounts', 'vendor-bills', period.year, period.month, status, search] as const,
  vendorBill: (vendorId: string, period: Period) => ['accounts', 'vendor-bill', vendorId, period.year, period.month] as const,
  finalBills: (params: FinalBillListParams) => ['accounts', 'final-bills', params] as const,
  finalBill: (id: string) => ['accounts', 'final-bill', id] as const,
  receivable: ['accounts', 'receivable'] as const,
}

/** Type-ahead lives outside the invalidated namespace, the rule CLAUDE.md sets for suggestions. */
const tripOptionKeys = (q: string) => ['accounts-trip-options', q] as const
const slotKeys = (period: Period, unit: string) => ['accounts-final-bill-slot', period.year, period.month, unit] as const
const unitKeys = ['accounts-units'] as const

// A cold Render instance can take most of a minute to wake, so reads retry.
const COLD_START = { retry: 2 } as const

export function useAccountsOverview(today: string, enabled = true): UseQueryResult<AccountsOverview, ApiError> {
  return useQuery({ queryKey: accountsKeys.overview(today), queryFn: () => fetchOverview(today), staleTime: 20_000, enabled, ...COLD_START })
}

export function useProfitLoss(from: string, to: string): UseQueryResult<ProfitLossReport, ApiError> {
  return useQuery({
    queryKey: accountsKeys.profitLoss(from, to),
    queryFn: () => fetchProfitLoss(from, to),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled: from <= to,
    ...COLD_START,
  })
}

export function useCashSummary(from: string, to: string, group: CashGroup): UseQueryResult<CashSummary, ApiError> {
  return useQuery({
    queryKey: accountsKeys.cash(from, to, group),
    queryFn: () => fetchCashSummary(from, to, group),
    staleTime: 20_000,
    placeholderData: keepPreviousData,
    enabled: from <= to,
    ...COLD_START,
  })
}

export function useWallets(): UseQueryResult<WalletRecord[], ApiError> {
  return useQuery({ queryKey: accountsKeys.wallets, queryFn: fetchWallets, staleTime: 20_000, ...COLD_START })
}

/**
 * Names used before, for the expense name box to suggest. Read once and
 * filtered as somebody types, rather than a request per key: the list is short
 * and a suggestion that arrives late is one typed past. Inside the Accounts
 * namespace so a name saved a moment ago is offered next time.
 */
export function useExpenseNames(): UseQueryResult<string[], ApiError> {
  return useQuery({ queryKey: accountsKeys.expenseNames, queryFn: () => fetchExpenseNames(''), staleTime: 60_000, retry: 1 })
}

export function useEntries(params: EntryListParams): UseQueryResult<EntryListResult, ApiError> {
  return useQuery({
    queryKey: accountsKeys.entries(params),
    queryFn: () => fetchEntries(params),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    ...COLD_START,
  })
}

export function useEntry(id: string | null): UseQueryResult<EntryDetail, ApiError> {
  return useQuery({
    queryKey: accountsKeys.entry(id ?? ''),
    queryFn: () => fetchEntry(id ?? ''),
    enabled: Boolean(id),
    staleTime: 10_000,
    ...COLD_START,
  })
}

export function useAdvances(params: AdvanceListParams, enabled = true): UseQueryResult<AdvanceListResult, ApiError> {
  return useQuery({
    queryKey: accountsKeys.advances(params),
    queryFn: () => fetchAdvances(params),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    enabled,
    ...COLD_START,
  })
}

export function useVendorBills(
  period: Period,
  status: VendorBillStatusFilter = 'all',
  search = '',
  enabled = true,
): UseQueryResult<VendorBillList, ApiError> {
  return useQuery({
    queryKey: accountsKeys.vendorBills(period, status, search),
    queryFn: () => fetchVendorBills(period, status, search),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    enabled,
    ...COLD_START,
  })
}

export function useVendorBill(vendorId: string | undefined, period: Period): UseQueryResult<VendorBillDetail, ApiError> {
  return useQuery({
    queryKey: accountsKeys.vendorBill(vendorId ?? '', period),
    queryFn: () => fetchVendorBill(vendorId ?? '', period),
    enabled: Boolean(vendorId),
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    ...COLD_START,
  })
}

/** No retry, for the reason every type-ahead gives: a late answer is to something nobody is typing any more. */
export function useTripOptions(q: string, enabled: boolean): UseQueryResult<TripOption[], ApiError> {
  return useQuery({
    queryKey: tripOptionKeys(q),
    queryFn: () => fetchTripOptions(q),
    enabled,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useFinalBills(params: FinalBillListParams): UseQueryResult<FinalBillListResult, ApiError> {
  return useQuery({
    queryKey: accountsKeys.finalBills(params),
    queryFn: () => fetchFinalBills(params),
    staleTime: 15_000,
    placeholderData: keepPreviousData,
    ...COLD_START,
  })
}

export function useFinalBill(id: string | null): UseQueryResult<FinalBillDetail, ApiError> {
  return useQuery({
    queryKey: accountsKeys.finalBill(id ?? ''),
    queryFn: () => fetchFinalBill(id ?? ''),
    enabled: Boolean(id),
    staleTime: 10_000,
    ...COLD_START,
  })
}

export function useFinalBillSlot(period: Period, unit: string, enabled: boolean): UseQueryResult<FinalBillSlot, ApiError> {
  return useQuery({
    queryKey: slotKeys(period, unit),
    queryFn: () => fetchFinalBillSlot(period, unit),
    enabled,
    staleTime: 10_000,
    placeholderData: keepPreviousData,
    retry: false,
  })
}

export function useUnits(): UseQueryResult<string[], ApiError> {
  return useQuery({ queryKey: unitKeys, queryFn: fetchUnits, staleTime: 5 * 60_000, retry: 1 })
}

export function useReceivableFinalBills(enabled: boolean): UseQueryResult<FinalBillRecord[], ApiError> {
  return useQuery({ queryKey: accountsKeys.receivable, queryFn: fetchReceivableFinalBills, enabled, staleTime: 15_000, ...COLD_START })
}

/** The first itemised reason under the message, the treatment every module gives its errors. */
export function reportAccountsError(error: ApiError): void {
  const detail = error.errorSources?.find((source) => source.message && source.message !== error.message)
  toast.error(error.message, { description: detail ? detail.message : undefined })
}
