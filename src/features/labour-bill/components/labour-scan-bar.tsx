import { Loader2, ScanBarcode } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LabourScanBarProps {
  onScan: (code: string) => void
  pending: boolean
}

/**
 * Where challans are read onto the sheet.
 *
 * The scanner needs nothing here at all — `useBarcodeWedge` listens page-wide
 * whenever no field has focus and no dialog is open, so an operator with a
 * stack of challans just scans, and every model on each lands as a row. What
 * the box is for is the two cases a wedge cannot cover: a barcode too creased
 * to read, and a workstation with no scanner, where the number is typed off the
 * paper instead.
 *
 * So it is deliberately not the main event. It says what is already happening,
 * and takes a typed number when the scanner cannot.
 *
 * It is also the reason the sheet's cells and this box are the only focusable
 * text inputs on the page: while either has focus the wedge stands down, which
 * is exactly right — a scan landing in the middle of a labour amount would be
 * typed into it.
 */
export function LabourScanBar({ onScan, pending }: LabourScanBarProps) {
  const t = useT()

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
    <div className="mb-5 flex flex-col gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm sm:flex-row sm:items-center">
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors',
          pending ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary',
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <ScanBarcode className="size-4" aria-hidden />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{t('labourBill.details.scanTitle')}</p>
        <p className="text-xs text-pretty text-muted-foreground" aria-live="polite">
          {pending
            ? t('labourBill.details.readingChallan')
            : t('labourBill.details.scanAnywhere')}
        </p>
      </div>

      <div className="flex shrink-0 gap-2">
        <Input
          className="h-9 w-full font-mono text-[13px] sm:w-52"
          placeholder={t('labourBill.toolbar.scanPlaceholder')}
          aria-label={t('labourBill.toolbar.scanAria')}
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
        <Button variant="outline" className="h-9 shrink-0" disabled={pending || !typed.trim()} onClick={submit}>
          {t('common.actions.add')}
        </Button>
      </div>
    </div>
  )
}
