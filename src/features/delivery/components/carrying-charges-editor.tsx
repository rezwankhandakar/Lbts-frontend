import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { carryingKindMeta, taka } from '../lib/delivery-meta'
import { CARRYING_KINDS, MAX_CARRYING_ENTRIES } from '../types'
import type { CarryingChargeRecord, CarryingKind } from '../types'
import { useT } from '@/lib/i18n'
import type { Translator } from '@/lib/i18n'

interface CarryingChargesEditorProps {
  entries: CarryingChargeRecord[]
  disabled: boolean
  onChange: (entries: CarryingChargeRecord[]) => void
}

/** Base UI labels a closed trigger from these; see `assign-driver-dialog`. */
function kindOptions(t: Translator) {
  return CARRYING_KINDS.map((value) => ({
    value,
    label: carryingKindMeta(value, t).label,
  }))
}

/**
 * What was hired to get the goods the last few metres, and what it cost.
 *
 * A list rather than one box, because a difficult delivery is genuinely two
 * things — a rickshaw van for the last stretch *and* four men to carry it to
 * the fourth floor — and squashing them into one amount loses which was which
 * the moment anybody asks why a delivery cost what it did.
 *
 * **An amount of zero is allowed and is not the same as no entry.** The
 * vendor's own helper carrying two boxes up one floor is worth recording and is
 * not worth a taka; next month somebody will ask whether that address always
 * needs one, and a blank row is the only honest way to answer yes.
 */
export function CarryingChargesEditor({
  entries,
  disabled,
  onChange,
}: CarryingChargesEditorProps) {
  const t = useT()

  const set = (index: number, patch: Partial<CarryingChargeRecord>) => {
    onChange(entries.map((entry, at) => (at === index ? { ...entry, ...patch } : entry)))
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0)

  return (
    <div className="space-y-2.5">
      {entries.length > 0 && (
        <ul className="space-y-2">
          {entries.map((entry, index) => (
            <li key={index} className="rounded-lg border bg-card p-2.5">
              <div className="flex flex-wrap items-end gap-2">
                <div className="w-32 space-y-1">
                  <Label htmlFor={`carry-kind-${index}`} className="text-xs text-muted-foreground">
                    What
                  </Label>
                  <Select
                    items={kindOptions(t)}
                    value={entry.kind}
                    onValueChange={(value) =>
                      set(index, { kind: (value ?? 'Labour') as CarryingKind })
                    }
                  >
                    <SelectTrigger id={`carry-kind-${index}`} className="h-8 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {kindOptions(t).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-40 flex-1 space-y-1">
                  <Label htmlFor={`carry-what-${index}`} className="text-xs text-muted-foreground">
                    {t('delivery.extras.detailsHeading')}
                  </Label>
                  <Input
                    id={`carry-what-${index}`}
                    className="h-8 text-[13px]"
                    placeholder={carryingKindMeta(entry.kind, t).hint}
                    maxLength={200}
                    value={entry.description}
                    disabled={disabled}
                    onChange={(event) => set(index, { description: event.target.value })}
                  />
                </div>

                <div className="w-28 space-y-1">
                  <Label htmlFor={`carry-amount-${index}`} className="text-xs text-muted-foreground">
                    Taka
                  </Label>
                  <Input
                    id={`carry-amount-${index}`}
                    className="h-8 text-[13px] tabular-nums"
                    inputMode="numeric"
                    value={entry.amount === 0 ? '' : String(entry.amount)}
                    placeholder="0"
                    disabled={disabled}
                    onChange={(event) => {
                      const digits = event.target.value.replace(/\D/g, '')
                      set(index, { amount: digits ? Number.parseInt(digits, 10) : 0 })
                    }}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  aria-label={t('delivery.extras.removeCharge')}
                  disabled={disabled}
                  onClick={() => onChange(entries.filter((_, at) => at !== index))}
                >
                  <X aria-hidden />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || entries.length >= MAX_CARRYING_ENTRIES}
          onClick={() =>
            onChange([...entries, { kind: 'Labour', description: '', amount: 0 }])
          }
        >
          <Plus data-icon="inline-start" aria-hidden />
          {entries.length === 0
            ? t('delivery.extras.firstCharge')
            : t('delivery.extras.addAnother')}
        </Button>

        {entries.length > 0 && (
          <p className="ms-auto text-sm">
            <span className="text-muted-foreground">{t('delivery.extras.total')} </span>
            <span className="font-semibold tabular-nums">{taka(total)}</span>
          </p>
        )}
      </div>

      {entries.length === 0 && (
        <p className="text-xs leading-snug text-muted-foreground">
          {t('delivery.extras.chargeHint')}
        </p>
      )}
    </div>
  )
}
