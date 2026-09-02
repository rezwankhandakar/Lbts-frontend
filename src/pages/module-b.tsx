import { Users } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export function ModuleBPage() {
  return (
    <ComingSoon
      icon={Users}
      title="Module B"
      description="The second LBTS module. Its screens and workflows are not built yet."
    />
  )
}
