import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * One accent per section, so the three panels are told apart by colour as well
 * as by heading. Full literal class strings, because Tailwind scans source
 * text — the same rule as `layout/nav-accents.ts` and `lib/roles.ts`.
 */
const TONES = {
  indigo: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  violet: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  emerald: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
} as const

export type SectionTone = keyof typeof TONES

interface SectionCardProps {
  icon: LucideIcon
  title: string
  description: string
  tone: SectionTone
  /** Usually the section's primary control, e.g. an Edit button. */
  action?: ReactNode
  children: ReactNode
  /** Quiet closing line, for the rule that governs the section. */
  footnote?: ReactNode
  className?: string
}

/**
 * The shell every panel on the profile page shares: a raised card on the
 * recessed canvas, a tinted icon, a heading that says what the section is for,
 * and an optional footnote for the rule behind it.
 *
 * Colour is confined to the icon chip. Tinting whole cards would turn the page
 * into a rainbow and cost the content its prominence — the same restraint the
 * administration overview cards use.
 */
export function SectionCard({
  icon: Icon,
  title,
  description,
  tone,
  action,
  children,
  footnote,
  className,
}: SectionCardProps) {
  return (
    <section className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
      <header className="flex items-start gap-3 border-b bg-muted/30 px-4 py-3.5 sm:px-5">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg ring-1',
            TONES[tone],
          )}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-[15px] leading-snug font-semibold">{title}</h2>
          <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{description}</p>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </header>

      <div className="px-4 sm:px-5">{children}</div>

      {footnote ? (
        <footer className="border-t bg-muted/20 px-4 py-2.5 text-[11.5px] leading-snug text-muted-foreground sm:px-5">
          {footnote}
        </footer>
      ) : null}
    </section>
  )
}
