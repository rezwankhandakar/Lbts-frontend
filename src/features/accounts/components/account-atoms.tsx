import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useT } from '@/lib/i18n'
import { KIND_META, settlementMeta, vendorStatusMeta } from '../lib/accounts-meta'
import type { EntryKind, SettlementStatus, VendorBillStatus } from '../types'

export function KindIcon({ kind, className }: { kind: EntryKind; className?: string }) {
  const meta = KIND_META[kind]
  return (
    <span
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1', meta.chip, className)}
      aria-hidden
    >
      <meta.icon className="size-4" />
    </span>
  )
}

const PILL = 'inline-flex h-5 items-center rounded-full px-2 text-[11px] font-medium whitespace-nowrap ring-1'

export function VendorBillBadge({ status }: { status: VendorBillStatus }) {
  const t = useT()
  const meta = vendorStatusMeta(status, t)
  return <span className={cn(PILL, meta.badge)}>{meta.label}</span>
}

export function SettlementBadge({ status, receiving = false }: { status: SettlementStatus; receiving?: boolean }) {
  const t = useT()
  const meta = settlementMeta(status, t)
  return <span className={cn(PILL, meta.badge)}>{receiving ? meta.received : meta.label}</span>
}

type Tone = 'indigo' | 'emerald' | 'rose' | 'amber' | 'violet' | 'cyan' | 'orange'

const TONE_CHIP: Record<Tone, string> = {
  indigo: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  emerald: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  rose: 'bg-tone-rose/10 text-tone-rose ring-tone-rose/20',
  amber: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  violet: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  cyan: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  orange: 'bg-tone-orange/10 text-tone-orange ring-tone-orange/20',
}

interface StatTileProps {
  label: string
  value: string
  hint?: ReactNode
  icon: LucideIcon
  tone: Tone
  /** A tile that answers a question somebody acts on is a link to where they act. */
  to?: string
  onClick?: () => void
  pressed?: boolean
  isLoading?: boolean
  valueClassName?: string
}

/**
 * A figure with a label, the way every module's overview draws one. A tile
 * with somewhere to go is a link or a button — a number nobody can act on is a
 * number to scroll past.
 */
export function StatTile({ label, value, hint, icon: Icon, tone, to, onClick, pressed, isLoading, valueClassName }: StatTileProps) {
  const body = (
    <>
      <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg ring-1', TONE_CHIP[tone])}>
        <Icon className="size-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        {isLoading ? (
          <Skeleton className="h-7 w-24" />
        ) : (
          <span className={cn('block truncate text-2xl leading-tight font-semibold tracking-tight tabular-nums', valueClassName)}>
            {value}
          </span>
        )}
        <span className="mt-0.5 block text-[13px] font-medium">{label}</span>
        {hint && <span className="mt-0.5 block truncate text-xs text-muted-foreground">{hint}</span>}
      </span>
    </>
  )

  const base = 'flex items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-xs'
  const interactive =
    'transition outline-none hover:-translate-y-px hover:border-primary/30 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50'

  if (to) {
    return (
      <Link to={to} className={cn(base, interactive)}>
        {body}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={pressed}
        className={cn(base, interactive, pressed && 'border-primary/50 ring-2 ring-primary/15')}
      >
        {body}
      </button>
    )
  }
  return <div className={base}>{body}</div>
}

/** A proportion drawn as a hairline, for "how much of this is settled". */
export function ProgressBar({ value, max, tone = 'emerald' }: { value: number; max: number; tone?: 'emerald' | 'amber' | 'indigo' }) {
  const share = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  const fill = { emerald: 'bg-tone-emerald', amber: 'bg-tone-amber', indigo: 'bg-tone-indigo' }[tone]
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="presentation">
      <div className={cn('h-full rounded-full transition-[width] duration-500', fill)} style={{ width: `${share}%` }} />
    </div>
  )
}

/** A panel with a heading, the shape every section of these pages is drawn in. */
export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/20 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  )
}
