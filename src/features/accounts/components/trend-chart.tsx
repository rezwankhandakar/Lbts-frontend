import { useState } from 'react'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { shortPeriodLabel, signedTaka, taka } from '../lib/accounts-meta'
import type { ProfitLossMonth } from '../types'

/** A clean upper bound for the axis: 1, 2 or 5 times a power of ten, at or above the largest value. */
function niceMax(value: number): number {
  if (value <= 0) return 1000
  const power = 10 ** Math.floor(Math.log10(value))
  const step = [1, 2, 2.5, 5, 10].find((factor) => factor * power >= value) ?? 10
  return step * power
}

function compact(value: number): string {
  if (value >= 10_000_000) return `${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 1)}Cr`
  if (value >= 100_000) return `${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)}L`
  if (value >= 1000) return `${Math.round(value / 1000)}K`
  return String(value)
}

const SERIES = [
  { key: 'income', labelKey: 'accounts.profit.incomeSeries', swatch: 'bg-viz-1' },
  { key: 'totalCost', labelKey: 'accounts.profit.totalCost', swatch: 'bg-viz-2' },
] as const

/**
 * Income against cost, month by month: paired columns on one axis, with the
 * profit in the tooltip and in the table beneath for anyone not reading the
 * picture. Two series, so a legend always, and the colours are the validated
 * pair from the brand layer — marks only, never text.
 *
 * A column is pressed as well as hovered, because a phone has no hover and the
 * profit is only in the tooltip; and past six months every other month label is
 * dropped on a narrow screen rather than printed over its neighbour. The slot
 * stays either way, so the labels never slide out of step with the columns.
 */
export function TrendChart({ months }: { months: ProfitLossMonth[] }) {
  const t = useT()

  const [active, setActive] = useState<number | null>(null)
  const sparseLabels = months.length > 6
  const top = niceMax(Math.max(0, ...months.flatMap((month) => [month.income, month.totalCost])))
  const ticks = [top, top / 2, 0]

  return (
    <figure className="grid gap-3">
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {SERIES.map((series) => (
          <span key={series.key} className="flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-[3px]', series.swatch)} aria-hidden />
            {t(series.labelKey)}
          </span>
        ))}
      </figcaption>

      <div className="grid grid-cols-[2.5rem_1fr] gap-2" aria-hidden>
        <div className="relative h-48 text-right text-[10px] text-muted-foreground tabular-nums">
          {ticks.map((tick, index) => (
            <span key={tick} className="absolute right-0 -translate-y-1/2" style={{ top: `${index * 50}%` }}>
              {compact(tick)}
            </span>
          ))}
        </div>

        <div className="relative h-48">
          {ticks.map((tick, index) => (
            <div key={tick} className="absolute inset-x-0 h-px bg-border" style={{ top: `${index * 50}%` }} />
          ))}

          <div className="relative flex h-full items-end">
            {months.map((month, index) => (
              <div
                key={`${month.year}-${month.month}`}
                className="relative flex h-full flex-1 cursor-default touch-manipulation items-end justify-center gap-0.5"
                onMouseEnter={() => setActive(index)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive((current) => (current === index ? null : index))}
              >
                {active === index && <div className="absolute inset-y-0 inset-x-1 rounded-md bg-muted/50" />}
                {SERIES.map((series) => (
                  <div
                    key={series.key}
                    className={cn('relative w-full max-w-6 rounded-t-[4px]', series.swatch)}
                    style={{ height: `${(month[series.key] / top) * 100}%`, minHeight: month[series.key] > 0 ? 2 : 0 }}
                  />
                ))}
                {active === index && (
                  <div
                    className={cn(
                      'absolute bottom-full z-10 mb-2 w-40 rounded-lg border bg-popover p-2.5 text-xs shadow-lg sm:w-44',
                      index > months.length / 2 ? 'right-0' : 'left-0',
                    )}
                  >
                    <p className="mb-1.5 font-medium">{month.label}</p>
                    {SERIES.map((series) => (
                      <p key={series.key} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span className={cn('size-2 rounded-[2px]', series.swatch)} />
                          {series.key === 'income' ? 'Income' : 'Cost'}
                        </span>
                        <span className="tabular-nums">{taka(month[series.key])}</span>
                      </p>
                    ))}
                    <p className="mt-1.5 flex justify-between border-t pt-1.5 font-medium">
                      <span>{t('accounts.profit.profit')}</span>
                      <span className="tabular-nums">{signedTaka(month.profit)}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div />
        <div className="flex">
          {months.map((month, index) => (
            <span key={`${month.year}-${month.month}`} className="min-w-0 flex-1 text-center text-[11px] text-muted-foreground">
              <span className={cn(sparseLabels && index % 2 === 1 && 'hidden sm:inline')}>{shortPeriodLabel(month)}</span>
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>{t('accounts.profit.chartCaption')}</caption>
        <thead>
          <tr>
            <th>{t('accounts.profit.month')}</th>
            <th>{t('accounts.profit.income')}</th>
            <th>{t('accounts.profit.totalCost')}</th>
            <th>{t('accounts.profit.profit')}</th>
          </tr>
        </thead>
        <tbody>
          {months.map((month) => (
            <tr key={`${month.year}-${month.month}`}>
              <td>{month.label}</td>
              <td>{taka(month.income)}</td>
              <td>{taka(month.totalCost)}</td>
              <td>{signedTaka(month.profit)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
