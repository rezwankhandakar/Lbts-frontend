import { taka } from '@/features/delivery/lib/delivery-meta'
import { useT } from '@/lib/i18n'

/** A blank bill says so rather than reading as nothing owed. */
export function TripCharge({ value }: { value: number | null }) {
  const t = useT()

  return value === null ? (
    <span className="text-xs font-medium text-tone-rose">{t('vendor.trip.notEntered')}</span>
  ) : (
    <>{taka(value)}</>
  )
}
