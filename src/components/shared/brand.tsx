import { cn } from '@/lib/utils'

/**
 * The LBTS logo.
 *
 * The asset in `public/` is already cropped to its artwork and downscaled for
 * the web (480x359, transparent), so it needs no CSS cropping and carries no
 * dead margin. If the file is ever replaced with a raw export, re-crop it —
 * the original was 1254x1254 with roughly a third of the frame empty.
 */
export function BrandLogo({ className }: { className?: string }) {
  return (
    <img
      src="/lbts-logo.png"
      alt=""
      aria-hidden
      width={480}
      height={359}
      className={cn('h-9 w-auto', className)}
    />
  )
}

interface BrandLockupProps {
  /** Drops the wordmark, for the collapsed sidebar. */
  compact?: boolean
  /** Shows the full product name beside the wordmark. */
  descriptor?: boolean
  /** For placement on the brand gradient, where dark text would disappear. */
  inverted?: boolean
  className?: string
}

export function BrandLockup({
  compact = false,
  descriptor = false,
  inverted = false,
  className,
}: BrandLockupProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {/*
        The artwork is transparent, so on light surfaces it sits directly on
        the sidebar. Its navy is only marginally lighter than the dark sidebar
        though, so dark mode gets a light plate. The padding is applied in both
        themes, so switching theme cannot shift the layout.
      */}
      <div className="shrink-0 rounded-lg p-1 dark:bg-white dark:shadow-sm">
        <BrandLogo className={compact ? 'h-7' : 'h-9'} />
      </div>

      {compact ? (
        <span className="sr-only">LBTS</span>
      ) : (
        <div className="min-w-0 leading-none">
          {/* Two-tone wordmark echoing the logo's own LB / TS split. */}
          <p className="truncate text-[17px] leading-none font-extrabold tracking-tight">
            <span className={inverted ? 'text-primary-foreground' : 'text-foreground'}>LB</span>
            <span className="text-brand-orange">TS</span>
          </p>
          {descriptor && (
            <p
              className={cn(
                'mt-1.5 truncate text-[10px] leading-none font-medium tracking-wide',
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
