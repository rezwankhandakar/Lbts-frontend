import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface DeliveryPageHeaderProps {
  title: ReactNode
  description: string
  back: { to: string; label: string }
  actions?: ReactNode
}

/** The heading every Delivery sub-page opens with: a way back, a title, and its actions. */
export function DeliveryPageHeader({ title, description, back, actions }: DeliveryPageHeaderProps) {
  return (
    <div className="mb-6">
      <Button variant="ghost" size="sm" className="-ml-2 mb-2" render={<Link to={back.to} />}>
        <ArrowLeft data-icon="inline-start" aria-hidden />
        {back.label}
      </Button>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}
