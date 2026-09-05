import { useState } from 'react'
import { ClipboardPaste, Info, WandSparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { fieldsToFill, parseChallanText } from '../lib/paste-parse'
import type { ParsedChallanFields } from '../lib/paste-parse'

interface PasteParsePanelProps {
  /** The form's current values, so nothing already typed is offered again. */
  current: Record<string, string>
  onFill: (fields: ParsedChallanFields) => void
  disabled?: boolean
}

const FIELD_LABELS: Record<keyof ParsedChallanFields, string> = {
  customerName: 'Customer name',
  deliveryAddress: 'Delivery address',
  thana: 'Thana',
  district: 'District',
  receiverMobile: 'Receiver mobile',
  senderMobile: 'Sender mobile',
  zonePo: 'Zone / PO',
  product: 'Product',
  model: 'Model',
  qty: 'Quantity',
}

/**
 * Paste a block off the PDF and let it fill what it recognises.
 *
 * Strictly a shortcut. It reads labelled lines — "District: Dhaka" — and fills
 * only fields that are still **empty**, so it can never overwrite a value the
 * operator typed or corrected. What it found is listed before anything is
 * applied, which is the difference between a helper and a thing that silently
 * changed a form.
 *
 * It is collapsed by default because the reliable workflow is the manual one:
 * many of these challans are scans with no text layer at all, and a feature
 * that works on some templates and not others should not be the first thing on
 * the form. When it does work it saves nine fields' worth of typing.
 */
export function PasteParsePanel({ current, onFill, disabled }: PasteParsePanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [text, setText] = useState('')
  const [found, setFound] = useState<ParsedChallanFields | null>(null)

  const inspect = () => setFound(fieldsToFill(parseChallanText(text), current))

  const entries = found
    ? (Object.entries(found) as [keyof ParsedChallanFields, string][])
    : []

  if (!isOpen) {
    return (
      <div className="border-b px-4 py-2.5 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => setIsOpen(true)}
          disabled={disabled}
        >
          <ClipboardPaste data-icon="inline-start" aria-hidden />
          Paste a block from the PDF
        </Button>
      </div>
    )
  }

  return (
    <div className="border-b bg-muted/20 px-4 py-3.5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold tracking-tight">Paste and fill</h3>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
            Select the challan text in the PDF, paste it here, and anything labelled is offered for
            the fields you have not filled in yet.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="xs"
          className="shrink-0 text-muted-foreground"
          onClick={() => {
            setIsOpen(false)
            setFound(null)
            setText('')
          }}
        >
          Close
        </Button>
      </div>

      <Textarea
        value={text}
        onChange={(event) => {
          setText(event.target.value)
          setFound(null)
        }}
        rows={4}
        spellCheck={false}
        aria-label="Text pasted from the challan PDF"
        className="mt-3 min-h-24 resize-y font-mono text-xs"
        disabled={disabled}
      />

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={inspect} disabled={disabled || !text.trim()}>
          <WandSparkles data-icon="inline-start" aria-hidden />
          See what it found
        </Button>

        {found && entries.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onFill(found)
              setFound(null)
            }}
          >
            Fill {entries.length} {entries.length === 1 ? 'field' : 'fields'}
          </Button>
        )}
      </div>

      {found && (
        <div className="mt-3" aria-live="polite">
          {entries.length === 0 ? (
            <p className="flex items-start gap-2 text-xs leading-snug text-muted-foreground">
              <Info className="mt-px size-3.5 shrink-0" aria-hidden />
              Nothing new to fill. Either the fields are already filled in, or this text has no
              labels it recognises — type the values in by hand.
            </p>
          ) : (
            <ul className="space-y-1 rounded-lg border bg-card p-2.5">
              {entries.map(([field, value]) => (
                <li key={field} className="flex gap-2 text-xs">
                  <span className="w-28 shrink-0 text-muted-foreground">
                    {FIELD_LABELS[field]}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{value}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
