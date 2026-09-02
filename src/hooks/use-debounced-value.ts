import { useEffect, useState } from 'react'

/**
 * Trails `value` by `delay` ms. Used to keep a search box responsive without
 * firing a request per keystroke — on free-tier infrastructure every avoided
 * round trip counts.
 */
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
