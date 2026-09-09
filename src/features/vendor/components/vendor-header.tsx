import { useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Camera,
  ChevronLeft,
  MapPin,
  PencilLine,
  Phone,
  ShieldCheck,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { MAX_PHOTO_BYTES, isAllowedPhoto } from '../lib/photo-rules'
import type { VendorRecord } from '../types'
import { VendorStatusBadge } from './status-badges'
import { VendorAvatar } from './vendor-identity'

interface VendorHeaderProps {
  vendor: VendorRecord
  canManage: boolean
  /** False on `/my-vendor`, where there is no directory to go back to. */
  showBackLink: boolean
  isPhotoPending: boolean
  onEdit: () => void
  onChangeStatus: () => void
  onDelete: () => void
  onPhotoChosen: (file: File) => void
  onPhotoRemoved: () => void
}

/**
 * Who this vendor is, at the top of every tab.
 *
 * Deliberately not a hero image or a gradient: this is an operations record, and
 * what somebody needs at a glance is the name, the code they will quote, whether
 * the vendor can take work, and how to ring them. Everything else is a tab away.
 *
 * The status badge sits beside the name rather than in a corner, because on a
 * suspended vendor it is the most important thing on the page — every "add" and
 * "assign" button below it will be refused, and this is the sentence that
 * explains why.
 */
export function VendorHeader({
  vendor,
  canManage,
  showBackLink,
  isPhotoPending,
  onEdit,
  onChangeStatus,
  onDelete,
  onPhotoChosen,
  onPhotoRemoved,
}: VendorHeaderProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="mb-6">
      {showBackLink && (
        <Link
          to="/vendors"
          className="mb-3 inline-flex items-center gap-1 rounded-sm text-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          All vendors
        </Link>
      )}

      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="relative shrink-0">
              <VendorAvatar
                name={vendor.name}
                photoUrl={vendor.photoUrl}
                className="size-14 rounded-xl text-base sm:size-16"
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
                    aria-label="Change vendor photo"
                    title={`JPG, PNG or WEBP, up to ${MAX_PHOTO_BYTES / (1024 * 1024)} MB`}
                    disabled={isPhotoPending}
                    onClick={() => fileInput.current?.click()}
                    className="absolute -right-1.5 -bottom-1.5 size-7 rounded-full bg-card shadow-sm"
                  >
                    <Camera className="size-3.5" aria-hidden />
                  </Button>
                </>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold tracking-tight wrap-break-word sm:text-xl">
                  {vendor.name}
                </h2>
                <VendorStatusBadge value={vendor.status} />
              </div>

              <p className="mt-1 font-mono text-xs text-muted-foreground">{vendor.vendorCode}</p>

              <div className="mt-2.5 flex flex-col gap-1.5 text-[13px] text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                <a
                  href={`tel:${vendor.mobile.replace(/\s/g, '')}`}
                  className="inline-flex items-center gap-1.5 rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Phone className="size-3.5 shrink-0" aria-hidden />
                  {vendor.mobile}
                </a>

                {vendor.address && (
                  <span className="inline-flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span className="wrap-break-word">{vendor.address}</span>
                  </span>
                )}
              </div>

              {vendor.statusNote && (
                <p className="mt-2.5 rounded-lg border border-tone-amber/25 bg-tone-amber/10 px-2.5 py-1.5 text-xs leading-snug text-tone-amber">
                  {vendor.statusNote}
                </p>
              )}
            </div>
          </div>

          {canManage && (
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <PencilLine data-icon="inline-start" aria-hidden />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" size="sm" aria-label="More vendor actions" />
                  }
                >
                  More
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onChangeStatus}>
                    <ShieldCheck aria-hidden />
                    Change status
                  </DropdownMenuItem>
                  {vendor.photoUrl && (
                    <DropdownMenuItem disabled={isPhotoPending} onClick={onPhotoRemoved}>
                      <Camera aria-hidden />
                      Remove photo
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onDelete}>
                    <Trash2 aria-hidden />
                    Remove vendor
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <p className="mt-4 border-t pt-3 text-[11px] text-muted-foreground/80">
          Added {formatDate(vendor.createdAt)}
          {vendor.createdBy ? ` by ${vendor.createdBy.name}` : ''}
          {vendor.statusChangedAt
            ? ` · Status last changed ${formatDate(vendor.statusChangedAt)}${
                vendor.statusChangedBy ? ` by ${vendor.statusChangedBy.name}` : ''
              }`
            : ''}
        </p>
      </div>
    </div>
  )
}

/** The header's shape while the record is still in flight. No layout jump. */
export function VendorHeaderSkeleton() {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <ArrowLeft className="size-3.5" aria-hidden />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-5" aria-busy="true">
        <div className="flex items-start gap-4">
          <Skeleton className="size-14 rounded-xl sm:size-16" />
          <div className="flex-1 space-y-2.5">
            <Skeleton className="h-5 w-52 max-w-full" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
