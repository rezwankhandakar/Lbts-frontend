import type { ReactNode } from 'react'
import { BrandLockup } from '@/components/shared/brand'
import { AuthBrandPanel } from './auth-brand-panel'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Two-column on large screens, single column below. The brand panel is dropped
 * entirely under lg rather than stacked, so mobile is a focused form rather
 * than a desktop layout squeezed narrow — the compact lockup carries identity.
 */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-svh bg-background text-foreground lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] xl:grid-cols-2">
      <AuthBrandPanel />

      <main className="flex min-h-svh flex-col px-5 py-8 sm:px-8 lg:min-h-0 lg:justify-center lg:px-10 xl:px-16">
        <div className="mx-auto flex w-full max-w-[25rem] flex-1 flex-col justify-center">
          <BrandLockup descriptor className="mb-9 lg:hidden" />

          <header className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-[1.75rem]">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
              {subtitle}
            </p>
          </header>

          {children}

          {footer && <div className="mt-7 text-center text-sm">{footer}</div>}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/60 lg:hidden">
          &copy; {new Date().getFullYear()} LBTS
        </p>
      </main>
    </div>
  )
}
