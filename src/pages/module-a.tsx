import { Boxes } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export function ModuleAPage() {
  return (
    <ComingSoon
      icon={Boxes}
      title="Module A"
      description="The first LBTS module. Its screens and workflows are not built yet."
    />
  )
}
