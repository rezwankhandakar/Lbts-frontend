import { CircleCheckBig, Loader2, PackageX, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'
import { cn } from '@/lib/utils'

export type ReturnChoiceValue = 'delivered' | 'partial' | 'returned'

interface ChoiceOption {
  value: ReturnChoiceValue
  labelKey: TranslationKey
  hintKey: TranslationKey
  icon: LucideIcon
  selected: string
}

const OPTIONS: ChoiceOption[] = [
  {
    value: 'delivered',
    labelKey: 'delivery.completion.allDelivered',
    hintKey: 'delivery.completion.allDeliveredHint',
    icon: CircleCheckBig,
    selected: 'border-tone-emerald/40 bg-tone-emerald/10 text-tone-emerald',
  },
  {
    value: 'partial',
    labelKey: 'delivery.completion.someCameBack',
    hintKey: 'delivery.completion.someCameBackHint',
    icon: Undo2,
    selected: 'border-tone-amber/40 bg-tone-amber/10 text-tone-amber',
  },
  {
    value: 'returned',
    labelKey: 'delivery.completion.fullReturn',
    hintKey: 'delivery.completion.fullReturnHint',
    icon: PackageX,
    selected: 'border-tone-rose/40 bg-tone-rose/10 text-tone-rose',
  },
]

interface ReturnChoiceProps {
  value: ReturnChoiceValue
  /** The choice currently being saved, so its tile can spin. */
  pending: ReturnChoiceValue | null
  disabled: boolean
  onChoose: (value: ReturnChoiceValue) => void
}

/**
 * What happened to the goods, as three tiles rather than a form.
 *
 * *All delivered* and *Full challan returned* save the moment they are pressed,
 * because each is a complete answer on its own. *Some came back* opens a
 * stepper on each product line, because that answer needs numbers.
 */
export function ReturnChoice({ value, pending, disabled, onChoose }: ReturnChoiceProps) {
  const t = useT()

  return (
    <div role="radiogroup" aria-label={t('delivery.completion.radioAria')} className="grid gap-2 sm:grid-cols-3">
      {OPTIONS.map((option) => {
        const isSelected = option.value === value
        const Icon = option.icon

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            onClick={() => onChoose(option.value)}
            className={cn(
              'flex items-start gap-2.5 rounded-lg border bg-card px-3 py-2.5 text-left transition-colors',
              'hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-60',
              isSelected && option.selected,
            )}
          >
            {pending === option.value ? (
              <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin" aria-hidden />
            ) : (
              <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            )}
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{t(option.labelKey)}</span>
              <span
                className={cn('block text-xs', isSelected ? 'opacity-80' : 'text-muted-foreground')}
              >
                {t(option.hintKey)}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
