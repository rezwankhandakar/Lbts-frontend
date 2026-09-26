import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MAX_COPY_MISSING_REASON } from '../types'
import { useT } from '@/lib/i18n'

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
  const t = useT()

  const [reason, setReason] = useState('')

  return (
    <div className="space-y-2.5 rounded-lg border border-tone-orange/25 bg-tone-orange/5 p-3">
      <div>
        <p className="text-sm font-medium">{t('delivery.copy.missingTitle')}</p>
        <p className="text-xs text-muted-foreground">
          {t('delivery.copy.missingHint', { badge: t('delivery.copy.missingBadge') })}
        </p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="copy-missing-reason" className="text-xs">
          {t('delivery.copy.whatHappened')}{' '}
          <span className="text-muted-foreground">{t('common.labels.optionalSuffix')}</span>
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
          {t('delivery.copy.completeWithout')}
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onCancel}>
          {t('common.actions.cancel')}
        </Button>
      </div>
    </div>
  )
}
