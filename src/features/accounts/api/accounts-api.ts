import { api } from '@/lib/axios'
import type {
  AccountsOverview,
  AdvanceListParams,
  AdvanceListResult,
  CashGroup,
  CashSummary,
  EntryDetail,
  EntryListParams,
  EntryListResult,
  EntryRecord,
  FinalBillDetail,
  FinalBillInput,
  FinalBillListParams,
  FinalBillListResult,
  FinalBillRecord,
  FinalBillSlot,
  PageMeta,
  Period,
  ProfitLossReport,
  TripOption,
  VendorBillDetail,
  VendorBillList,
  VendorBillStatusFilter,
  WalletInput,
  WalletRecord,
} from '../types'

interface Envelope<T> {
  success: boolean
  message: string
  data: T
  meta?: PageMeta
}

const BASE = '/accounts'

/** Empty values and `all` are dropped, which keeps the query cache key minimal. */
function compact(params: Record<string, string | number | null | undefined>): Record<string, string | number> {
  const result: Record<string, string | number> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== '' && value !== null && value !== undefined && value !== 'all') {
      result[key] = value
    }
  }
  return result
}

function withMeta<T extends object>(envelope: Envelope<T>): T & { meta: PageMeta } {
  return { ...envelope.data, meta: envelope.meta ?? { page: 1, limit: 1, total: 0, totalPages: 1 } }
}

// --- Overview and reports ---------------------------------------------------

export async function fetchOverview(today: string): Promise<AccountsOverview> {
  const { data } = await api.get<Envelope<AccountsOverview>>(`${BASE}/overview`, { params: { today } })
  return data.data
}

export async function fetchProfitLoss(from: string, to: string): Promise<ProfitLossReport> {
  const { data } = await api.get<Envelope<ProfitLossReport>>(`${BASE}/reports/profit-loss`, { params: { from, to } })
  return data.data
}

export async function fetchCashSummary(from: string, to: string, group: CashGroup): Promise<CashSummary> {
  const { data } = await api.get<Envelope<CashSummary>>(`${BASE}/cash`, { params: { from, to, group } })
  return data.data
}

// --- Wallets ----------------------------------------------------------------

export async function fetchWallets(): Promise<WalletRecord[]> {
  const { data } = await api.get<Envelope<WalletRecord[]>>(`${BASE}/wallets`)
  return data.data
}

export async function createWallet(input: WalletInput): Promise<WalletRecord> {
  const { data } = await api.post<Envelope<WalletRecord>>(`${BASE}/wallets`, input)
  return data.data
}

export async function updateWallet(args: {
  id: string
  input: Partial<WalletInput> & { isActive?: boolean }
}): Promise<WalletRecord> {
  const { data } = await api.patch<Envelope<WalletRecord>>(`${BASE}/wallets/${args.id}`, args.input)
  return data.data
}

export async function deleteWallet(id: string): Promise<{ id: string; outcome: 'deleted' | 'closed' }> {
  const { data } = await api.delete<Envelope<{ id: string; outcome: 'deleted' | 'closed' }>>(`${BASE}/wallets/${id}`)
  return data.data
}

// --- Entries ----------------------------------------------------------------

export async function fetchEntries(params: EntryListParams): Promise<EntryListResult> {
  const { data } = await api.get<Envelope<Omit<EntryListResult, 'meta'>>>(`${BASE}/entries`, {
    params: compact({ ...params }),
  })
  return withMeta(data)
}

export async function fetchEntry(id: string): Promise<EntryDetail> {
  const { data } = await api.get<Envelope<EntryDetail>>(`${BASE}/entries/${id}`)
  return data.data
}

export async function createEntry(body: Record<string, unknown>): Promise<EntryRecord> {
  const { data } = await api.post<Envelope<EntryRecord>>(`${BASE}/entries`, body)
  return data.data
}

export async function updateEntry(args: { id: string; body: Record<string, unknown> }): Promise<EntryRecord> {
  const { data } = await api.patch<Envelope<EntryRecord>>(`${BASE}/entries/${args.id}`, args.body)
  return data.data
}

