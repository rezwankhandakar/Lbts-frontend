import { Truck, UserRound } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { DocumentOwnerType } from '../types'

export interface DocumentSubject {
  type: DocumentOwnerType
  id: string
  label: string
}

interface DocumentSubjectDialogProps {
  open: boolean
  isLoading: boolean
  vehicles: DocumentSubject[]
  drivers: DocumentSubject[]
  onOpenChange: (open: boolean) => void
  onChoose: (subject: DocumentSubject) => void
}

function Group({
  title,
  icon: Icon,
  subjects,
  onChoose,
}: {
  title: string
  icon: typeof Truck
  subjects: DocumentSubject[]
  onChoose: (subject: DocumentSubject) => void
}) {
  if (subjects.length === 0) {
    return null
  }

  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 border-b pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h3>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {subjects.map((subject) => (
          <button
            key={`${subject.type}:${subject.id}`}
            type="button"
            onClick={() => onChoose(subject)}
            className="rounded-lg border px-3 py-2 text-left text-[13px] transition-colors outline-none hover:border-primary/35 hover:bg-primary/[0.04] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="block truncate">{subject.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}

/**
 * Choosing what a new document is about.
 *
 * A step rather than a field, because a document belongs to a vehicle or a
 * driver and there is no such thing as one belonging to the vendor itself —
 * which means the type list on the next screen depends entirely on this answer.
 * Asking it first is what lets the form offer *Fitness Certificate* and *Tax
 * Token* for a lorry and *Driving License* and *NID* for a person, rather than
 * one long list with half of it invalid.
 *
 * Most of the time this is skipped: opening the documents tab from a vehicle or
 * a driver row carries the subject with it.
 */
export function DocumentSubjectDialog({
  open,
  isLoading,
  vehicles,
  drivers,
  onOpenChange,
  onChoose,
}: DocumentSubjectDialogProps) {
  const isEmpty = !isLoading && vehicles.length === 0 && drivers.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>What is this document for?</DialogTitle>
          <DialogDescription>
            A compliance document belongs to a vehicle or to a driver. Choosing here narrows the
            type list to the ones that make sense for it.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2" aria-busy="true">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-2/3" />
          </div>
        ) : isEmpty ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            This vendor has no active vehicles or drivers yet. Add one first — a document has to
            belong to something.
          </p>
        ) : (
          <div className="space-y-5">
            <Group title="Vehicles" icon={Truck} subjects={vehicles} onChoose={onChoose} />
            <Group title="Drivers" icon={UserRound} subjects={drivers} onChoose={onChoose} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
