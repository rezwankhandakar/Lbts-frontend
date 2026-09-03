import { cn } from '@/lib/utils'

/**
 * Two artworks, one brand. The navy logo vanishes on a dark surface and the
 * white one vanishes on a light surface, so the pair is swapped by theme —
 * which is what replaced the white plate the dark sidebar used to need.
 *
 * Both files in `public/` are cropped to their own artwork and downscaled for
 * the web (transparent, 480px wide), so they need no CSS cropping and carry no
 * dead margin. If either is replaced with a raw export, re-crop it — the
 * originals were 1254x1254 with roughly a third of the frame empty.
 */
const LOGO = {
  onLight: { src: '/lbts-logo.png', width: 480, height: 359 },
  onDark: { src: '/lbts-logo-on-dark.png', width: 480, height: 367 },
} as const

interface BrandLogoProps {
  /**
   * Forces the white artwork, for a surface that stays dark in both themes —
   * the auth gradient panel. Left off, the logo follows the theme.
   */
  onDark?: boolean
  className?: string
}

export function BrandLogo({ onDark = false, className }: BrandLogoProps) {
  const base = cn('h-9 w-auto', className)

  if (onDark) {
    return <LogoImage variant="onDark" className={base} />
  }

  // Swapped in CSS rather than from the theme store: the class on <html> is
  // set before first paint by the no-flash script in index.html, so the right
  // artwork is the one that paints first. Each <img> carries its own intrinsic
  // size, so neither reserves the other's box.
  return (
    <>
      <LogoImage variant="onLight" className={cn(base, 'dark:hidden')} />
      <LogoImage variant="onDark" className={cn(base, 'hidden dark:block')} />
    </>
  )
}

function LogoImage({ variant, className }: { variant: keyof typeof LOGO; className: string }) {
  const { src, width, height } = LOGO[variant]

  return <img src={src} alt="" aria-hidden width={width} height={height} className={className} />
}

/**
 * Logo height, wordmark and descriptor move together — the auth panel wants
 * the lockup as its anchor, the sidebar wants it as a header.
 */
const LOCKUP_SIZES = {
  default: {
    gap: 'gap-2.5',
    logo: 'h-9',
    wordmark: 'text-[17px]',
    descriptor: 'mt-1.5 text-[10px]',
  },
  lg: {
    gap: 'gap-3.5',
    logo: 'h-14',
    wordmark: 'text-[28px]',
    descriptor: 'mt-2 text-[13px]',
  },
} as const

interface BrandLockupProps {
  /** Drops the wordmark, for the collapsed sidebar. */
  compact?: boolean
  /** Shows the full product name beside the wordmark. */
  descriptor?: boolean
  /** For placement on the brand gradient, where dark text would disappear. */
  inverted?: boolean
  /** Larger lockup, for the auth brand panel. */
  size?: keyof typeof LOCKUP_SIZES
  className?: string
}

export function BrandLockup({
  compact = false,
  descriptor = false,
  inverted = false,
  size = 'default',
  className,
}: BrandLockupProps) {
  const scale = LOCKUP_SIZES[size]

  return (
    <div className={cn('flex items-center', scale.gap, className)}>
      {/* The gradient panel is dark in both themes, so it takes the white
          artwork outright; everywhere else the theme decides. */}
      <BrandLogo onDark={inverted} className={cn('shrink-0', compact ? 'h-7' : scale.logo)} />

      {compact ? (
        <span className="sr-only">LBTS</span>
      ) : (
        <div className="min-w-0 leading-none">
          {/* Two-tone wordmark echoing the logo's own LB / TS split. */}
          <p className={cn('truncate leading-none font-extrabold tracking-tight', scale.wordmark)}>
            <span className={inverted ? 'text-primary-foreground' : 'text-foreground'}>LB</span>
            <span className="text-brand-orange">TS</span>
          </p>
          {descriptor && (
            <p
              className={cn(
                'truncate leading-none font-medium tracking-wide',
                scale.descriptor,
                inverted ? 'text-primary-foreground/70' : 'text-muted-foreground',
              )}
            >
              Line Business Transport Service
            </p>
          )}
        </div>
      )}
    </div>
  )
}
