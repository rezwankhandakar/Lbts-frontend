import { useRef } from 'react'
import { Camera, FileText, History, IdCard, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPeriod } from '../lib/vendor-meta'
import { MAX_PHOTO_BYTES, isAllowedPhoto } from '../lib/photo-rules'
import type { AssignmentRecord, DocumentRecord, DriverDetail } from '../types'
import { InfoRow } from './form-parts'
import {
  AssignmentStatusBadge,
  DocumentStatusBadge,
  DriverStatusBadge,
} from './status-badges'
import { DriverAvatar } from './vendor-identity'

interface DriverDetailSheetProps {
  driver: DriverDetail | null
  vendorName: string
  assignments: AssignmentRecord[] | undefined
  documents: DocumentRecord[] | undefined
  isLoading: boolean
  canManage: boolean
  isPhotoPending: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onPhotoChosen: (file: File) => void
}

function SubSection({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: typeof History
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <h3 className="flex items-center gap-2 border-b pb-1.5 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" aria-hidden />
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * One driver, in a side sheet.
 *
 * This is the **only** surface in the module that shows the NID and the home
 * address. Neither is on the list shape the API sends, so a fleet table cannot
 * leak them even by accident; they are here because somebody who has opened one
 * driver, deliberately, is the person who needs them.
 *
 * The assignment history underneath is what makes the record worth keeping: a
 * driver who has moved between three vehicles this quarter can say which one
 * they were on in August, because every changeover appended a row rather than
 * overwriting a field.
 */
export function DriverDetailSheet({
  driver,
  vendorName,
  assignments,
  documents,
  isLoading,
  canManage,
  isPhotoPending,
  open,
  onOpenChange,
  onPhotoChosen,
}: DriverDetailSheetProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  if (!driver) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2.5">
            <span className="relative shrink-0">
              <DriverAvatar name={driver.name} photoUrl={driver.photoUrl} className="size-10" />
              {canManage && (
                <>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      event.target.value = ''
                      if (file && isAllowedPhoto(file)) {
                        onPhotoChosen(file)
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Change driver photo"
                    title={`JPG, PNG or WEBP, up to ${MAX_PHOTO_BYTES / (1024 * 1024)} MB`}
                    disabled={isPhotoPending}
                    onClick={() => fileInput.current?.click()}
                    className="absolute -right-1 -bottom-1 size-6 rounded-full bg-card shadow-sm"
                  >
                    <Camera className="size-3" aria-hidden />
                  </Button>
                </>
              )}
            </span>
            <span className="min-w-0 wrap-break-word">{driver.name}</span>
          </SheetTitle>
          <SheetDescription>
            {driver.driverCode} · {vendorName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <DriverStatusBadge value={driver.status} />
            {driver.licenceStatus && <DocumentStatusBadge value={driver.licenceStatus} />}
          </div>

          {driver.statusNote && (
            <p className="rounded-lg border border-tone-amber/25 bg-tone-amber/10 px-2.5 py-1.5 text-xs leading-snug text-tone-amber">
              {driver.statusNote}
            </p>
          )}

          <SubSection title="Contact" icon={UserRound}>
            <dl className="divide-y">
              <InfoRow label="Mobile">
                <a
                  href={`tel:${driver.mobile.replace(/\s/g, '')}`}
                  className="rounded-sm outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {driver.mobile}
                </a>
              </InfoRow>
              <InfoRow label="Address">
                {driver.address || <span className="text-muted-foreground">Not recorded</span>}
              </InfoRow>
              <InfoRow label="NID number">
                {driver.nidNumber || <span className="text-muted-foreground">Not recorded</span>}
              </InfoRow>
            </dl>
          </SubSection>

          <SubSection title="Licence" icon={IdCard}>
            <dl className="divide-y">
              <InfoRow label="Licence number">
                {driver.licenseNumber || (
                  <span className="text-muted-foreground">Not recorded</span>
                )}
              </InfoRow>
              <InfoRow label="Expiry">
                {driver.licencePhrase ?? (
                  <span className="text-muted-foreground">No expiry recorded</span>
                )}
              </InfoRow>
              <InfoRow label="Current vehicle">
                {driver.currentVehicle ? (
                  driver.currentVehicle.registrationNo
                ) : (
                  <span className="text-muted-foreground">Not assigned</span>
                )}
              </InfoRow>
            </dl>
          </SubSection>

          <SubSection title="Documents" icon={FileText}>
            {isLoading ? (
              <div className="space-y-2" aria-busy="true">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (documents?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No documents have been filed for this driver yet.
              </p>
            ) : (
              <ul className="divide-y">
                {documents?.map((document) => (
                  <li key={document.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{document.documentType}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {document.documentNumber || 'No number recorded'} · {document.expiryPhrase}
                      </p>
                    </div>
                    <DocumentStatusBadge value={document.status} />
                  </li>
                ))}
              </ul>
            )}
          </SubSection>

          <SubSection title="Assignment history" icon={History}>
            {isLoading ? (
              <div className="space-y-2" aria-busy="true">
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (assignments?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                This driver has not been assigned to a vehicle yet.
              </p>
            ) : (
              <ul className="divide-y">
                {assignments?.map((assignment) => (
                  <li
                    key={assignment.id}
                    className="flex items-start justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">
                        {assignment.vehicle?.registrationNo ?? 'Removed vehicle'}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatPeriod(assignment.assignedFrom, assignment.assignedUntil)}
                      </p>
                    </div>
                    <AssignmentStatusBadge value={assignment.status} />
                  </li>
                ))}
              </ul>
            )}
          </SubSection>
        </div>
      </SheetContent>
    </Sheet>
  )
}
