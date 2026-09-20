import { useState } from 'react'
import { Loader2, ScanBarcode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { isChallanCode, isTripCode } from '@/lib/barcode-wedge'

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
 * through a stack of signed sheets just scans. What this bar is for is the two
 * cases a wedge cannot cover: a barcode too creased or too faint to read, and a
 * workstation with no scanner attached, where the number is typed off the sheet
 * instead.
 *
 * So the box is deliberately not the main event. It says what is already
 * happening — the scanner is being listened for — and takes a typed number when
 * the scanner cannot.
 */
export function ReceiptScanBar({ onScan, pending, listening }: ReceiptScanBarProps) {
  const [typed, setTyped] = useState('')

  const submit = () => {
    const code = typed.trim()
    if (!code) {
      return
    }
    onScan(code)
    setTyped('')
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <ScanBarcode className="size-4" aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">A signed copy came back, or a manifest in hand?</p>
        <p className="text-xs text-muted-foreground">
          {listening
            ? 'Scan anywhere on this page: a challan opens the delivery it belongs to, a manifest opens its trip.'
            : 'Close what is open to scan, or type the challan number.'}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Input
          className="h-9 w-48 font-mono text-[13px]"
          placeholder="LBTS-CH-2026-000067"
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
        <Button
          variant="outline"
          className="h-9"
          disabled={pending || !(isChallanCode(typed.trim()) || isTripCode(typed.trim()))}
          onClick={submit}
        >
          Open
        </Button>
      </div>
    </div>
  )
}
