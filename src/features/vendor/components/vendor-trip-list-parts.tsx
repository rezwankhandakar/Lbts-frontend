import { taka } from '@/features/delivery/lib/delivery-meta'

/** A blank bill says so rather than reading as nothing owed. */
export function TripCharge({ value }: { value: number | null }) {
  return value === null ? (
    <span className="text-xs font-medium text-tone-rose">Not entered</span>
  ) : (
    <>{taka(value)}</>
  )
}
