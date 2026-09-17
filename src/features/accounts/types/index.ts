import type { UserRole } from '@/lib/roles'
import type { DepositSource, EntryKind } from '../lib/entry-draft'

/**
 * Accounts as the client sees it. Mirrors
 * `LBTS-Backend/src/modules/accounts/accounts.constants.ts` and the record
 * shapes its services send; the backend is the source of truth. Change one,
 * change both.
 */

export { DEPOSIT_SOURCES, ENTRY_KINDS, MAX_ACCOUNT_AMOUNT, requiresCashWallet } from '../lib/entry-draft'
export type { DepositSource, EntryDraft, EntryKind } from '../lib/entry-draft'

/** Admin, Manager and CEO read the books; Admin and Manager keep them. The API decides what happens. */
export const ACCOUNTS_READ_ROLES: readonly UserRole[] = ['Admin', 'Manager', 'CEO']
export const ACCOUNTS_WRITE_ROLES: readonly UserRole[] = ['Admin', 'Manager']

export function canReadAccounts(role: UserRole | null): boolean {
  return role !== null && ACCOUNTS_READ_ROLES.includes(role)
}

export function canWriteAccounts(role: UserRole | null): boolean {
  return role !== null && ACCOUNTS_WRITE_ROLES.includes(role)
}

export const WALLET_KINDS = ['Cash', 'Bank', 'Mobile Banking'] as const
export type WalletKind = (typeof WALLET_KINDS)[number]

export const SETTLEMENT_STATUSES = ['Open', 'Partial', 'Settled'] as const
export type SettlementStatus = (typeof SETTLEMENT_STATUSES)[number]

export const VENDOR_BILL_STATUSES = ['No Bill', 'Unpaid', 'Partial', 'Paid', 'Overpaid'] as const
export type VendorBillStatus = (typeof VENDOR_BILL_STATUSES)[number]

export type EntryDirection = 'In' | 'Out' | 'Transfer' | 'None'

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export interface Period {
  year: number
  month: number
}

export interface LabelledPeriod extends Period {
  label: string
}

