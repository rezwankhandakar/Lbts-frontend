import { ActivityFeed } from '@/features/activity/components/activity-feed'
import { useVendorActivity } from '@/features/activity/hooks/use-activity'

interface VendorActivityPanelProps {
  vendorId: string
  vendorName: string
}

/**
 * What has happened to this vendor.
 *
 * The tab that was taken out when the journal had nowhere to be presented
 * from. CLAUDE.md recorded it as removed "until an Activity module exists to
 * present them", with `GET /vendors/:id/activity` and every write kept so that
 * module would inherit a complete history — this is the other half of that
 * sentence.
 *
 * It **composes** `ActivityFeed` rather than drawing rows of its own, the rule
 * Delivery follows for the vendor badges it borrows: what a row means, what it
 * is coloured and what its detail sheet shows are decided in the module that
 * owns them. A second rendering here is how one of them would come to disagree
 * about whether a deletion is red.
 *
 * Read-only for everyone, including an Admin, because the journal is read-only
 * for everyone — there is no write endpoint in that module at all. So there is
 * no `canManage` here to thread through, and nothing to hide from a Vendor
 * account beyond what `vendorScopeOf` already scopes on the server.
 *
 * It carries the trips too. A trip is assigned *to* a vendor and the Delivery
 * module journals `trip.*` against this vendor's scope precisely so this is
 * where somebody looks for it — which is why the tab is worth having beside
 * the Trips tab rather than being covered by it.
 */
export function VendorActivityPanel({ vendorId, vendorName }: VendorActivityPanelProps) {
  const query = useVendorActivity(vendorId)

  return (
    <section className="rounded-xl border bg-card p-3 shadow-sm sm:p-4">
      <header className="mb-3 border-b pb-3">
        <h2 className="text-sm font-semibold tracking-tight">Recent activity</h2>
        <p className="mt-1 text-xs text-muted-foreground text-pretty">
          Changes to {vendorName}, its fleet, its drivers and the trips it has run — newest first.
          Written as people work, and never edited.
        </p>
      </header>

      <ActivityFeed
        records={query.data ?? []}
        isLoading={query.isPending}
        isError={query.isError}
        errorMessage={query.error?.message}
        emptyTitle="Nothing recorded yet"
        emptyDescription={`Adding a vehicle, assigning a driver, filing a document or running a trip for ${vendorName} will appear here.`}
      />
    </section>
  )
}
