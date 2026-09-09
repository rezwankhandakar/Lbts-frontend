import { useState } from 'react'
import { ArrowRight, Loader2, TriangleAlert, UserRound } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatDay } from '../lib/vendor-meta'
import { assignmentFormSchema } from '../schemas/vendor-schemas'
import type { AssignmentFormValues } from '../schemas/vendor-schemas'
import type { AssignmentRecord, DriverRecord, VehicleRecord } from '../types'
import { DateField, FieldError, FormSection } from './form-parts'

interface AssignDriverDialogProps {
  open: boolean
  isPending: boolean
  vendorName: string
  vehicles: VehicleRecord[]
  drivers: DriverRecord[]
  isLoadingOptions: boolean
  /** Preselected when the dialog was opened from a vehicle or a driver row. */
  defaultVehicleId?: string
  defaultDriverId?: string
  /**
   * The live assignment the server refused to displace silently. Set from the
   * 409 body, and what turns this form into a confirmation.
   */
  conflict: AssignmentRecord | null
  onOpenChange: (open: boolean) => void
  onSubmit: (values: AssignmentFormValues, replaceActive: boolean) => void
}

/** Today, as a calendar day. The ordinary start date for a changeover. */
function today(): string {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    .toISOString()
    .slice(0, 10)
}

/**
 * Putting a driver on a vehicle.
 *
 * The part that matters is what happens when the vehicle already has one.
 * **Nothing is ever changed silently.** The first submission is refused by the
 * server with the assignment it would have closed; this dialog then shows both
 * sides of the handover — "Rahim will become the active driver, and the
 * assignment with Karim will be closed on 31 Aug" — and the button becomes
 * *Replace driver*. The confirmation is a second, deliberate press.
 *
 * Both selectors offer only what may actually be chosen: active vehicles and
 * active drivers belonging to this vendor. An option nobody may pick is a dead
 * end with a 409 at the end of it, and the same rule the vendor selector
 * follows.
 */