export interface ActorRef {
  id: string
  name: string
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// --- Wallets ----------------------------------------------------------------

export interface WalletRef {
  id: string
  name: string
  kind: WalletKind
}

export interface WalletRecord extends WalletRef {
  accountNumber: string
  note: string
  isActive: boolean
  createdAt: string
  balance: number
  moneyIn: number
  moneyOut: number
  entryCount: number
  lastEntryDate: string | null
}

export interface WalletInput {
  name: string
  kind: WalletKind
  accountNumber: string
  note: string
}

// --- Entries ----------------------------------------------------------------

export interface EntryRecord {
  id: string
  entryNumber: string
  kind: EntryKind
  direction: EntryDirection
  date: string
  amount: number
  wallet: WalletRef | null
  toWallet: WalletRef | null
  party: string
  partyPhone: string
  reference: string
  note: string
  source: DepositSource | null
  finalBill: { id: string; label: string } | null
  /** What an expense, or an advance accepted as one, was for. Empty for every other kind. */
  expenseName: string
  purpose: string
  settledAmount: number
  outstanding: number
  settlementStatus: SettlementStatus | null
  advance: { id: string; entryNumber: string } | null
  vendor: { id: string; vendorCode: string; name: string } | null
  trip: { id: string; tripNumber: string; tripDate: string; registrationNo: string; driverName: string } | null
  period: LabelledPeriod | null
  createdBy: ActorRef | null
  createdAt: string
  updatedBy: ActorRef | null
  updatedAt: string
}

export type EntryKindFilter = 'all' | 'in' | 'out' | EntryKind

export interface EntryListParams {
  page: number
  limit: number
  kind: EntryKindFilter
  walletId: string
  vendorId: string
  expenseName: string
  from: string
  to: string
  search: string
}

export interface EntryListTotals {
  total: number
  moneyIn: number
  moneyOut: number
  openingBalance: number | null
  closingBalance: number | null
}

export interface EntryListResult {
  records: EntryRecord[]
  totals: EntryListTotals
  meta: PageMeta
}

export interface EntryDetail {
  entry: EntryRecord
  settlements: EntryRecord[]
}

export type AdvanceStatusFilter = 'all' | 'outstanding' | SettlementStatus

export interface AdvanceListParams {
  page: number
  limit: number
  status: AdvanceStatusFilter
  search: string
}

export interface AdvanceListResult {
  records: EntryRecord[]
  totals: { total: number; totalAmount: number; settledAmount: number; outstanding: number; openCount: number }
  meta: PageMeta
}

// --- Vendor trip bills ------------------------------------------------------

export interface VendorRef {
  id: string
  vendorCode: string
  name: string
  photoUrl: string | null
  status: string
}

export interface VendorMonthFigures {
  totalBill: number
  advance: number
  paid: number
  tripCount: number
  tripRent: number
  labourBill: number
  blankBills: number
  due: number
  status: VendorBillStatus
}

export interface VendorBillRow extends VendorMonthFigures {
  vendor: VendorRef
  paymentCount: number
  lastPaymentDate: string | null
}

export type VendorBillStatusFilter = 'all' | 'due' | VendorBillStatus

export interface VendorBillList {
  period: LabelledPeriod
  rows: VendorBillRow[]
  totals: {
    vendors: number
    tripCount: number
    totalBill: number
    advance: number
    paid: number
    due: number
    overpaid: number
    blankBills: number
  }
}

export interface VendorBillChallan {
  challanNumber: string
  slNumber: number
  district: string
  thana: string
}

export interface VendorBillTrip {
  id: string
  tripNumber: string
  tripDate: string
  status: 'Open' | 'Completed'
  registrationNo: string
  driverName: string
  challanCount: number
  totalQty: number
  challans: VendorBillChallan[]
  tripRent: number | null
  labourBill: number | null
  bill: number
  advance: number
  net: number
}

export interface VendorMonthHistory extends VendorMonthFigures, LabelledPeriod {}

export interface VendorBillDetail {
  vendor: VendorRef & { mobile: string }
  period: LabelledPeriod
  figures: VendorMonthFigures
  trips: VendorBillTrip[]
  advances: EntryRecord[]
  payments: EntryRecord[]
  history: VendorMonthHistory[]
  allTime: VendorMonthFigures
}

export interface TripOption {
  id: string
  tripNumber: string
  tripDate: string
  status: 'Open' | 'Completed'
  vendor: { id: string; vendorCode: string; name: string }
  registrationNo: string
  driverName: string
  tripRent: number | null
  labourBill: number | null
  bill: number
  advance: number
}

// --- Walton final bills -----------------------------------------------------

export interface ExcelBillRef {
  id: string
  billNumber: string
  status: 'Draft' | 'Finalized'
  totalAmount: number
}

export interface FinalBillRecord {
  id: string
  year: number
  month: number
  periodLabel: string
  unit: string
  finalAmount: number
  referenceNo: string
  receivedOn: string | null
  note: string
  receivedAmount: number
  outstanding: number
  paymentStatus: SettlementStatus
  excelBills: ExcelBillRef[]
  submittedAmount: number
  difference: number
  createdBy: ActorRef | null
  createdAt: string
  updatedBy: ActorRef | null
  updatedAt: string
}

export interface FinalBillInput {
  year: number
  month: number
  unit: string
  finalAmount: number
  referenceNo: string
  receivedOn: string | null
  note: string
}

export interface FinalBillListParams {
  page: number
  limit: number
  year: number | null
  unit: string
  status: 'all' | SettlementStatus
}

export interface FinalBillListResult {
  records: FinalBillRecord[]
  totals: { total: number; finalAmount: number; receivedAmount: number; outstanding: number; submittedAmount: number }
  meta: PageMeta
}

export interface FinalBillSlot {
  excelBills: ExcelBillRef[]
  submittedAmount: number
  existing: FinalBillRecord | null
}

export interface FinalBillDetail {
  bill: FinalBillRecord
  receipts: EntryRecord[]
}

// --- Reports ----------------------------------------------------------------

export interface ProfitLossMonth extends LabelledPeriod {
  income: number
  tripRent: number
  labourBill: number
  officeExpense: number
  totalCost: number
  profit: number
  margin: number | null
  tripCount: number
  blankBills: number
  finalBillCount: number
  pendingUnits: string[]
  pendingSubmitted: number
}

export interface ProfitLossReport {
  from: LabelledPeriod
  to: LabelledPeriod
  months: ProfitLossMonth[]
  summary: Omit<ProfitLossMonth, keyof LabelledPeriod | 'pendingUnits'> & { pendingSlots: number }
  incomeByUnit: { unit: string; finalAmount: number; submittedAmount: number; difference: number; months: number }[]
  expenseByName: { name: string; amount: number; share: number }[]
  costByVendor: {
    vendorId: string
    vendorCode: string
    name: string
    tripCount: number
    tripRent: number
    labourBill: number
    total: number
  }[]
  pendingFinalBills: (LabelledPeriod & { unit: string; submittedAmount: number; excelBillCount: number })[]
}

// --- Cash --------------------------------------------------------------------

export interface CashFigures {
  deposits: number
  transfersIn: number
  advanceReturns: number
  moneyIn: number
  vendorPayments: number
  tripAdvances: number
  advances: number
  /** Advances given less the cash returned against them. */
  advancesNet: number
  expenses: number
  transfersOut: number
  moneyOut: number
  net: number
}

export type CashGroup = 'month' | 'year'

export interface CashSummaryRow extends CashFigures {
  key: string
  label: string
  year: number
  month: number | null
}

export interface CashSummary {
  wallets: WalletRecord[]
  balance: number
  allTime: CashFigures
  range: { from: LabelledPeriod; to: LabelledPeriod; group: CashGroup; rows: CashSummaryRow[]; totals: CashFigures }
}

export interface AccountsOverview {
  today: string
  period: LabelledPeriod
  /** Cash wallets only — bank and mobile balances are not added in. */
  cash: {
    wallets: WalletRecord[]
    balance: number
    allTime: CashFigures
    thisMonth: CashFigures
  }
  vendorDue: { total: number; vendors: number; blankBills: number }
  advances: { outstanding: number; count: number }
  receivable: { outstanding: number; count: number }
  profitLoss: ProfitLossMonth
  trend: ProfitLossMonth[]
  pendingFinalBills: number
  recentEntries: EntryRecord[]
}
