import { Network, Route, ShieldCheck } from 'lucide-react'
import { BrandLockup } from '@/components/shared/brand'
import { useT } from '@/lib/i18n'
import type { TranslationKey } from '@/lib/i18n'

const BENEFITS: { icon: typeof Network; titleKey: TranslationKey; copyKey: TranslationKey }[] = [
  {
    icon: Network,
    titleKey: 'auth.brand.connected.title',
    copyKey: 'auth.brand.connected.copy',
  },
  {
    icon: Route,
    titleKey: 'auth.brand.routes.title',
    copyKey: 'auth.brand.routes.copy',
  },
  {
    icon: ShieldCheck,
    titleKey: 'auth.brand.access.title',
    copyKey: 'auth.brand.access.copy',
  },
]

/**
 * Decorative route network. Purely presentational, hidden from assistive tech,
 * and drawn in currentColor so it inherits the panel's inverted foreground.
 */
function RouteMotif() {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      className="absolute -right-16 -bottom-16 size-[28rem] text-primary-foreground opacity-[0.13]"
      aria-hidden
    >
      <path
        d="M40 340C40 220 140 240 200 200C260 160 240 60 360 60"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 250C90 250 120 300 200 300C280 300 320 200 390 200"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="6 10"
      />
      <circle cx="40" cy="340" r="7" fill="currentColor" />
      <circle cx="200" cy="200" r="7" fill="currentColor" />
      <circle cx="360" cy="60" r="7" fill="currentColor" />
      <circle cx="200" cy="300" r="5" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

export function AuthBrandPanel() {
  const t = useT()

  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-from to-brand-to p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between xl:p-12">
      {/* Faint survey grid, then a soft light source, then the route motif. */}
      <div
        className="absolute inset-0 [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:44px_44px] opacity-[0.06]"
        aria-hidden
      />
      <div
        className="absolute -top-32 -right-24 size-96 rounded-full bg-primary-foreground/10 blur-3xl"
        aria-hidden
      />
      <RouteMotif />

      <BrandLockup inverted descriptor size="lg" className="relative" />

      <div className="relative max-w-md">
        <h2 className="text-[2rem] leading-[1.15] font-semibold tracking-tight text-balance xl:text-4xl">
          {t('auth.brandHeadline')}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-pretty text-primary-foreground/75">
          {t('auth.brandBody')}
        </p>

        <ul className="mt-9 space-y-5">
          {BENEFITS.map((benefit) => (
            <li key={benefit.titleKey} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-foreground/12 ring-1 ring-primary-foreground/15">
                <benefit.icon className="size-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">{t(benefit.titleKey)}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-primary-foreground/65">
                  {t(benefit.copyKey)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-primary-foreground/50">
        &copy; {new Date().getFullYear()} LBTS — Line Business Transport Service
      </p>
    </aside>
  )
}
