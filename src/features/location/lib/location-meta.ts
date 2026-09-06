import { Building2, CircleHelp, MapPinCheck, Route, Warehouse } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LOCATION_TYPES } from '../types'
import type { LocationSource, LocationStatus, LocationType } from '../types'

/**
 * Display metadata for the Location vocabulary, in the same shape
 * `lib/roles.ts` uses for roles and `challan-meta.ts` uses for challan
 * statuses — and for the same reason: colour for a classification belongs in
 * one table, never inline in a component.
 *
 * Every class is a full literal string. Tailwind scans source text, so a
 * template like `text-tone-${tone}` would generate nothing and the colour
 * would silently vanish.
 */

interface ToneClasses {
  badge: string
  dot: string
  chip: string
}

export interface LocationTypeMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
}

export const LOCATION_TYPE_META: Record<LocationType, LocationTypeMeta> = {
  ISD: {
    label: 'ISD',
    description: 'Inside the metropolitan delivery area.',
    icon: Building2,
    badge: 'border-tone-indigo/25 bg-tone-indigo/10 text-tone-indigo',
    dot: 'bg-tone-indigo',
    chip: 'bg-tone-indigo/10 text-tone-indigo ring-tone-indigo/20',
  },
  'OSD-Metro': {
    label: 'OSD-Metro',
    description: 'Outside the delivery area, in a metropolitan or sadar thana.',
    icon: Warehouse,
    badge: 'border-tone-cyan/25 bg-tone-cyan/10 text-tone-cyan',
    dot: 'bg-tone-cyan',
    chip: 'bg-tone-cyan/10 text-tone-cyan ring-tone-cyan/20',
  },
  'OSD-Thana': {
    label: 'OSD-Thana',
    description: 'Outside the delivery area, in an upazila thana.',
    icon: Route,
    badge: 'border-tone-violet/25 bg-tone-violet/10 text-tone-violet',
    dot: 'bg-tone-violet',
    chip: 'bg-tone-violet/10 text-tone-violet ring-tone-violet/20',
  },
}

/** Defensive: a value written before this set existed must still render. */
export function locationTypeMeta(value: string): LocationTypeMeta {
  return (
    LOCATION_TYPE_META[value as LocationType] ?? {
      label: value || 'Unknown',
      description: 'Not one of the recognised location types.',
      icon: CircleHelp,
      badge: 'border-border bg-muted text-muted-foreground',
      dot: 'bg-muted-foreground',
      chip: 'bg-muted text-muted-foreground ring-border',
    }
  )
}

export interface LocationStatusMeta extends ToneClasses {
  label: string
  description: string
  icon: LucideIcon
}

/**
 * Both states have a chip, so a caller never has to express "not yet" as an
 * absence — an empty space reads as "no information", which is a different
 * claim.
 *
 * Where each is actually drawn is the call site's decision: a list that
 * already shows the resolved district in its own column would be saying the
 * same thing twice, so it draws only the pending one.
 *
 * Pending is warning-toned rather than destructive. Nothing is wrong: the
 * location simply is not known, and the challan was filed perfectly well
 * without it.
 */
export const LOCATION_STATUS_META: Record<LocationStatus, LocationStatusMeta> = {
  Verified: {
    label: 'Location set',
    description: 'Matched to the location master list.',
    icon: MapPinCheck,
    badge: 'border-tone-emerald/25 bg-tone-emerald/10 text-tone-emerald',
    dot: 'bg-tone-emerald',
    chip: 'bg-tone-emerald/10 text-tone-emerald ring-tone-emerald/20',
  },
  Pending: {
    label: 'Location pending',
    description: 'Not determined yet. An administrator can set it at any time.',
    icon: CircleHelp,
    badge: 'border-tone-amber/25 bg-tone-amber/10 text-tone-amber',
    dot: 'bg-tone-amber',
    chip: 'bg-tone-amber/10 text-tone-amber ring-tone-amber/20',
  },
}

export function locationStatusMeta(value: string): LocationStatusMeta {
  return LOCATION_STATUS_META[value as LocationStatus] ?? LOCATION_STATUS_META.Pending
}

/**
 * How a location was decided, in words.
 *
 * Shown on the details page and nowhere else. An operator filing a challan
 * does not need to know which tier of a matcher answered — they need to know
 * whether the location is set. Somebody investigating a wrong one does.
 */
export const LOCATION_SOURCE_LABELS: Record<LocationSource, string> = {
  master_exact: 'Matched the master list exactly',
  master_normalized: 'Matched the master list after normalising the spelling',
  master_fuzzy: 'Matched the nearest master entry',
  gemini_assisted: 'Chosen from master entries with assistance',
  admin_manual: 'Set by hand',
}

export function locationSourceLabel(value: string): string {
  return LOCATION_SOURCE_LABELS[value as LocationSource] ?? 'Set from the master list'
}

/** "Dhaka / Mirpur Model", the way a location is written everywhere in the UI. */
export function locationLabel(location: { district: string; thana: string }): string {
  return `${location.district} / ${location.thana}`
}

export { LOCATION_TYPES }
