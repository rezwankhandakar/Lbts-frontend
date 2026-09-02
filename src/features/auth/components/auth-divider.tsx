interface AuthDividerProps {
  label: string
}

export function AuthDivider({ label }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px flex-1 bg-border" aria-hidden />
      <span className="text-[11px] font-medium tracking-wide whitespace-nowrap text-muted-foreground uppercase">
        {label}
      </span>
      <span className="h-px flex-1 bg-border" aria-hidden />
    </div>
  )
}
