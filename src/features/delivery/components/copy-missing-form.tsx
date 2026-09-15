import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_COPY_MISSING_REASON } from '../types'

interface CopyMissingFormProps {
  busy: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

/**
 * Closing a delivery whose signed copy is lost. A deliberate second step
 * rather than a button, because a delivery closed without its paper is the one
 * somebody asks about later — so it says what it does and keeps a reason.
 */
export function CopyMissingForm({ busy, onConfirm, onCancel }: CopyMissingFormProps) {
  const [reason, setReason] = useState('')

  return (
    <div className="space-y-2.5 rounded-lg border border-tone-orange/25 bg-tone-orange/5 p-3">
      <div>
        <p className="text-sm font-medium">Complete without the signed copy?</p>
        <p className="text-xs text-muted-foreground">
          Only when the copy is lost. The delivery shows <strong>Copy missing</strong>, and scanning
          the copy later replaces that mark.
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="copy-missing-reason" className="text-xs">
          What happened? <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="copy-missing-reason"
          autoFocus
          maxLength={MAX_COPY_MISSING_REASON}
          value={reason}
          disabled={busy}
          onChange={(event) => setReason(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              onConfirm(reason.trim())
            }
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={() => onConfirm(reason.trim())}>
          {busy && <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />}
          Complete without copy
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
