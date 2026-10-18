import { useVendorTripList } from '../hooks/use-vendor-trip-list'
import type { VendorRecord } from '../types'
import { VendorTripBoard } from './vendor-trip-board'

/**
 * The vendor's Trips tab on the staff workspace — every trip this vendor ran
 * for us, this month first, with the monthly bill above the list.
 *
 * The list state lives in `useVendorTripList` and the card in
 * `VendorTripBoard`, because a vendor's own page composes the same two with the
 * bill moved up into its hero. Mounted only while the tab is showing, so the
 * other five tabs never pay for this request.
 */
export function VendorTripPanel({ vendor }: { vendor: VendorRecord }) {
  const list = useVendorTripList(vendor.id)

  return <VendorTripBoard vendor={vendor} list={list} showBill />
}
