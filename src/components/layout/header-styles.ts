import { cn } from '@/lib/utils'

/**
 * Shared treatment for the header's icon controls: quiet at rest, brand-tinted
 * on hover. Lives in its own module so the header and the controls it renders
 * do not import each other.
 */
export const HEADER_ICON_BUTTON = cn(
  'text-muted-foreground rounded-lg transition-colors duration-150',
  'hover:bg-primary/10 hover:text-primary',
)
