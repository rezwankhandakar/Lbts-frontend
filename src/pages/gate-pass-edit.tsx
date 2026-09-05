import { useNavigate, useParams } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GatePassWorkspace } from '@/features/gate-pass/components/gate-pass-workspace'
import { GatePassDetailsSkeleton } from '@/features/gate-pass/components/gate-pass-details-skeleton'
import { useGatePass } from '@/features/gate-pass/hooks/use-gate-passes'

/**
 * Correcting a gate pass, in whatever state it has reached — a draft being
 * finished, one a reviewer sent back, or a filed record with a vehicle number
 * transcribed wrongly.
 *
 * The same workspace as a new gate pass, loaded with what is already on
 * record. Status decides what the correction costs rather than whether it is
 * allowed: a verified record goes back for verification when it is changed,
 * which the workspace says out loud before anything is saved. Who may correct
 * it is the server's decision, and it refuses a record that is not theirs.
 */
export function GatePassEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const query = useGatePass(id)

  if (query.isPending) {
    return <GatePassDetailsSkeleton />
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
          <TriangleAlert className="size-5" aria-hidden />
        </div>
        <h1 className="mt-4 text-lg font-semibold tracking-tight">Gate pass not found</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {query.error?.message ?? 'It may have been deleted, or you may not have access to it.'}
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => navigate('/gate-pass')}>
          Back to gate passes
        </Button>
      </div>
    )
  }

  return <GatePassWorkspace initialRecord={query.data} />
}
