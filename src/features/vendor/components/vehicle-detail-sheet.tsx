import { useRef } from 'react'
import { Camera, FileText, History, Trash2, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { MAX_PHOTO_BYTES, isAllowedPhoto } from '../lib/photo-rules'
import { formatDay, formatPeriod } from '../lib/vendor-meta'
import type { AssignmentRecord, DocumentRecord, VehicleRecord } from '../types'
import { InfoRow } from './form-parts'
import { VehicleAvatar } from './vendor-identity'
import {
  AssignmentStatusBadge,
  DocumentStatusBadge,
  OwnershipBadge,
  VehicleStatusBadge,
} from './status-badges'

interface VehicleDetailSheetProps {
  vehicle: VehicleRecord | null
  vendorName: string
  assignments: AssignmentRecord[] | undefined
  documents: DocumentRecord[] | undefined
  isLoading: boolean
  /** Write controls are absent rather than disabled for a read-only account. */
  canManage: boolean
  isPhotoPending: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  onPhotoChosen: (file: File) => void
  onPhotoRemoved: () => void
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
 * One vehicle, in a side sheet.
 *
 * A sheet rather than a page, and that is a deliberate contrast with the Challan
 * module's location editor, which *is* a page. The difference is what the
 * surface is for: settling a location means reading several lines of transcribed
 * address against a master list and choosing, which a box only makes harder,
 * whereas this is reading — three facts, a document list and a history — with no
 * decision in it. A sheet keeps the fleet table behind it, so closing one
 * vehicle and opening the next is a click rather than a navigation.
 *
 * The assignment history is the part worth having. A vehicle that carries no
 * `currentDriverId` can still say who was driving it on the eleventh, and this
 * is where that is read.
 */
export function VehicleDetailSheet({
  vehicle,
  vendorName,
  assignments,
  documents,
  isLoading,
  canManage,
  isPhotoPending,
  open,
  onOpenChange,
  onPhotoChosen,
  onPhotoRemoved,
}: VehicleDetailSheetProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  if (!vehicle) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2.5">
            <span className="relative shrink-0">
              <VehicleAvatar
                photoUrl={vehicle.photoUrl}
                label={vehicle.registrationNo}
                caption={vehicle.vehicleCode}
                className="size-12"
              />
              {canManage && (
                <>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      // Reset first, so choosing the same file twice still fires.
                      event.target.value = ''
                      if (file && isAllowedPhoto(file)) {
                        onPhotoChosen(file)
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={`${vehicle.photoUrl ? 'Change' : 'Add'} vehicle photo`}
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
            <span className="min-w-0 wrap-break-word">{vehicle.registrationNo}</span>
          </SheetTitle>
          <SheetDescription>
            {vehicle.vehicleCode} · {vendorName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <VehicleStatusBadge value={vehicle.status} />
            <OwnershipBadge value={vehicle.ownershipType} />
            {canManage && vehicle.photoUrl && (
              <Button
                variant="ghost"
                size="sm"
                disabled={isPhotoPending}
                onClick={onPhotoRemoved}
                className="ml-auto h-7 px-2 text-xs text-muted-foreground"
              >
                <Trash2 data-icon="inline-start" className="size-3.5" aria-hidden />
                Remove photo
              </Button>
            )}
          </div>

          {vehicle.statusNote && (
            <p className="rounded-lg border border-tone-amber/25 bg-tone-amber/10 px-2.5 py-1.5 text-xs leading-snug text-tone-amber">
              {vehicle.statusNote}
            </p>
          )}

          <SubSection title="Information" icon={Truck}>
            <dl className="divide-y">
              <InfoRow label="Brand">{vehicle.brand || '—'}</InfoRow>
              <InfoRow label="Model">{vehicle.model || '—'}</InfoRow>
              <InfoRow label="Vendor">{vendorName}</InfoRow>
              <InfoRow label="Current driver">
                {vehicle.currentDriver ? (
                  <>
                    {vehicle.currentDriver.name}
                    <span className="block text-xs text-muted-foreground">
                      {vehicle.currentDriver.mobile} · since{' '}
                      {formatDay(vehicle.currentDriver.assignedFrom)}
                    </span>
                  </>
                ) : (
                  <span className="text-muted-foreground">No driver assigned</span>
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
                No documents have been filed for this vehicle yet.
              </p>
            ) : (
              <ul className="divide-y">
                {documents?.map((document) => (
                  <li
                    key={document.id}
                    className="flex items-start justify-between gap-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{document.documentType}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {document.documentNumber || 'No number recorded'} ·{' '}
                        {document.expiryPhrase}
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
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (assignments?.length ?? 0) === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">
                No driver has been assigned to this vehicle yet.
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
                        {assignment.driver?.name ?? 'Removed driver'}
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
