import type { NavAccent } from '@/app/nav-config'

interface AccentClasses {
  /** Resting icon colour — tinted, so the nav scans by colour, not just text. */
  icon: string
  iconActive: string
  label: string
  rail: string
  activeSurface: string
}

/**
 * Full literal class strings, because Tailwind scans source text — a template
 * like `text-brand-${accent}` would never be generated.
 */
export const NAV_ACCENTS: Record<NavAccent, AccentClasses> = {
  indigo: {
    icon: 'text-brand-indigo/65 group-hover:text-brand-indigo',
    iconActive: 'text-brand-indigo',
    label: 'text-brand-indigo',
    rail: 'bg-brand-indigo',
    activeSurface: 'from-brand-indigo/14 to-brand-indigo/[0.02]',
  },
  cyan: {
    icon: 'text-brand-cyan/65 group-hover:text-brand-cyan',
    iconActive: 'text-brand-cyan',
    label: 'text-brand-cyan',
    rail: 'bg-brand-cyan',
    activeSurface: 'from-brand-cyan/14 to-brand-cyan/[0.02]',
  },
  violet: {
    icon: 'text-brand-violet/65 group-hover:text-brand-violet',
    iconActive: 'text-brand-violet',
    label: 'text-brand-violet',
    rail: 'bg-brand-violet',
    activeSurface: 'from-brand-violet/14 to-brand-violet/[0.02]',
  },
  emerald: {
    icon: 'text-brand-emerald/65 group-hover:text-brand-emerald',
    iconActive: 'text-brand-emerald',
    label: 'text-brand-emerald',
    rail: 'bg-brand-emerald',
    activeSurface: 'from-brand-emerald/14 to-brand-emerald/[0.02]',
  },
  amber: {
    icon: 'text-brand-amber/65 group-hover:text-brand-amber',
    iconActive: 'text-brand-amber',
    label: 'text-brand-amber',
    rail: 'bg-brand-amber',
    activeSurface: 'from-brand-amber/14 to-brand-amber/[0.02]',
  },
}
