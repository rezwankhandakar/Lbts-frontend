import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useSaveWallet } from '../hooks/use-accounts-mutations'
import { WALLET_KIND_LABEL } from '../lib/accounts-meta'
import { WALLET_KINDS } from '../types'
import type { WalletKind, WalletRecord } from '../types'
import { EntryField } from './entry-field'

interface WalletDialogProps {
  open: boolean
  wallet: WalletRecord | null
  onOpenChange: (open: boolean) => void
}

export function WalletDialog({ open, wallet, onOpenChange }: WalletDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">{open && <WalletForm wallet={wallet} onDone={() => onOpenChange(false)} />}</DialogContent>
    </Dialog>
  )
}

/** Adding or renaming a wallet. Its balance is not a field: it is what its entries add up to. */
function WalletForm({ wallet, onDone }: { wallet: WalletRecord | null; onDone: () => void }) {
  const [name, setName] = useState(wallet?.name ?? '')
  const [kind, setKind] = useState<WalletKind>(wallet?.kind ?? 'Cash')
  const [accountNumber, setAccountNumber] = useState(wallet?.accountNumber ?? '')
  const [note, setNote] = useState(wallet?.note ?? '')
  const [touched, setTouched] = useState(false)
  const save = useSaveWallet()
  const nameError = touched && !name.trim() ? 'Name the wallet.' : undefined

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!name.trim()) return
    save.mutate(
      { id: wallet?.id ?? null, input: { name: name.trim(), kind, accountNumber: accountNumber.trim(), note: note.trim() } },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-5" noValidate>
      <DialogHeader>
        <DialogTitle>{wallet ? `Edit ${wallet.name}` : 'Add a wallet'}</DialogTitle>
        <DialogDescription>
          {wallet
            ? 'Rename it or change its details. Its balance comes from its entries.'
            : kind === 'Cash'
              ? 'A cash box. Every transaction runs through cash — record its opening balance afterwards with Add money.'
              : 'A bank account or mobile banking number. It only receives Walton bill payments; nothing is spent from it or moved into or out of it.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label id="wallet-kind-label">Kind</Label>
        <div role="radiogroup" aria-labelledby="wallet-kind-label" className="grid grid-cols-3 gap-1.5">
          {WALLET_KINDS.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={kind === option}
              onClick={() => setKind(option)}
              className={cn(
                'rounded-lg border px-2 py-2 text-[13px] font-medium transition',
                kind === option ? 'border-primary bg-primary/10 text-primary' : 'bg-card text-muted-foreground hover:border-primary/40',
              )}
            >
              {WALLET_KIND_LABEL[option]}
            </button>
          ))}
        </div>
      </div>

      <EntryField id="wallet-name" label="Name" error={nameError}>
        <Input id="wallet-name" value={name} maxLength={80} autoComplete="off" aria-invalid={Boolean(nameError)} onChange={(event) => setName(event.target.value)} />
      </EntryField>
      <EntryField id="wallet-account" label={kind === 'Cash' ? 'Kept by' : 'Account number'} optional>
        <Input id="wallet-account" value={accountNumber} maxLength={60} autoComplete="off" onChange={(event) => setAccountNumber(event.target.value)} />
      </EntryField>
      <EntryField id="wallet-note" label="Note" optional>
        <Input id="wallet-note" value={note} maxLength={300} autoComplete="off" onChange={(event) => setNote(event.target.value)} />
      </EntryField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending}>
          {save.isPending && <Loader2 className="animate-spin" data-icon="inline-start" aria-hidden />}
          {wallet ? 'Save changes' : 'Add wallet'}
        </Button>
      </DialogFooter>
    </form>
  )
}
