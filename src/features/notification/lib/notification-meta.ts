import {
  AlertTriangle,
  Banknote,
  BellRing,
  Building2,
  CheckCheck,
  Info,
  Landmark,
  PackageCheck,
  Receipt,
  ScanLine,
  ShieldCheck,
  Truck,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { TranslationKey, Translator } from '@/lib/i18n'
import { daysAgo } from '@/lib/day-grouping'
import { formatDayLong } from '@/lib/i18n'
import type {
  NotificationCategory,
  NotificationModule,
  NotificationPriority,
  NotificationRecord,
} from '../types'

/**
 * How a message reads on screen.
 *
 * Three vocabularies drawn from three places, and keeping them apart is the
 * point — the arrangement `activity-meta.ts` states and this deliberately
 * matches, because the two lists sit in the same shell and a reader should not
 * have to learn a second colour language:
 *
 * - **Module** carries the colour, and it is the *same* colour the sidebar gives
 *   that destination. Somebody who has learnt that Challan is violet should not
 *   have to learn a second palette to read their notifications.
 * - **Category** carries the icon, because what *kind* of message it is — a
 *   decision waiting, paper that has lapsed, money — is what somebody scanning a
 *   list is matching on.
 * - **Priority** carries the emphasis, and only `urgent` and `attention` get
 *   any. A list where everything is highlighted is a list where nothing is.
 *
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` generates nothing and the colour silently
 * vanishes — the rule `lib/roles.ts` and `layout/nav-accents.ts` both state.
 */

/** What a module says. The label is resolved by the lookup below. */
interface ModuleMeta extends ModulePresentation {
  label: string
}

/** The untranslatable half: colour and icon, and nothing it says. */
interface ModulePresentation {
  icon: LucideIcon
  /** Soft tinted pill: background, hairline border and text in one hue. */
  badge: string
  /** Icon chip, for the marker beside the message. */
  chip: string
  dot: string
}

export const NOTIFICATION_MODULE_META: Record<NotificationModule, ModulePresentation> = {
  Account: {
    icon: ShieldCheck,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
  },
  'Gate Pass': {
    icon: ScanLine,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
    dot: 'bg-tone-cyan',
  },
  Delivery: {
    icon: PackageCheck,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
    dot: 'bg-tone-amber',
  },
  Vendor: {
    icon: Building2,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
    dot: 'bg-tone-emerald',
  },
  Billing: {
    icon: Receipt,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
    dot: 'bg-tone-indigo',
  },
  Accounts: {
    icon: Landmark,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
    dot: 'bg-tone-violet',
  },
}

const UNKNOWN_MODULE: ModulePresentation = {
  icon: BellRing,
  badge: 'border-border bg-muted text-muted-foreground',
  chip: 'bg-muted text-muted-foreground ring-border',
  dot: 'bg-muted-foreground',
}

/**
 * Degrades rather than throwing, for the reason the server's own
 * `notificationEventMeta` does: the event is a plain string on the document so a
 * retired one never makes an unread message unreadable, and that only holds if
 * every layer between the collection and the screen reads it safely.
 */
export function notificationModuleMeta(value: string, t: Translator): ModuleMeta {
  const known = NOTIFICATION_MODULE_META[value as NotificationModule]

  return known
    ? { ...known, label: t(`notification.modules.${value as NotificationModule}` as TranslationKey) }
    : { ...UNKNOWN_MODULE, label: t('notification.modules.unknown') }
}

interface CategoryMeta {
  label: string
  icon: LucideIcon
  /** The sentence on the preferences page, which has to say what goes quiet. */
  description: string
}

export const NOTIFICATION_CATEGORY_META: Record<NotificationCategory, { icon: LucideIcon }> = {
  approvals: { icon: UserCheck },
  review: { icon: CheckCheck },
  compliance: { icon: AlertTriangle },
  operations: { icon: Truck },
  money: { icon: Banknote },
  account: { icon: ShieldCheck },
}

export function notificationCategoryMeta(value: string, t: Translator): CategoryMeta {
  const category: NotificationCategory =
    value in NOTIFICATION_CATEGORY_META ? (value as NotificationCategory) : 'operations'

  return {
    icon: NOTIFICATION_CATEGORY_META[category].icon,
    label: t(`notification.categories.${category}.label` as TranslationKey),
    description: t(`notification.categories.${category}.description` as TranslationKey),
  }
}

interface PriorityMeta extends PriorityPresentation {
  label: string
}

interface PriorityPresentation {
  /** A hairline down the row's leading edge. Only the two that earn it. */
  emphasis: string | null
  /** The dot on the bell, and the tile. */
  dot: string
  badge: string
  icon: LucideIcon
}

export const NOTIFICATION_PRIORITY_META: Record<NotificationPriority, PriorityPresentation> = {
  info: {
    emphasis: null,
    dot: 'bg-brand-indigo',
    badge: 'border-border bg-muted text-muted-foreground',
    icon: Info,
  },
  attention: {
    emphasis: 'bg-tone-amber',
    dot: 'bg-brand-amber',
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    icon: AlertTriangle,
  },
  urgent: {
    emphasis: 'bg-tone-rose',
    dot: 'bg-tone-rose',
    badge: 'border-tone-rose/25 bg-tone-rose/10 text-tone-rose',
    icon: AlertTriangle,
  },
}

export function notificationPriorityMeta(value: string, t: Translator): PriorityMeta {
  const priority: NotificationPriority =
    value in NOTIFICATION_PRIORITY_META ? (value as NotificationPriority) : 'info'

  return {
    ...NOTIFICATION_PRIORITY_META[priority],
    label: t(`notification.priorities.${priority}` as TranslationKey),
  }
}

/**
 * Where a message's record lives — **derived here, never stored.**
 *
 * A path is a fact about this router rather than about the message, so a URL
 * written into the collection in June is one that silently breaks when a route is
 * renamed in September, in every row at once. It is the arrangement `recordPath`
 * has in the activity feature, and it follows the same rule about honesty:
 *
 * **A link is offered only where the id genuinely *is* the URL.** A vehicle lives
 * inside a vendor's tab and a compliance document inside that, so neither has a
 * route of its own — on a page somebody uses to act on what they are told, a link
 * that lands in the wrong place undermines the one thing it is for. Those rows
 * say what happened and let the reader go and find it.
 *
 * A record that has since been deleted keeps its message and loses its link,
 * which is correct — the label is a copy precisely so the sentence survives.
 */
export function notificationPath(record: NotificationRecord): string | null {
  if (!record.entityId) {
    return null
  }

  switch (record.entityType) {
    case 'GatePass':
      return `/gate-pass/${record.entityId}`
    case 'Challan':
      return `/challan/${record.entityId}`
    case 'Trip':
      return `/delivery/${record.entityId}`
    case 'Vendor':
      return `/vendors/${record.entityId}`
    case 'Bill':
      return `/bills/${record.entityId}`
    case 'LabourBill':
      return `/labour-bills/${record.entityId}`
    /**
     * Administration is a list rather than a page per account, so a message about
     * an account waiting for approval lands on the list — which is where the
     * decision is actually taken. `/profile` would be wrong for the same message
     * seen by an Admin, and right only for the one about your own role, which
     * needs no link at all: the sidebar it changed is already on screen.
     */
    case 'User':
      return record.event === 'account.pending' ? '/administration' : null
    /**
     * An entry lives in a filtered cash book rather than at an id, and a voucher
     * is opened from the row. Naming the page is honest; naming a row that may be
     * three pages back is not.
     */
    case 'AccountsEntry':
      return '/accounts/cash-book'
    default:
      return null
  }
}

/** What the link is called, so a button says where it goes. */
export function notificationLinkLabel(record: NotificationRecord, t: Translator): string {
  switch (record.entityType) {
    case 'GatePass':
      return t('notification.links.gatePass')
    case 'Challan':
      return t('notification.links.challan')
    case 'Trip':
      return t('notification.links.trip')
    case 'Vendor':
      return t('notification.links.vendor')
    case 'Bill':
    case 'LabourBill':
      return t('notification.links.bill')
    case 'User':
      return t('notification.links.administration')
    case 'AccountsEntry':
      return t('notification.links.cashBook')
    default:
      return t('notification.links.generic')
  }
}

/**
 * "Today", "Yesterday", then the full date — the question the reader is asking.
 *
 * The full date comes from `formatDayLong`, which is cached per locale and
 * already knows how to write a Bengali month; the two words come from the
 * shared `time` branch, because the activity journal's headings say exactly
 * the same thing and a second copy is how the two lists in one shell come to
 * disagree.
 */
export function dayHeading(iso: string, t: Translator): string {
  const days = daysAgo(iso, new Date())

  if (days === 0) return t('time.today')
  if (days === 1) return t('time.yesterday')
  return formatDayLong(new Date(iso))
}

/**
 * The arithmetic lives in `@/lib/day-grouping` and is re-exported here, so
 * callers import presentation from one place while the alias-free file owns the
 * value and stays loadable by `node --test`. It moved out of the activity
 * feature when this list wanted the same day headings — a move rather than a
 * copy, as CLAUDE.md asks.
 */
export { actorInitials, dayKeyOf, groupByDay } from '@/lib/day-grouping'