export function AssignDriverDialog({
  open,
  isPending,
  vendorName,
  vehicles,
  drivers,
  isLoadingOptions,
  defaultVehicleId,
  defaultDriverId,
  conflict,
  onOpenChange,
  onSubmit,
}: AssignDriverDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      vehicleId: '',
      driverId: '',
      assignedFrom: today(),
      assignedUntil: '',
      note: '',
    },
    mode: 'onTouched',
  })

  const [acknowledged, setAcknowledged] = useState(false)

  /**
   * Reloads whenever the dialog opens, or opens on a different subject.
   *
   * Adjusted during render rather than in an effect — the pattern
   * `change-role-dialog.tsx` and `app-layout.tsx` already use — because the
   * alternative cascades a second render on every open, and because a
   * confirmation left ticked from the previous vehicle would be a handover
   * somebody agreed to for a different lorry.
   */
  const [session, setSession] = useState<string | null>(null)
  const currentSession = open ? `${defaultVehicleId ?? ''}:${defaultDriverId ?? ''}` : null

  if (currentSession !== session) {
    setSession(currentSession)
    setAcknowledged(false)
    reset({
      vehicleId: defaultVehicleId ?? '',
      driverId: defaultDriverId ?? '',
      assignedFrom: today(),
      assignedUntil: '',
      note: '',
    })
  }

  const vehicleId = useWatch({ control, name: 'vehicleId' })
  const driverId = useWatch({ control, name: 'driverId' })
  const assignedFrom = useWatch({ control, name: 'assignedFrom' })
  const assignedUntil = useWatch({ control, name: 'assignedUntil' })

  const vehicle = vehicles.find((item) => item.id === vehicleId)
  const driver = drivers.find((item) => item.id === driverId)

  /**
   * The vehicle's current driver, as this dialog already knows it. The server's
   * 409 is the authority — this is what lets the warning appear *before* the
   * first submission rather than after it, which is the difference between
   * explaining a consequence and reporting one.
   */
  const current = conflict ?? null
  const displaced = current?.driver?.name ?? vehicle?.currentDriver?.name ?? null
  const needsConfirmation = Boolean(displaced) && displaced !== driver?.name

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign driver</DialogTitle>
          <DialogDescription>
            A vehicle and a driver must belong to the same vendor, and a vehicle can have only one
            active driver at a time.
          </DialogDescription>
        </DialogHeader>

        <form
          noValidate
          onSubmit={handleSubmit((values) => onSubmit(values, acknowledged))}
          className="space-y-5"
          aria-busy={isPending}
        >
          <FormSection title="Assignment">
            <div className="rounded-lg border bg-muted/40 px-3 py-2.5">
              <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                Vendor
              </p>
              <p className="mt-0.5 text-[13px] font-medium">{vendorName}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="assign-vehicle">Vehicle</Label>
                <Select
                  value={vehicleId}
                  onValueChange={(value) => setValue('vehicleId', value ?? '', { shouldDirty: true })}
                  disabled={isPending || isLoadingOptions}
                >
                  <SelectTrigger id="assign-vehicle" className="w-full">
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {vehicles.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.registrationNo}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError error={errors.vehicleId?.message} />
                {vehicles.length === 0 && !isLoadingOptions && (
                  <p className="text-xs leading-snug text-muted-foreground">
                    No active vehicles. A vehicle in maintenance, suspended or out of papers cannot
                    be given a driver.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assign-driver">Driver</Label>
                <Select
                  value={driverId}
                  onValueChange={(value) => setValue('driverId', value ?? '', { shouldDirty: true })}
                  disabled={isPending || isLoadingOptions}
                >
                  <SelectTrigger id="assign-driver" className="w-full">
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {drivers.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError error={errors.driverId?.message} />
                {drivers.length === 0 && !isLoadingOptions && (
                  <p className="text-xs leading-snug text-muted-foreground">
                    No active drivers. A driver on leave, suspended or inactive cannot be assigned.
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Period">
            <div className="grid gap-4 sm:grid-cols-2">
              <DateField
                id="assign-from"
                label="Assigned from"
                value={assignedFrom}
                onChange={(value) => setValue('assignedFrom', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.assignedFrom?.message}
              />

              <DateField
                id="assign-until"
                label="Assigned until (optional)"
                value={assignedUntil}
                onChange={(value) => setValue('assignedUntil', value, { shouldDirty: true })}
                disabled={isPending}
                error={errors.assignedUntil?.message}
                hint="Leave blank for an open-ended assignment, which is the usual case."
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="assign-note">
                Note <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea id="assign-note" rows={2} disabled={isPending} {...register('note')} />
            </div>
          </FormSection>

          {needsConfirmation && vehicle && driver && (
            <div className="space-y-3 rounded-lg border border-tone-amber/30 bg-tone-amber/[0.07] p-3.5">
              <p className="flex items-start gap-2 text-[13px] leading-snug">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-tone-amber" aria-hidden />
                <span>
                  <strong>{driver.name}</strong> will become the active driver for{' '}
                  <strong>{vehicle.registrationNo}</strong>. The current assignment with{' '}
                  <strong>{displaced}</strong> will be closed
                  {assignedFrom ? ` on ${formatDay(previousDay(assignedFrom))}` : ''}, and kept in
                  the history.
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2 py-0.5">
                  <UserRound className="size-3" aria-hidden />
                  {displaced}
                </span>
                <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-primary">
                  <UserRound className="size-3" aria-hidden />
                  {driver.name}
                </span>
              </div>

              <label className="flex items-start gap-2 text-xs leading-snug">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-0.5 size-3.5 shrink-0 accent-[var(--primary)]"
                />
                <span>Close the current assignment and make this driver active.</span>
              </label>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || (needsConfirmation && !acknowledged)}>
              {isPending && (
                <Loader2 data-icon="inline-start" className="animate-spin" aria-hidden />
              )}
              {needsConfirmation ? 'Replace driver' : 'Assign driver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/** The day before a handover starts — what the outgoing assignment ends on. */
function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() - 1)
  return date.toISOString().slice(0, 10)
}
