import { PackageSearch, TriangleAlert } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import type { GatePassOption } from '../types'
import { GatePassOptionCard } from './gate-pass-option-card'
import { useT } from '@/lib/i18n'

interface GatePassOptionListProps {
  options: GatePassOption[]
  isLoading: boolean
  errorMessage: string | null
  chosenKey: string | null
  model: string
  onChoose: (option: GatePassOption) => void
}

/**
 * The gate pass lines on offer, each with how much room it still has. A gate
 * pass with nothing left is shown and disabled rather than hidden when it was
 * searched for — "why is my Trip DO not here" is otherwise unanswerable.
 */
export function GatePassOptionList({
  options,
  isLoading,
  errorMessage,
  chosenKey,
  model,
  onChoose,
}: GatePassOptionListProps) {
  const t = useT()

  if (isLoading) {
    return (
      <div className="space-y-1.5" aria-busy="true">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-[3.75rem] rounded-lg" />
        ))}
      </div>
    )
  }

  if (errorMessage) {
    return (
      <p
        role="alert"
        className="flex items-center gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2.5 text-xs text-destructive"
      >
        <TriangleAlert className="size-4 shrink-0" aria-hidden />
        {errorMessage}
      </p>
    )
  }

  if (options.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-lg border border-dashed px-4 py-7 text-center">
        <PackageSearch className="size-5 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-[13px] font-medium">{t('tripDo.assign.noOffer')}</p>
        <p className="mt-1 max-w-sm text-xs text-pretty text-muted-foreground">
          Nothing recent carries {model || 'this product'} or anything close to it with pieces still
          unlinked. Type the Trip DO, gate pass number or vehicle to find it anyway.
        </p>
      </div>
    )
  }

  return (
    <div role="radiogroup" aria-label={t('tripDo.assign.gatePassesAria')} className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
      {options.map((option) => (
        <GatePassOptionCard
          key={option.optionKey}
          option={option}
          isChosen={option.optionKey === chosenKey}
          onChoose={onChoose}
        />
      ))}
    </div>
  )
}
