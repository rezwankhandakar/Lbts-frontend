/**
 * The entry form as data: what a half-filled form holds, what is still missing,
 * and the body the API is sent for each kind.
 *
 * Import-free, so `node --test` loads it directly — which is also why every
 * validation message here is a **translation key** rather than a sentence:
 * there is no translator to call, and `EntryField` resolves it where it is
 * drawn, exactly as the auth forms and Gate Pass do.
 * The vocabulary the form
 * needs is declared here and re-exported from `../types`, which is the
 * direction CLAUDE.md sets for a tested file: the alias-free file owns it.
 * Mirrors `LBTS-Backend/src/modules/accounts/accounts.constants.ts` and
 * `accounts.validation.ts`. Change one, change both.
 */

export const ENTRY_KINDS = [
  'Deposit',
  'Transfer',
  'Expense',
  'Advance',
  'AdvanceReturn',
  'AdvanceAdjust',
  'TripAdvance',
  'VendorPayment',
] as const
export type EntryKind = (typeof ENTRY_KINDS)[number]

/**
 * Every transaction runs through cash — deposits, expenses, advances and their
 * returns, trip advances, vendor payments, and transfers between two cash
 * wallets. A bank or mobile wallet only ever receives a Walton payment against
 * a final bill. The server refuses anything else; the form offers only cash.
 */
export function requiresCashWallet(kind: EntryKind, againstFinalBill: boolean): boolean {
  return !(kind === 'Deposit' && againstFinalBill)
}

export const DEPOSIT_SOURCES = ['Walton Bill', 'Owner Investment', 'Loan', 'Other'] as const
export type DepositSource = (typeof DEPOSIT_SOURCES)[number]

export const MAX_ACCOUNT_AMOUNT = 1_000_000_000

export interface EntryDraft {
  kind: EntryKind
  /** `YYYY-MM-DD`. */
  date: string
  amount: number | null
  walletId: string
  toWalletId: string
  finalBillId: string
  /** A labour bill, and the CSD of it this payment settles. Both or neither. */
  labourBillId: string
  labourCsd: string
  /** What an expense, or an advance accepted as one, was for — typed, not chosen. */
  expenseName: string
  party: string
  partyPhone: string
  purpose: string
  advanceId: string
  tripId: string
  vendorId: string
  year: number
  month: number
  reference: string
  note: string
}

export type DraftErrors = Partial<Record<keyof EntryDraft, string>>

/** A blank form for a kind, dated today and in today's month, with anything the caller already knows. */
export function emptyDraft(kind: EntryKind, today: string, preset: Partial<EntryDraft> = {}): EntryDraft {
  return {
    kind,
    date: today,
    amount: null,
    walletId: '',
    toWalletId: '',
    finalBillId: '',
    labourBillId: '',
    labourCsd: '',
    expenseName: '',
    party: '',
    partyPhone: '',
    purpose: '',
    advanceId: '',
    tripId: '',
    vendorId: '',
    year: Number(today.slice(0, 4)),
    month: Number(today.slice(5, 7)),
    reference: '',
    note: '',
    ...preset,
  }
}

/** The shape of a saved entry this file needs to put one back into a form. */
export interface DraftSource {
  kind: EntryKind
  date: string
  amount: number
  wallet: { id: string } | null
  toWallet: { id: string } | null
  source: DepositSource | null
  finalBill: { id: string } | null
  labourBill: { id: string; csd: string } | null
  expenseName: string
  party: string
  partyPhone: string
  purpose: string
  advance: { id: string } | null
  trip: { id: string } | null
  vendor: { id: string } | null
  period: { year: number; month: number } | null
  reference: string
  note: string
}

export function draftFromEntry(entry: DraftSource): EntryDraft {
  return emptyDraft(entry.kind, entry.date, {
    amount: entry.amount,
    walletId: entry.wallet?.id ?? '',
    toWalletId: entry.toWallet?.id ?? '',
    finalBillId: entry.finalBill?.id ?? '',
    labourBillId: entry.labourBill?.id ?? '',
    labourCsd: entry.labourBill?.csd ?? '',
    expenseName: entry.expenseName ?? '',
    party: entry.party,
    partyPhone: entry.partyPhone,
    purpose: entry.purpose,
    advanceId: entry.advance?.id ?? '',
    tripId: entry.trip?.id ?? '',
    vendorId: entry.vendor?.id ?? '',
    ...(entry.period ? { year: entry.period.year, month: entry.period.month } : {}),
    reference: entry.reference,
    note: entry.note,
  })
}

