import { Lock, ShieldCheck } from 'lucide-react'

/**
 * States what the module is and who it is for. The "Admin only" badge is a
 * label on a boundary the API enforces — it tells the operator the room they
 * are standing in, it does not create the lock.
 */
export function AdministrationHeader() {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3.5">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-primary-foreground shadow-sm"
          aria-hidden
        >
          <ShieldCheck className="size-5" />
        </span>

        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Administration</h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground">
            Manage users, roles and account access.
          </p>
        </div>
      </div>

      <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-tone-indigo/25 bg-tone-indigo/10 px-2.5 py-1 text-xs font-semibold text-tone-indigo">
        <Lock className="size-3.5" aria-hidden />
        Admin only
      </span>
    </div>
  )
}
