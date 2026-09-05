import { useId, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useChallanSuggestions } from '../hooks/use-challan-suggestions'
import type { ChallanSuggestionField } from '../types'

interface SuggestInputProps {
  id: string
  field: ChallanSuggestionField
  registration: UseFormRegisterReturn
  /** The live value, so the list reflects what is in the box right now. */
  value: string
  onPick: (value: string) => void
  invalid?: boolean
  describedBy?: string
  className?: string
}

/**
 * A text field that offers what has already been filed under it.
 *
 * The same component the Gate Pass entry form uses, pointed at this module's
 * suggestion endpoint — and deliberately not a `<datalist>`: browsers style
 * and filter those themselves, inconsistently, and Safari barely supports
 * them. This is a plain input with a list under it, so it looks like every
 * other field in the form and the keyboard works the way an operator expects.
 *
 * Typing is never blocked. A suggestion is an offer, not a constraint: a
 * district that has never appeared before has to be typeable, so the list can
 * always be ignored or dismissed with Escape.
 */
export function SuggestInput({
  id,
  field,
  registration,
  value,
  onPick,
  invalid,
  describedBy,
  className,
}: SuggestInputProps) {
  const listId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)

  /**
   * Set while a suggestion is being clicked. A mouse press blurs the input
   * before the click lands, and closing the list on blur would delete the item
   * out from under the cursor.
   */
  const pickingRef = useRef(false)

  const { values, isLoading } = useChallanSuggestions(field, value)

  // A list showing only what is already typed is noise.
  const options = values.filter((option) => option.toLowerCase() !== value.trim().toLowerCase())
  const showList = isOpen && options.length > 0

  const choose = (option: string) => {
    onPick(option)
    setIsOpen(false)
    setHighlighted(-1)
  }

  return (
    <div className="relative">
      <Input
        {...registration}
        id={id}
        type="text"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={showList}
        aria-controls={showList ? listId : undefined}
        aria-autocomplete="list"
        aria-invalid={invalid ? true : undefined}
        aria-describedby={describedBy}
        className={className}
        onChange={(event) => {
          void registration.onChange(event)
          setIsOpen(true)
          setHighlighted(-1)
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={(event) => {
          if (pickingRef.current) {
            return
          }
          setIsOpen(false)
          setHighlighted(-1)
          void registration.onBlur(event)
        }}
        onKeyDown={(event) => {
          if (!showList) {
            return
          }

          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault()
            const step = event.key === 'ArrowDown' ? 1 : -1
            setHighlighted((current) => {
              const next = current + step
              if (next < 0) return options.length - 1
              if (next >= options.length) return 0
              return next
            })
            return
          }

          // Enter takes the highlighted suggestion, and only then. Without the
          // guard it would submit the form from the middle of a field.
          if (event.key === 'Enter' && highlighted >= 0) {
            event.preventDefault()
            choose(options[highlighted])
            return
          }

          if (event.key === 'Escape') {
            event.preventDefault()
            setIsOpen(false)
            setHighlighted(-1)
          }
        }}
      />

      {isLoading && (
        <Loader2
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground"
          aria-hidden
        />
      )}

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border bg-popover p-1 shadow-lg"
        >
          {options.map((option, index) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={index === highlighted}
                // Fires before blur, which is what keeps the list alive long
                // enough for the click to land.
                onMouseDown={() => {
                  pickingRef.current = true
                }}
                onMouseUp={() => {
                  pickingRef.current = false
                }}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => choose(option)}
                className={cn(
                  'block w-full truncate rounded-md px-2 py-1.5 text-left text-[13px] outline-none',
                  index === highlighted ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                )}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
