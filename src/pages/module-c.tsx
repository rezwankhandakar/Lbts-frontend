import { Wallet } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export function ModuleCPage() {
  return (
    <ComingSoon
      icon={Wallet}
      title="Module C"
      description="The third LBTS module. Its screens and workflows are not built yet."
    />
  )
}