export async function deleteEntry(id: string): Promise<{ id: string; entryNumber: string }> {
  const { data } = await api.delete<Envelope<{ id: string; entryNumber: string }>>(`${BASE}/entries/${id}`)
  return data.data
}

/** Expense names already used, most used first, for the type-ahead on the expense form. */
export async function fetchExpenseNames(q: string): Promise<string[]> {
  const { data } = await api.get<Envelope<string[]>>(`${BASE}/expense-names`, { params: q ? { q } : {}, timeout: 30_000 })
  return data.data
}

export async function fetchAdvances(params: AdvanceListParams): Promise<AdvanceListResult> {
  const { data } = await api.get<Envelope<Omit<AdvanceListResult, 'meta'>>>(`${BASE}/advances`, {
    params: { ...compact({ ...params }), status: params.status },
  })
  return withMeta(data)
}

// --- Vendor trip bills ------------------------------------------------------

export async function fetchVendorBills(
  period: Period,
  status: VendorBillStatusFilter,
  search: string,
): Promise<VendorBillList> {
  const { data } = await api.get<Envelope<VendorBillList>>(`${BASE}/vendor-bills`, {
    params: compact({ year: period.year, month: period.month, status, search }),
  })
  return data.data
}

export async function fetchVendorBill(vendorId: string, period: Period): Promise<VendorBillDetail> {
  const { data } = await api.get<Envelope<VendorBillDetail>>(`${BASE}/vendor-bills/${vendorId}`, {
    params: { year: period.year, month: period.month },
  })
  return data.data
}

/** Shorter than the shared timeout: it runs while somebody is typing. */
export async function fetchTripOptions(q: string): Promise<TripOption[]> {
  const { data } = await api.get<Envelope<TripOption[]>>(`${BASE}/trips`, { params: q ? { q } : {}, timeout: 30_000 })
  return data.data
}

// --- Walton final bills -----------------------------------------------------

export async function fetchFinalBills(params: FinalBillListParams): Promise<FinalBillListResult> {
  const { data } = await api.get<Envelope<Omit<FinalBillListResult, 'meta'>>>(`${BASE}/final-bills`, {
    params: compact({ ...params }),
  })
  return withMeta(data)
}

export async function fetchFinalBill(id: string): Promise<FinalBillDetail> {
  const { data } = await api.get<Envelope<FinalBillDetail>>(`${BASE}/final-bills/${id}`)
  return data.data
}

export async function fetchFinalBillSlot(period: Period, unit: string): Promise<FinalBillSlot> {
  const { data } = await api.get<Envelope<FinalBillSlot>>(`${BASE}/final-bills/slot`, {
    params: { year: period.year, month: period.month, unit },
    timeout: 30_000,
  })
  return data.data
}

export async function fetchUnits(): Promise<string[]> {
  const { data } = await api.get<Envelope<string[]>>(`${BASE}/final-bills/units`)
  return data.data
}

export async function fetchReceivableFinalBills(): Promise<FinalBillRecord[]> {
  const { data } = await api.get<Envelope<FinalBillRecord[]>>(`${BASE}/final-bills/receivable`)
  return data.data
}

export async function createFinalBill(input: FinalBillInput): Promise<FinalBillRecord> {
  const { data } = await api.post<Envelope<FinalBillRecord>>(`${BASE}/final-bills`, input)
  return data.data
}

export async function updateFinalBill(args: { id: string; input: Partial<FinalBillInput> }): Promise<FinalBillRecord> {
  const { data } = await api.patch<Envelope<FinalBillRecord>>(`${BASE}/final-bills/${args.id}`, args.input)
  return data.data
}

export async function deleteFinalBill(id: string): Promise<{ id: string; label: string }> {
  const { data } = await api.delete<Envelope<{ id: string; label: string }>>(`${BASE}/final-bills/${id}`)
  return data.data
}
