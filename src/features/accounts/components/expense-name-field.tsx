import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useExpenseNames } from '../hooks/use-accounts'
import { EntryField } from './entry-field'

interface ExpenseNameFieldProps {
  label?: string
  value: string
  error?: string
  onChange: (value: string) => void
}

const MAX_SUGGESTIONS = 6

/**
 * What an expense was for, typed — there is no category list to choose from.
 *
 * Names used before are offered beneath the box as it is typed, most used
 * first. They are only suggestions, but they are what keeps one cost from
 * being recorded as "Office rent", "office rent" and "Rent": three names the
 * Expenses page and the profit and loss would count as three different costs.
 */
export function ExpenseNameField({ label = 'Expense name', value, error, onChange }: ExpenseNameFieldProps) {
  const names = useExpenseNames()
  const typed = (value ?? '').trim().toLowerCase()
  // Only real names: a blank or missing one from an older entry is never offered, and never crashes the form.
  const known = (names.data ?? []).filter((name): name is string => typeof name === 'string' && name.trim() !== '')
  const suggestions = known
    .filter((name) => name.toLowerCase() !== typed && (!typed || name.toLowerCase().includes(typed)))
    .slice(0, MAX_SUGGESTIONS)

  return (
    <EntryField id="entry-expense-name" label={label} error={error} className="sm:col-span-2">
      <Input
        id="entry-expense-name"
        value={value ?? ''}
        maxLength={80}
        autoComplete="off"
        list="entry-expense-name-options"
        aria-invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id="entry-expense-name-options">
        {known.map((name) => <option key={name} value={name} />)}
      </datalist>
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Expense names used before">
          {suggestions.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onChange(name)}
              className={cn(
                'rounded-md border bg-card px-2 py-0.5 text-[12px] text-muted-foreground transition',
                'hover:border-primary/40 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
              )}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </EntryField>
  )
}
