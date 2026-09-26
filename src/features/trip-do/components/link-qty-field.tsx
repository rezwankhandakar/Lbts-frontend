import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { linkOutcome } from '../lib/split-parts'
import { useT } from '@/lib/i18n'

interface LinkQtyFieldProps {
  qty: number
  onChange: (qty: number) => void
  rowQty: number
  /** What the chosen gate pass still has room for. */
  room: number
  tripDo: string
}

/**
 * How many of the row came out on the chosen Trip DO.
 *
 * Fewer than the row is the split, and the bar underneath shows it before it
 * happens: the green part is linked, the amber part becomes a row of its own
 * waiting for another Trip DO. Five on the challan and three on this gate pass
 * is one press of "Max".
 */
export function LinkQtyField({ qty, onChange, rowQty, room, tripDo }: LinkQtyFieldProps) {
  const t = useT()

  const max = Math.max(1, Math.min(rowQty, room))
  const { linked, remainder } = linkOutcome(rowQty, qty)

  return (
    <div className="rounded-xl border bg-muted/25 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-medium">{t('tripDo.assign.howMany')}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Fewer than {rowQty} splits the row; the rest waits for another Trip DO.
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onChange(Math.max(1, qty - 1))}
            disabled={qty <= 1}
            aria-label={t('tripDo.assign.oneFewer')}
          >
            <Minus aria-hidden />
          </Button>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={rowQty}
            value={qty}
            onChange={(event) => onChange(Number.parseInt(event.target.value, 10) || 0)}
            className="h-8 w-16 text-center tabular-nums"
            aria-label={t('tripDo.assign.piecesAria')}
          />
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onChange(Math.min(max, qty + 1))}
            disabled={qty >= max}
            aria-label={t('tripDo.assign.oneMore')}
          >
            <Plus aria-hidden />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onChange(max)} disabled={qty === max}>
            Max {max}
          </Button>
        </div>
      </div>

      <div className="mt-3 flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div
          className="h-full rounded-full bg-tone-emerald transition-[width] duration-300"
          style={{ width: `${(linked / rowQty) * 100}%` }}
        />
        {remainder > 0 && (
          <div
            className="h-full rounded-full bg-tone-amber/60 transition-[width] duration-300"
            style={{ width: `${(remainder / rowQty) * 100}%` }}
          />
        )}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        <span className="font-semibold text-tone-emerald tabular-nums">{linked}</span> on Trip DO{' '}
        <span className="font-mono text-foreground">{tripDo}</span>
        {remainder > 0 && (
          <>
            {' · '}
            <span className="font-semibold text-tone-amber tabular-nums">{remainder}</span> stay on a
            new row, waiting for a Trip DO
          </>
        )}
      </p>
    </div>
  )
}
