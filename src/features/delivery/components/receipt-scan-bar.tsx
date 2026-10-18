import { useState } from 'react'
import { Loader2, ScanBarcode } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { isChallanCode, isTripCode } from '@/lib/barcode-wedge'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface ReceiptScanBarProps {
  onScan: (code: string) => void
  pending: boolean
  /** True while the page-wide wedge listener is armed. */
  listening: boolean
}

/**
 * Where paper coming back off a lorry is read in — a signed challan copy, or
 * the trip manifest that went out with it.
 *
 * Both sheets carry a barcode and an operator holds both, so the two are told
 * apart by the shape of the code rather than by which one this bar claims to
 * be for: a challan opens the delivery it belongs to, a manifest opens its
 * trip. See `useSheetScan`.
 *
 * The scanner needs nothing here at all — `useBarcodeWedge` listens page-wide
 * whenever no field has focus and no dialog is open, so an operator working
 * through a stack of signed sheets just scans. What this panel is for is the
 * two cases a wedge cannot cover: a barcode too creased or too faint to read,
 * and a workstation with no scanner attached, where the number is typed off
 * the sheet instead. The dot says which state the listener is in — lit while
 * a scan will be heard, dim while something else has the keyboard — and the
 * sentence saying so is the label's tooltip, because the band it sits on is
 * kept to two short rows.
 *
 * Drawn on the deliveries page's brand band. The box itself is the page's own
 * background rather than glass, because a number is typed into it and has to
 * read as text in either theme.
 */
export function ReceiptScanBar({ onScan, pending, listening }: ReceiptScanBarProps) {
  const t = useT()

  const [typed, setTyped] = useState('')
  const code = typed.trim()
  const valid = isChallanCode(code) || isTripCode(code)

  const submit = () => {
    if (!code) {
      return
    }
    onScan(code)
    setTyped('')
  }

  const status = listening ? t('delivery.receipt.listening') : t('delivery.receipt.paused')

  return (
    <div className="flex min-w-0 flex-col justify-center gap-1.5 rounded-xl bg-primary-foreground/10 px-3 py-2 ring-1 ring-primary-foreground/15">
      <p className="flex min-w-0 items-center gap-1.5 text-xs font-semibold" title={status}>
        {pending ? (
          <Loader2 className="size-3.5 shrink-0 animate-spin" aria-hidden />
        ) : (
          <ScanBarcode className="size-3.5 shrink-0" aria-hidden />
        )}
        <span className="truncate">{t('delivery.receipt.prompt')}</span>
        <span
          className={cn(
            'ms-auto size-2 shrink-0 rounded-full',
            listening ? 'animate-pulse bg-success' : 'bg-primary-foreground/40',
          )}
          aria-hidden
        />
        <span className="sr-only" aria-live="polite">
          {status}
        </span>
      </p>

      <div className="flex gap-2">
        <Input
          className="h-8 min-w-0 flex-1 border-transparent bg-background font-mono text-foreground md:text-[13px] dark:bg-background"
          placeholder={t('delivery.receipt.placeholder')}
          aria-label={t('delivery.receipt.prompt')}
          value={typed}
          disabled={pending}
          onChange={(event) => setTyped(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              submit()
            }
          }}
        />
        <button
          type="button"
          disabled={pending || !valid}
          onClick={submit}
          className="inline-flex h-8 shrink-0 items-center rounded-lg bg-primary-foreground px-3.5 text-[13px] font-semibold text-primary transition outline-none hover:bg-primary-foreground/90 focus-visible:ring-3 focus-visible:ring-primary-foreground/60 disabled:pointer-events-none disabled:opacity-50"
        >
          {t('common.actions.open')}
        </button>
      </div>
    </div>
  )
}
