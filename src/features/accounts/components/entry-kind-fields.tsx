import { Input } from '@/components/ui/input'
import type { EntryDialogRequest } from '../hooks/use-entry-dialog'
import type { DraftErrors } from '../lib/entry-draft'
import type { EntryDraft } from '../types'
import { AdvanceField } from './advance-field'
import { DepositFields } from './deposit-fields'
import { EntryField } from './entry-field'
import { ExpenseNameField } from './expense-name-field'
import { TripField } from './trip-field'
import { VendorPaymentFields } from './vendor-payment-fields'
import { useT } from '@/lib/i18n'

export interface KindFieldsProps {
  draft: EntryDraft
  set: (patch: Partial<EntryDraft>) => void
  errors: DraftErrors
  request: EntryDialogRequest
}

function PartyInput({
  label,
  value,
  optional = true,
  error,
  onChange,
}: {
  label: string
  value: string
  optional?: boolean
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <EntryField id="entry-party" label={label} optional={optional} error={error}>
      <Input
        id="entry-party"
        value={value}
        maxLength={120}
        autoComplete="off"
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
    </EntryField>
  )
}

/** The middle of the entry form: what only this kind of entry asks. */
export function EntryKindFields(props: KindFieldsProps) {
  const t = useT()

  const { draft, set, errors } = props

  switch (draft.kind) {
    case 'Deposit':
      return <DepositFields {...props} />

    case 'Transfer':
      return null

    case 'Expense':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <ExpenseNameField value={draft.expenseName} error={errors.expenseName} onChange={(expenseName) => set({ expenseName })} />
          <PartyInput label={t('accounts.kindFields.paidTo')} value={draft.party} onChange={(party) => set({ party })} />
        </div>
      )

    case 'Advance':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <PartyInput
            label={t('accounts.kindFields.givenTo')}
            optional={false}
            value={draft.party}
            error={errors.party}
            onChange={(party) => set({ party })}
          />
          <EntryField id="entry-phone" label={t('accounts.kindFields.theirMobile')} optional>
            <Input
              id="entry-phone"
              inputMode="tel"
              value={draft.partyPhone}
              maxLength={32}
              autoComplete="off"
              onChange={(event) => set({ partyPhone: event.target.value })}
            />
          </EntryField>
          <EntryField
            id="entry-purpose"
            label={t('accounts.kindFields.whatFor')}
            optional
            className="sm:col-span-2"
          >
            <Input
              id="entry-purpose"
              value={draft.purpose}
              maxLength={200}
              autoComplete="off"
              onChange={(event) => set({ purpose: event.target.value })}
            />
          </EntryField>
        </div>
      )

    case 'AdvanceReturn':
      return <AdvanceField {...props} />

    case 'AdvanceAdjust':
      return (
        <div className="grid gap-4">
          <AdvanceField {...props} />
          <ExpenseNameField
            label={t('accounts.kindFields.spentOn')}
            value={draft.expenseName}
            error={errors.expenseName}
            onChange={(expenseName) => set({ expenseName })}
          />
        </div>
      )

    case 'TripAdvance':
      return (
        <div className="grid gap-4">
          <TripField {...props} />
          <PartyInput label={t('accounts.kindFields.receivedBy')} value={draft.party} onChange={(party) => set({ party })} />
        </div>
      )

    case 'VendorPayment':
      return (
        <div className="grid gap-4">
          <VendorPaymentFields {...props} />
          <PartyInput label={t('accounts.kindFields.receivedBy')} value={draft.party} onChange={(party) => set({ party })} />
        </div>
      )
  }
}
