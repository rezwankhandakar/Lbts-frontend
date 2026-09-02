import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <EmptyState
        icon={Compass}
        badge="404"
        title="This page does not exist"
        description="The page you are looking for may have been moved, or the address might be mistyped."
        action={
          <Button render={<Link to="/" />} className="font-medium shadow-sm">
            Back to dashboard
          </Button>
        }
      />
    </div>
  )
}
