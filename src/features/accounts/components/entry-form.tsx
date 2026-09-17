import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { AmountWordsInput } from '@/components/shared/amount-words-input'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSaveEntry } from '../hooks/use-accounts-mutations'
import type { EntryDialogRequest } from '../hooks/use-entry-dialog'
import { KIND_META, todayString } from '../lib/accounts-meta'
import {
  draftFromEntry,
  emptyDraft,
  movesMoneyOut,
  newSubmissionKey,
  payloadFromDraft,
  requiresCashWallet,
  usesWallet,
  validateDraft,
} from '../lib/entry-draft'
import { MAX_ACCOUNT_AMOUNT } from '../types'
import type { EntryDraft } from '../types'
import { KindIcon } from './account-atoms'
import { EntryField } from './entry-field'
import { EntryKindFields } from './entry-kind-fields'
import { WalletField } from './wallet-field'

const WALLET_LABEL: Partial<Record<EntryDraft['kind'], string>> = {
  Deposit: 'Deposit into cash',
  AdvanceReturn: 'Returned into cash',
  Transfer: 'From cash wallet',
}

/**
 * Recording, or correcting, one movement of money. The kind decides the
 * middle of the form; the amount, the day, the wallet and the paper trail
 * are the same for every kind and sit in the same places.
 */
export function EntryForm({ request, onDone }: { request: EntryDialogRequest; onDone: () => void }) {
  const { entry } = request
  const [draft, setDraft] = useState<EntryDraft>(() =>
    entry ? draftFromEntry(entry) : emptyDraft(request.kind, todayString(), request.preset),
  )
  const [touched, setTouched] = useState(false)
  // Made when the form opens, so a double press or a retry finds the first save.
  const [submissionKey] = useState(newSubmissionKey)
  const save = useSaveEntry()

  const meta = KIND_META[draft.kind]
  const errors = touched ? validateDraft(draft) : {}
  const set = (patch: Partial<EntryDraft>) => setDraft((current) => ({ ...current, ...patch }))

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(validateDraft(draft)).length > 0) {
      return
    }
    const body = payloadFromDraft(draft)
    save.mutate({ id: entry?.id ?? null, body: entry ? body : { ...body, submissionKey } }, { onSuccess: onDone })
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <DialogHeader className="flex-row items-start gap-3">
        <KindIcon kind={draft.kind} className="size-10" />
        <div className="min-w-0">
          <DialogTitle>{entry ? `Edit ${entry.entryNumber}` : meta.action}</DialogTitle>
          <DialogDescription className="mt-1">{meta.description}</DialogDescription>
        </div>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <AmountWordsInput
          id="entry-amount"
          label="Amount"
          value={draft.amount}
          max={MAX_ACCOUNT_AMOUNT}
          error={errors.amount}
          onChange={(amount) => set({ amount })}
        />
        <EntryField id="entry-date" label="Date" error={errors.date}>
          <Input
            id="entry-date"
            type="date"
            value={draft.date}
            max="2100-12-31"
            onChange={(event) => set({ date: event.target.value })}
          />
        </EntryField>
      </div>

      <EntryKindFields draft={draft} set={set} errors={errors} request={request} />

      {usesWallet(draft.kind) && (
        <WalletField
          id="entry-wallet"
          label={draft.kind === 'Deposit' && draft.finalBillId ? 'Received into' : (WALLET_LABEL[draft.kind] ?? 'Paid from cash')}
          cashOnly={requiresCashWallet(draft.kind, Boolean(draft.finalBillId))}
          value={draft.walletId}
          error={errors.walletId}
          outgoing={movesMoneyOut(draft.kind) ? (draft.amount ?? 0) : 0}
          ownAmount={entry && entry.wallet?.id === draft.walletId && movesMoneyOut(draft.kind) ? entry.amount : 0}
          onChange={(walletId) => set({ walletId })}
        />
      )}
      {draft.kind === 'Transfer' && (
        <WalletField
          id="entry-to-wallet"
          label="To cash wallet"
          cashOnly
          value={draft.toWalletId}
          error={errors.toWalletId}
          exclude={draft.walletId}
          onChange={(toWalletId) => set({ toWalletId })}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
        <EntryField id="entry-reference" label="Reference
        " optional>
          <Input
            id="entry-reference"
            value={draft.reference}
            maxLength={80}
            autoComplete="off"
            onChange={(event) => set({ reference: event.target.value })}
          />
        </EntryField>
        <EntryField id="entry-note" label="Note" optional>
          <Textarea
            id="entry-note"
            rows={1}
            maxLength={500}
            value={draft.note}
            onChange={(event) => set({ note: event.target.value })}
            className="min-h-8"
          />
        </EntryField>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          {entry ? 'Save changes' : `Save ${meta.label.toLowerCase()}`}
        </Button>
      </DialogFooter>
    </form>
  )
}
