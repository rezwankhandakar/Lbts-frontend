import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { cellText, parseCellInput } from '../types'

interface LabourCellInputProps {
  value: number | null
  max: number
  onCommit: (value: number | null) => void
  label: string
  /** A faint hint inside an empty cell; kept to a symbol, never a sample figure. */
  placeholder?: string
  disabled?: boolean
  className?: string
}

/**
 * One typed cell of the sheet.
 *
 * It behaves the way a spreadsheet cell behaves, because that is what somebody
 * working down a month of deliveries expects: type, Tab to the next, and the
 * figure is saved. Enter commits, Escape puts back what was there, and Tab
 * commits on the way out.
 *
 * Three decisions worth keeping:
 *
 * - **Empty is not zero.** Clearing the box saves `null`, which is "nobody has
 *   priced this yet", and typing `0` saves a charge of nothing. The bill counts
 *   the first and refuses to be finalized while any remain — see `lineTotal`.
 * - **A bad entry is refused, not corrected.** Anything that is not a whole
 *   non-negative number under the ceiling puts the previous value back and
 *   marks the box, rather than silently rounding or clamping it into something
 *   nobody typed.
 * - **The box is not repainted while it has focus.** The optimistic cache write
 *   and the server's answer both come back through `value`, and either landing
 *   mid-keystroke would eat what was being typed.
 */
export function LabourCellInput({
  value,
  max,
  onCommit,
  label,
  placeholder = '—',
  disabled = false,
  className,
}: LabourCellInputProps) {
  const [text, setText] = useState(() => cellText(value))
  const [rejected, setRejected] = useState(false)
  const editing = useRef(false)

  useEffect(() => {
    if (!editing.current) {
      setText(cellText(value))
    }
  }, [value])

  const commit = () => {
    const parsed = parseCellInput(text, max)
    if (!parsed.ok) {
      setRejected(true)
      setText(cellText(value))
      return
    }
    setRejected(false)
    if (parsed.value !== value) {
      onCommit(parsed.value)
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={text}
      disabled={disabled}
      aria-label={label}
      aria-invalid={rejected || undefined}
      placeholder={placeholder}
      onFocus={(event) => {
        editing.current = true
        event.currentTarget.select()
      }}
      onChange={(event) => {
        setText(event.target.value)
        setRejected(false)
      }}
      onBlur={() => {
        editing.current = false
        commit()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          setText(cellText(value))
          setRejected(false)
          editing.current = false
          event.currentTarget.blur()
        }
      }}
      className={cn(
        'w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-right text-[12.5px] font-medium tabular-nums transition outline-none',
        'placeholder:font-normal placeholder:text-muted-foreground/50',
        'hover:border-border hover:bg-background',
        'focus:border-primary focus:bg-background focus:ring-3 focus:ring-ring/30',
        'disabled:cursor-default disabled:opacity-100 disabled:hover:border-transparent disabled:hover:bg-transparent',
        rejected && 'border-destructive/60 bg-destructive/5 text-destructive',
        className,
      )}
    />
  )
}

interface LabourTextCellProps {
  value: string
  onCommit: (value: string) => void
  label: string
  maxLength: number
  disabled?: boolean
  placeholder?: string
  className?: string
}

/**
 * The Unit column, which on this sheet carries a company name.
 *
 * The same commit rules as an amount cell — Enter saves, Escape reverts, Tab
 * saves on the way out — and the same refusal to repaint under a cursor. There
 * is nothing to reject here, because any name is a name; a blank simply falls
 * back to the gate pass's own unit, which is what the placeholder shows.
 */
export function LabourTextCell({
  value,
  onCommit,
  label,
  maxLength,
  disabled = false,
  placeholder = '—',
  className,
}: LabourTextCellProps) {
  const [text, setText] = useState(value)
  const editing = useRef(false)

  useEffect(() => {
    if (!editing.current) {
      setText(value)
    }
  }, [value])

  const commit = () => {
    const next = text.trim()
    if (next !== value) {
      onCommit(next)
    }
    setText(next)
  }

  return (
    <input
      type="text"
      autoComplete="off"
      value={text}
      disabled={disabled}
      maxLength={maxLength}
      aria-label={label}
      placeholder={placeholder}
      onFocus={(event) => {
        editing.current = true
        event.currentTarget.select()
      }}
      onChange={(event) => setText(event.target.value)}
      onBlur={() => {
        editing.current = false
        commit()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.currentTarget.blur()
        }
        if (event.key === 'Escape') {
          event.preventDefault()
          setText(value)
          editing.current = false
          event.currentTarget.blur()
        }
      }}
      className={cn(
        'w-full rounded-md border border-transparent bg-transparent px-1.5 py-1 text-center text-[12.5px] transition outline-none',
        'placeholder:text-muted-foreground/50',
        'hover:border-border hover:bg-background',
        'focus:border-primary focus:bg-background focus:ring-3 focus:ring-ring/30',
        'disabled:cursor-default disabled:opacity-100 disabled:hover:border-transparent disabled:hover:bg-transparent',
        className,
      )}
    />
  )
}
