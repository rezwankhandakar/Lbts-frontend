interface PageHeaderProps {
  title: string
  description: string
}

/** Consistent page-level heading block above any page content. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{title}</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-pretty text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
