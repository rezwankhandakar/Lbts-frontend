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
import type { TranslationKey, Translator } from '@/lib/i18n'
import { daysAgo } from '@/lib/day-grouping'
import { formatDayLong, formatTime } from '@/lib/i18n'
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

interface ModuleMeta extends ModulePresentation {
  label: string
}

/** The untranslatable half: colour, icon and where that module lives. */
interface ModulePresentation {
  icon: LucideIcon
  /** Soft tinted pill: background, hairline border and text in one hue. */
  badge: string
  /** Icon chip, for the marker on the timeline rail. */
  chip: string
  dot: string
  /** Where that module's records live, so a row can offer a way through. */
  path: string
}

export const MODULE_META: Record<ActivityModule, ModulePresentation> = {
  Administration: {
    icon: ShieldCheck,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
    path: '/administration',
  },
  Vendor: {
    icon: Building2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
    path: '/vendors',
  },
  Delivery: {
    icon: PackageCheck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    dot: 'bg-tone-amber',
    path: '/delivery',
  },
  'Gate Pass': {
    icon: ScanLine,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    dot: 'bg-tone-cyan',
    path: '/gate-pass',
  },
  Challan: {
    icon: ReceiptText,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
    path: '/challan',
  },
  Location: {
    icon: MapPinned,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    dot: 'bg-tone-cyan',
    path: '/locations',
  },
  'Product Rate': {
    icon: Tags,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
    path: '/product-rates',
  },
  'Excel Bill': {
    icon: Receipt,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
    path: '/bills',
  },
  'Labour Bill': {
    icon: HardHat,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    dot: 'bg-tone-amber',
    path: '/labour-bills',
  },
  Accounts: {
    icon: Landmark,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    dot: 'bg-tone-indigo',
    path: '/accounts/cash-book',
  },
}

const UNKNOWN_MODULE: ModulePresentation = {
  icon: FileText,
  badge: 'border-border bg-muted text-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
  dot: 'bg-muted-foreground',
  path: '/activity',
}

/** Tolerant: a row written under a module this build does not know still draws. */
export function moduleMeta(value: string, t: Translator): ModuleMeta {
  const known = MODULE_META[value as ActivityModule]

  if (known) {
    return { ...known, label: t(`activity.modules.${value as ActivityModule}` as TranslationKey) }
  }

  // A module this build does not know keeps its own raw name: it is data from
  // the journal, and inventing a translation for it would be worse.
  return { ...UNKNOWN_MODULE, label: value || t('activity.modules.unknown') }
}

interface CategoryMeta {
  label: string
  icon: LucideIcon
}

export const CATEGORY_META: Record<ActivityCategory, { icon: LucideIcon }> = {
  create: { icon: FilePlus2 },
  update: { icon: Pencil },
  status: { icon: ToggleRight },
  delete: { icon: Trash2 },
  access: { icon: KeyRound },
  money: { icon: Banknote },
  document: { icon: FileText },
}

export function categoryMeta(value: string, t: Translator): CategoryMeta {
  const known = CATEGORY_META[value as ActivityCategory]

  return known
    ? { ...known, label: t(`activity.categories.${value as ActivityCategory}` as TranslationKey) }
    : { label: value || t('activity.categories.unknown'), icon: FileText }
}

interface SeverityMeta extends SeverityPresentation {
  label: string
}

interface SeverityPresentation {
  icon: LucideIcon
  badge: string
  /** Drawn on the row itself, and only for `critical`. */
  emphasis: string
}

export const SEVERITY_META: Record<ActivitySeverity, SeverityPresentation> = {
  info: {
    icon: Info,
    badge: 'border-border bg-muted text-muted-foreground',
    emphasis: '',
  },
  notice: {
    icon: AlertTriangle,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    emphasis: '',
  },
  critical: {
    icon: Siren,
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    emphasis: 'bg-tone-rose',
  },
}

export function severityMeta(value: string, t: Translator): SeverityMeta {
  const severity: ActivitySeverity =
    value in SEVERITY_META ? (value as ActivitySeverity) : 'info'

  return {
    ...SEVERITY_META[severity],
    label: t(`activity.severities.${severity}` as TranslationKey),
  }
}

/** How a record type reads, and where that kind of record lives. */
const ENTITY_META: Record<ActivityEntityType, { path: string | null }> = {
  User: { path: '/administration' },
  Vendor: { path: '/vendors' },
  Vehicle: { path: null },
  Driver: { path: null },
  Assignment: { path: null },
  Document: { path: null },
  Trip: { path: '/delivery' },
  GatePass: { path: '/gate-pass' },
  Challan: { path: '/challan' },
  Location: { path: '/locations' },
  ProductRate: { path: '/product-rates' },
  Bill: { path: '/bills' },
  LabourBill: { path: '/labour-bills' },
  AccountsEntry: { path: '/accounts/cash-book' },
}

/** A record type this build does not know keeps its own raw name. */
export function entityLabel(value: string, t: Translator): string {
  return value in ENTITY_META
    ? t(`activity.entities.${value as ActivityEntityType}` as TranslationKey)
    : value
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

/**
 * "Today", "Yesterday", then the full date — the question the reader is asking.
 *
 * The two words come from the shared `time` branch rather than from here,
 * because the notification list says exactly the same thing and the two sit in
 * one shell: a second copy is how one of them comes to read a Dhaka evening
 * differently from the other.
 */
export function dayHeading(iso: string, t: Translator): string {
  const days = daysAgo(iso, new Date())

  if (days === 0) return t('time.today')
  if (days === 1) return t('time.yesterday')
  return formatDayLong(new Date(iso))
}

export function timeOf(iso: string): string {
  return formatTime(iso)
}

/**
 * The arithmetic lives in `@/lib/day-grouping` and is re-exported here, so
 * callers import presentation from one place while the alias-free file owns
 * the value and stays loadable by `node --test`. It moved out of this feature
 * when the notification list wanted the same day headings — a move rather than
 * a copy, as CLAUDE.md asks.
 */
export { actorInitials, changeValueText, dayKeyOf, groupByDay } from '@/lib/day-grouping'
