import { useLayoutEffect, useRef, useState } from 'react'

/**
 * How wide the columns pinned at the sheet's left edge are together — the tick
 * box and the SL — which is where the frozen Customer column has to stop.
 *
 * Measured rather than fixed, because the SL cell is as wide as its number,
 * its row tag and the digits the language draws, and a guessed offset either
 * leaves a gap the rows show through or slides the customer under the SL.
 * `getBoundingClientRect` rather than `offsetWidth`, which rounds to whole
 * pixels and would leave a hairline seam; a width is the same however far the
 * sheet is scrolled, so a sticky cell measures true.
 */
export function usePinnedWidth(canWrite: boolean) {
  const tickRef = useRef<HTMLTableCellElement>(null)
  const slRef = useRef<HTMLTableCellElement>(null)
  const [width, setWidth] = useState(0)

  useLayoutEffect(() => {
    const cells = [tickRef.current, slRef.current].filter(
      (cell): cell is HTMLTableCellElement => cell !== null,
    )
    const measure = () => {
      setWidth(cells.reduce((sum, cell) => sum + cell.getBoundingClientRect().width, 0))
    }

    measure()
    const observer = new ResizeObserver(measure)
    cells.forEach((cell) => observer.observe(cell))
    return () => observer.disconnect()
  }, [canWrite])

  return { tickRef, slRef, width }
}
