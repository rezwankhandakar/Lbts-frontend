import { useMemo, useState } from 'react'
import { Check, Search, Truck, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { DocumentStatusBadge } from '@/features/vendor/components/status-badges'
import { DriverAvatar } from '@/features/vendor/components/vendor-identity'
import { useAssignableDrivers } from '@/features/vendor/hooks/use-fleet'
import type { DriverRecord } from '@/features/vendor/types'

interface DriverPickerDialogProps {
  open: boolean
  vendorId: string
  vendorName: string
  selectedId: string | null
  assignedId: string | null
  canAdd: boolean
  onOpenChange: (open: boolean) => void
  onPick: (driver: DriverRecord) => void
  onAdd: () => void
}

/**
 * Choosing who drives this run, from the drivers who may.
 *
 * The list is the Vendor module's own "assignable drivers" read — the vendor's
 * `Active` drivers, and nobody else's — rather than a second query written for
 * Delivery. A driver on leave, suspended or gone is not in it, and the server
 * refuses one at confirmation regardless of what any list showed.
 *
 * Each row says which lorry that driver is normally on, because putting a
 * driver on this trip who is assigned elsewhere today is a real decision worth
 * seeing — not a refusal.
 */
export function DriverPickerDialog({
  open,
  vendorId,
  vendorName,
  selectedId,
  assignedId,
  canAdd,
  onOpenChange,
  onPick,
  onAdd,
}: DriverPickerDialogProps) {
  const t = useT()

  const [filter, setFilter] = useState('')
  const query = useAssignableDrivers(vendorId, open)

  const drivers = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    const list = query.data ?? []
    return needle
      ? list.filter((driver) =>
          [driver.name, driver.driverCode, driver.mobile, driver.licenseNumber].some((value) =>
            value.toLowerCase().includes(needle),
          ),
        )
      : list
  }, [query.data, filter])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85svh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('delivery.driver.forThisTrip')}</DialogTitle>
          <DialogDescription>
            {vendorName}&apos;s active drivers. Choosing one here does not change the vehicle&apos;s
            assigned driver.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label={t('delivery.driver.filterAria')}
            placeholder={t('delivery.driver.filterPlaceholder')}
            className="pl-8.5"
          />
        </div>

        <div className="-mx-1 min-h-40 flex-1 overflow-y-auto px-1">
          {query.isPending ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <p role="alert" className="py-6 text-center text-sm text-destructive">
              {query.error.message}
            </p>
          ) : drivers.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {filter
                ? t('delivery.driver.noMatch')
                : t('delivery.driver.vendorHasNone', { vendor: vendorName })}
            </p>
          ) : (
            <ul className="space-y-1" aria-label={t('delivery.driver.activeAria')}>
              {drivers.map((driver) => (
                <li key={driver.id}>
                  <button
                    type="button"
                    onClick={() => onPick(driver)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-colors outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring',
                      driver.id === selectedId ? 'border-primary/40 bg-primary/5' : 'border-transparent',
                    )}
                  >
                    <DriverAvatar name={driver.name} photoUrl={driver.photoUrl} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-x-2">
                        <span className="text-sm font-medium">{driver.name}</span>
                        {driver.id === assignedId && (
                          <span className="text-[11px] font-medium text-tone-indigo">
                            {t('delivery.driver.assigned')}
                          </span>
                        )}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        <span className="font-mono">{driver.driverCode}</span> · {driver.mobile}
                      </span>
                      {driver.currentVehicle && driver.id !== assignedId && (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Truck className="size-3" aria-hidden />
                          {t('delivery.driver.normallyOn', {
                            plate: driver.currentVehicle.registrationNo,
                          })}
                        </span>
                      )}
                    </span>
                    {driver.licenceStatus && <DocumentStatusBadge value={driver.licenceStatus} />}
                    {driver.id === selectedId && (
                      <Check className="size-4 shrink-0 text-primary" aria-label={t('delivery.driver.selected')} />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          {canAdd && (
            <Button type="button" variant="outline" onClick={onAdd} className="sm:mr-auto">
              <UserPlus data-icon="inline-start" aria-hidden />
              {t('delivery.driver.addNew')}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            {t('common.actions.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
