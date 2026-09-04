import { useNavigate, useParams } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GatePassWorkspace } from '@/features/gate-pass/components/gate-pass-workspace'
import { GatePassDetailsSkeleton } from '@/features/gate-pass/components/gate-pass-details-skeleton'
import { useGatePass } from '@/features/gate-pass/hooks/use-gate-passes'
import { isEditableStatus } from '@/features/gate-pass/types'

/**
 * Correcting a gate pass that is still open — a draft being finished, or one a
 * reviewer sent back.
 *
 * The same workspace as a new gate pass, loaded with what is already on
 * record. Anything that has been submitted or verified is not editable, and
 * the server refuses the write regardless; this page says so rather than
 * offering a form whose Save could only fail.
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

  if (!isEditableStatus(query.data.status)) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-md flex-col items-center justify-center text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          {query.data.gatePassId} can no longer be edited
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          A {query.data.status.toLowerCase()} gate pass is part of the record. Cancel it and file a
          new one if it is wrong.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={() => navigate(`/gate-pass/${query.data.id}`)}
        >
          View the gate pass
        </Button>
      </div>
    )
  }

  return <GatePassWorkspace initialRecord={query.data} />
}
