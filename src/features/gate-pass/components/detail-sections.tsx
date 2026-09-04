import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DetailCardProps {
  icon: LucideIcon
  title: string
  tone: 'indigo' | 'cyan' | 'violet' | 'emerald' | 'amber'
  children: ReactNode
  /**
   * Renders the body as a plain block instead of a description list. Most
   * sections are label-and-value pairs, which is exactly what a `<dl>` is for;
   * the goods are a table, and a table is not valid inside one.
   */
  raw?: boolean
  className?: string
}

/**
 * Full literal class strings, because Tailwind scans source text — the same
 * rule as `layout/nav-accents.ts` and `lib/roles.ts`.
 */
const TONES = {
  indigo: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  cyan: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  violet: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  emerald: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  amber: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
} as const

/**
 * One group of facts about the gate pass.
 *
 * Colour is confined to the icon chip, the same restraint the profile and
 * administration cards use: tinting whole panels would turn a reference page
 * into a rainbow and cost the values their prominence.
 */
export function DetailCard({ icon: Icon, title, tone, children, raw, className }: DetailCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
      <header className="flex items-center gap-2.5 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <span
          className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg ring-1', TONES[tone])}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
        <h2 className="text-[13px] font-semibold tracking-tight">{title}</h2>
      </header>

      {raw ? <div>{children}</div> : <dl className="divide-y">{children}</dl>}
    </section>
  )
}

interface DetailRowProps {
  label: string
  value: ReactNode
  /** Renders the value in the tabular figures a number deserves. */
  numeric?: boolean
}

export function DetailRow({ label, value, numeric }: DetailRowProps) {
  return (
    <div className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-baseline sm:gap-4 sm:px-5">
      <dt className="w-40 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          'min-w-0 flex-1 text-[13px] wrap-break-word',
          numeric && 'tabular-nums',
          (value === null || value === undefined || value === '') && 'text-muted-foreground',
        )}
      >
        {value === null || value === undefined || value === '' ? '—' : value}
      </dd>
    </div>
  )
}