export function usesWallet(kind: EntryKind): boolean {
  return kind !== 'AdvanceAdjust'
}

export function movesMoneyOut(kind: EntryKind): boolean {
  return kind === 'Expense' || kind === 'Advance' || kind === 'TripAdvance' || kind === 'VendorPayment' || kind === 'Transfer'
}

/**
 * What is still missing, field by field. The server checks all of it again —
 * and checks what only it can, such as how much of an advance is left — so
 * this exists to say so beside the field before a round trip rather than after.
 */
export function validateDraft(draft: EntryDraft): DraftErrors {
  const errors: DraftErrors = {}

  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) errors.date = 'accounts.validation.dateRequired'
  if (draft.amount === null || draft.amount < 1) errors.amount = 'accounts.validation.amountRequired'
  else if (draft.amount > MAX_ACCOUNT_AMOUNT) errors.amount = 'accounts.validation.amountTooLarge'
  if (usesWallet(draft.kind) && !draft.walletId) {
    errors.walletId =
      draft.kind === 'Transfer'
        ? 'accounts.validation.walletFromRequired'
        : 'accounts.validation.walletRequired'
  }

  switch (draft.kind) {
    case 'Transfer':
      if (!draft.toWalletId) errors.toWalletId = 'accounts.validation.walletToRequired'
      else if (draft.toWalletId === draft.walletId)
        errors.toWalletId = 'accounts.validation.walletDifferent'
      break
    case 'Expense':
      if (!draft.expenseName.trim()) errors.expenseName = 'accounts.validation.expenseFor'
      break
    case 'Advance':
      if (!draft.party.trim()) errors.party = 'accounts.validation.advanceGivenTo'
      break
    case 'AdvanceReturn':
      if (!draft.advanceId) errors.advanceId = 'accounts.validation.advanceReturnRequired'
      break
    case 'AdvanceAdjust':
      if (!draft.advanceId) errors.advanceId = 'accounts.validation.advanceAdjustRequired'
      if (!draft.expenseName.trim()) errors.expenseName = 'accounts.validation.expenseSpentOn'
      break
    case 'TripAdvance':
      if (!draft.tripId) errors.tripId = 'accounts.validation.tripRequired'
      break
    case 'VendorPayment':
      if (!draft.vendorId) errors.vendorId = 'accounts.validation.vendorRequired'
      break
    case 'Deposit':
      break
  }

  return errors
}

/** The body for a kind, carrying exactly the fields that kind accepts. */
export function payloadFromDraft(draft: EntryDraft): Record<string, unknown> {
  const common = {
    kind: draft.kind,
    date: draft.date,
    amount: draft.amount,
    reference: draft.reference.trim(),
    note: draft.note.trim(),
  }

  switch (draft.kind) {
    case 'Deposit':
      // A deposit is money added into cash and nothing more. It names a
      // Walton bill only when it was recorded from one — the final bill, or
      // one CSD of a month's labour bill — as a payment against it.
      return {
        ...common,
        walletId: draft.walletId,
        finalBillId: draft.finalBillId || null,
        labourBillId: draft.labourBillId || null,
        labourCsd: draft.labourBillId ? draft.labourCsd : '',
      }
    case 'Transfer':
      return { ...common, walletId: draft.walletId, toWalletId: draft.toWalletId }
    case 'Expense':
      return { ...common, walletId: draft.walletId, expenseName: draft.expenseName.trim(), party: draft.party.trim() }
    case 'Advance':
      return {
        ...common,
        walletId: draft.walletId,
        party: draft.party.trim(),
        partyPhone: draft.partyPhone.trim(),
        purpose: draft.purpose.trim(),
      }
    case 'AdvanceReturn':
      return { ...common, walletId: draft.walletId, advanceId: draft.advanceId }
    case 'AdvanceAdjust':
      return { ...common, advanceId: draft.advanceId, expenseName: draft.expenseName.trim() }
    case 'TripAdvance':
      return { ...common, walletId: draft.walletId, tripId: draft.tripId, party: draft.party.trim() }
    case 'VendorPayment':
      return {
        ...common,
        walletId: draft.walletId,
        vendorId: draft.vendorId,
        year: draft.year,
        month: draft.month,
        party: draft.party.trim(),
      }
  }
}

/**
 * A key made when the form opens, not when Save is pressed — a key made at
 * click time would be new on every click, which is the double payment it is
 * there to prevent.
 */
export function newSubmissionKey(): string {
  return globalThis.crypto.randomUUID()
}
