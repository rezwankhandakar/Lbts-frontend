import { Settings } from 'lucide-react'
import { ComingSoon } from '@/components/shared/coming-soon'

export function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Settings"
      description="Workspace and account preferences will be configurable here."
    />
  )
}
