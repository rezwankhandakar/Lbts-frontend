import {
  AlertTriangle,
  Banknote,
  Building2,
  FilePlus2,
  FileText,
  HardHat,
  Info,
  KeyRound,
  Landmark,
  MapPinned,
  PackageCheck,
  Pencil,
  Receipt,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Siren,
  Tags,
  ToggleRight,
  Trash2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { daysAgo } from '@/lib/day-grouping'
import type {
  ActivityCategory,
  ActivityEntityType,
  ActivityModule,
  ActivityRecord,
  ActivitySeverity,
} from '../types'

/**
 * How a journal row reads on screen.
 *
 * Three vocabularies, drawn from three different places, and keeping them
 * apart is the point:
 *
 * - **Module** carries the colour, and it is the *same* colour the sidebar
 *   gives that destination. Somebody who has learnt that Challan is violet
 *   should not have to learn a second palette to read the journal.
 * - **Category** carries the icon, because what kind of change it was is what
 *   a reader scanning a long list is actually matching on.
 * - **Severity** carries the emphasis, and only `critical` gets any — a page
 *   where everything is highlighted is a page where nothing is.
 *
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` generates nothing and the colour silently
 * vanishes — the rule `lib/roles.ts` and `layout/nav-accents.ts` both state.
 */

interface ModuleMeta {
  label: string
  icon: LucideIcon
  /** Soft tinted pill: background, hairline border and text in one hue. */
  badge: string
  /** Icon chip, for the marker on the timeline rail. */
  chip: string
  dot: string
  /** Where that module's records live, so a row can offer a way through. */
  path: string
}

export const MODULE_META: Record<ActivityModule, ModuleMeta> = {
  Administration: {
    label: 'Administration',
    icon: ShieldCheck,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
    path: '/administration',
  },
  Vendor: {
    label: 'Vendor',
    icon: Building2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
    path: '/vendors',
  },
  Delivery: {
    label: 'Delivery',
    icon: PackageCheck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    dot: 'bg-tone-amber',
    path: '/delivery',
  },
  'Gate Pass': {
    label: 'Gate Pass',
    icon: ScanLine,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    dot: 'bg-tone-cyan',
    path: '/gate-pass',
  },
  Challan: {
    label: 'Challan',
    icon: ReceiptText,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
    path: '/challan',
  },
  Location: {
    label: 'Location',
    icon: MapPinned,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    dot: 'bg-tone-cyan',
    path: '/locations',
  },
  'Product Rate': {
    label: 'Product Rate',
    icon: Tags,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
    path: '/product-rates',
  },
  'Excel Bill': {
    label: 'Excel Bill',
    icon: Receipt,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
    path: '/bills',
  },
  'Labour Bill': {
    label: 'Labour Bill',
    icon: HardHat,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    dot: 'bg-tone-amber',
    path: '/labour-bills',
  },
  Accounts: {
    label: 'Accounts',
    icon: Landmark,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    dot: 'bg-tone-indigo',
    path: '/accounts/cash-book',
  },
}

const UNKNOWN_MODULE: ModuleMeta = {
  label: 'Activity',
  icon: FileText,
  badge: 'border-border bg-muted text-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
  dot: 'bg-muted-foreground',
  path: '/activity',
}

/** Tolerant: a row written under a module this build does not know still draws. */
export function moduleMeta(value: string): ModuleMeta {
  return MODULE_META[value as ActivityModule] ?? { ...UNKNOWN_MODULE, label: value || 'Activity' }
}

interface CategoryMeta {
  label: string
  icon: LucideIcon
}

export const CATEGORY_META: Record<ActivityCategory, CategoryMeta> = {
  create: { label: 'Created', icon: FilePlus2 },
  update: { label: 'Corrected', icon: Pencil },
  status: { label: 'Status', icon: ToggleRight },
  delete: { label: 'Deleted', icon: Trash2 },
  access: { label: 'Access', icon: KeyRound },
  money: { label: 'Money', icon: Banknote },
  document: { label: 'Document', icon: FileText },
}

export function categoryMeta(value: string): CategoryMeta {
  return CATEGORY_META[value as ActivityCategory] ?? { label: value || 'Change', icon: FileText }
}

interface SeverityMeta {
  label: string
  icon: LucideIcon
  badge: string
  /** Drawn on the row itself, and only for `critical`. */
  emphasis: string
}

export const SEVERITY_META: Record<ActivitySeverity, SeverityMeta> = {
  info: {
    label: 'Routine',
    icon: Info,
    badge: 'border-border bg-muted text-muted-foreground',
    emphasis: '',
  },
  notice: {
    label: 'Notable',
    icon: AlertTriangle,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    emphasis: '',
  },
  critical: {
    label: 'Critical',
    icon: Siren,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    emphasis: 'bg-tone-rose',
  },
}

export function severityMeta(value: string): SeverityMeta {
  return SEVERITY_META[value as ActivitySeverity] ?? SEVERITY_META.info
}

/** How a record type reads, and where that kind of record lives. */
const ENTITY_META: Record<ActivityEntityType, { label: string; path: string | null }> = {
  User: { label: 'Account', path: '/administration' },
  Vendor: { label: 'Vendor', path: '/vendors' },
  Vehicle: { label: 'Vehicle', path: null },
  Driver: { label: 'Driver', path: null },
  Assignment: { label: 'Assignment', path: null },
  Document: { label: 'Document', path: null },
  Trip: { label: 'Trip', path: '/delivery' },
  GatePass: { label: 'Gate pass', path: '/gate-pass' },
  Challan: { label: 'Challan', path: '/challan' },
  Location: { label: 'Location', path: '/locations' },
  ProductRate: { label: 'Product rate', path: '/product-rates' },
  Bill: { label: 'Excel bill', path: '/bills' },
  LabourBill: { label: 'Labour bill', path: '/labour-bills' },
  AccountsEntry: { label: 'Accounts entry', path: '/accounts/cash-book' },
}

export function entityLabel(value: string): string {
  return ENTITY_META[value as ActivityEntityType]?.label ?? value
}

/**
 * Where a row's record can be opened, or null.
 *
 * Only the entity types whose id *is* the URL get a link — a gate pass, a
 * challan, a trip. A vehicle lives inside a vendor's tab and a document inside
 * that, and a link that landed on the wrong page would be worse than none:
 * this is a page people use to check what happened, and a link that lies about
 * where a record is undermines the one thing it is for.
 *
 * A deleted record keeps its row and loses its link, which is correct — the
 * label is a copy precisely so the sentence survives the record.
 */
export function recordPath(record: ActivityRecord): string | null {
  if (!record.entityId) {
    return null
  }

  const base = ENTITY_META[record.entityType]?.path
  if (!base) {
    return null
  }

  switch (record.entityType) {
    case 'GatePass':
    case 'Challan':
    case 'Trip':
    case 'Vendor':
    case 'Bill':
    case 'LabourBill':
      return `${base}/${record.entityId}`
    default:
      // A list, not a record: Administration, the masters and the cash book
      // have no per-row URL, so the honest destination is the page itself.
      return base
  }
}

const DAY_HEADING = new Intl.DateTimeFormat(undefined, {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const TIME_ONLY = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })

/** "Today", "Yesterday", then the full date — the question the reader is asking. */
export function dayHeading(iso: string): string {
  const days = daysAgo(iso, new Date())

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return DAY_HEADING.format(new Date(iso))
}

export function timeOf(iso: string): string {
  return TIME_ONLY.format(new Date(iso))
}

/**
 * The arithmetic lives in `@/lib/day-grouping` and is re-exported here, so
 * callers import presentation from one place while the alias-free file owns
 * the value and stays loadable by `node --test`. It moved out of this feature
 * when the notification list wanted the same day headings — a move rather than
 * a copy, as CLAUDE.md asks.
 */
export { actorInitials, changeValueText, dayKeyOf, groupByDay } from '@/lib/day-grouping'
