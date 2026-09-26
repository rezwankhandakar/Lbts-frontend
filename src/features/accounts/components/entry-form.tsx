import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { AmountWordsInput } from '@/components/shared/amount-words-input'
import { Button } from '@/components/ui/button'
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSaveEntry, useSaveEntryVoucher } from '../hooks/use-accounts-mutations'
import type { EntryDialogRequest } from '../hooks/use-entry-dialog'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { kindMeta, todayString } from '../lib/accounts-meta'
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
import { VoucherField } from './voucher-field'
import type { StagedVoucher } from './voucher-field'
import { WalletField } from './wallet-field'

const WALLET_LABEL_KEYS: Partial<Record<EntryDraft['kind'], TranslationKey>> = {
  Deposit: 'accounts.form.depositInto',
  AdvanceReturn: 'accounts.form.returnedInto',
  Transfer: 'accounts.form.fromCashWallet',
}

/**
 * Recording, or correcting, one movement of money. The kind decides the
 * middle of the form; the amount, the day, the wallet and the paper trail
 * are the same for every kind and sit in the same places.
 */
export function EntryForm({ request, onDone }: { request: EntryDialogRequest; onDone: () => void }) {
  const t = useT()

  const { entry } = request
  const [draft, setDraft] = useState<EntryDraft>(() =>
    entry ? draftFromEntry(entry) : emptyDraft(request.kind, todayString(), request.preset),
  )
  const [touched, setTouched] = useState(false)
  // Made when the form opens, so a double press or a retry finds the first save.
  const [submissionKey] = useState(newSubmissionKey)
  const [voucher, setVoucher] = useState<StagedVoucher | null>(null)
  const save = useSaveEntry()
  const saveVoucher = useSaveEntryVoucher()

  const meta = kindMeta(draft.kind, t)
  const errors = touched ? validateDraft(draft) : {}
  const set = (patch: Partial<EntryDraft>) => setDraft((current) => ({ ...current, ...patch }))

  /**
   * A Walton payment — against the final bill, or against one CSD of a month's
   * labour bill. The two are one rule here for the reason `requiresCashWallet`
   * gives: which claim a payment settles decides what it is recorded against,
   * not how it is allowed to arrive.
   */
  const againstWaltonBill = draft.kind === 'Deposit' && Boolean(draft.finalBillId || draft.labourBillId)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (Object.keys(validateDraft(draft)).length > 0) {
      return
    }
    const body = payloadFromDraft(draft)
    save.mutate(
      { id: entry?.id ?? null, body: entry ? body : { ...body, submissionKey } },
      {
        /**
         * The voucher is a second call, because the object key contains the
         * entry id and so the entry has to exist first — the same ordering Gate
         * Pass's three calls have.
         *
         * The form closes either way. A failed upload has already said so
         * through the mutation's own error toast, and the entry it belongs to
         * is saved: the voucher is attached from the row menu rather than by
         * retyping an amount that is already on the books.
         */
        onSuccess: (saved) => {
          if (!voucher) {
            onDone()
            return
          }
          saveVoucher.mutate(
            { id: saved.id, file: voucher.file, fileName: voucher.file.name, pageCount: voucher.pageCount },
            { onSettled: onDone },
          )
        },
      },
    )
  }

  const busy = save.isPending || saveVoucher.isPending

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <DialogHeader className="flex-row items-start gap-3">
        <KindIcon kind={draft.kind} className="size-10" />
        <div className="min-w-0">
          <DialogTitle>
            {entry ? t('accounts.form.editTitle', { entry: entry.entryNumber }) : meta.action}
          </DialogTitle>
          <DialogDescription className="mt-1">{meta.description}</DialogDescription>
        </div>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-[1fr_11rem]">
        <AmountWordsInput
          id="entry-amount"
          label={t('accounts.form.amount')}
          value={draft.amount}
          max={MAX_ACCOUNT_AMOUNT}
          error={errors.amount}
          onChange={(amount) => set({ amount })}
        />
        <EntryField id="entry-date" label={t('accounts.form.date')} error={errors.date}>
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
          label={
            againstWaltonBill
              ? t('accounts.form.receivedInto')
              : t(WALLET_LABEL_KEYS[draft.kind] ?? 'accounts.form.paidFromCash')
          }
          cashOnly={requiresCashWallet(draft.kind, againstWaltonBill)}
          // A labour payment arrives in the bank, so the field starts there.
          // A default rather than a restriction — every wallet stays in the list.
          preferKind={draft.labourBillId ? 'Bank' : undefined}
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
          label={t('accounts.form.toCashWallet')}
          cashOnly
          value={draft.toWalletId}
          error={errors.toWalletId}
          exclude={draft.walletId}
          onChange={(toWalletId) => set({ toWalletId })}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-[11rem_1fr]">
        <EntryField id="entry-reference" label={t('accounts.form.reference')} optional>
          <Input
            id="entry-reference"
            value={draft.reference}
            maxLength={80}
            autoComplete="off"
            onChange={(event) => set({ reference: event.target.value })}
          />
        </EntryField>
        <EntryField id="entry-note" label={t('accounts.form.note')} optional>
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

      <section aria-labelledby="entry-voucher-label" className="grid gap-1.5">
        <p id="entry-voucher-label" className="text-sm font-medium">
          Voucher or invoice <span className="font-normal text-muted-foreground">(optional)</span>
        </p>
        <VoucherField
          staged={voucher}
          current={entry?.voucher ?? null}
          disabled={busy}
          onChange={setVoucher}
        />
      </section>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={busy}>
          {t('common.actions.cancel')}
        </Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          {saveVoucher.isPending
            ? t('accounts.form.uploadingVoucher')
            : entry
              ? t('common.actions.saveChanges')
              : t('accounts.form.saveKind', { kind: meta.label.toLowerCase() })}
        </Button>
      </DialogFooter>
    </form>
  )
}
