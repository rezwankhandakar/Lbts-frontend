import { ExternalLink, Info, Loader2, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ChallanEntryForm } from '@/features/challan/components/challan-entry-form'
import { ChallanStatusBadge } from '@/features/challan/components/challan-status-badge'
import { useUpdateChallan } from '@/features/challan/hooks/use-challan-mutations'
import { useChallan } from '@/features/challan/hooks/use-challans'
import { formatRange } from '@/features/challan/lib/challan-meta'
import { toFormValues } from '@/features/challan/schemas/challan-schemas'
import { formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface CorrectChallanDialogProps {
  challanId: string
  /** What the cart already knows it is called, so the header reads before the fetch lands. */
  challanNumber: string
  onOpenChange: (open: boolean) => void
  /** Told once the record is rewritten, so the cart can take the challan again. */
  onCorrected: (challanId: string) => void
}

/**
 * Correcting the filed challan without leaving the trip.
 *
 * This used to open `/challan/:id/edit` in a second tab, and the tab was the
 * problem rather than the page: the operator is halfway through loading a
 * lorry, the cart lives in browser memory and nothing persists it, so sending
 * them away to fix a transcribed model meant leaving an unsaved trip behind a
 * window they then had to find their way back out of. The correction belongs
 * where the mistake is noticed.
 *
 * It is the Challan module's own form and the Challan module's own mutation,
 * composed by import — the rule this feature already follows for the vendor
 * badges and the product type-ahead. **So this is a real correction to the
 * filed challan, not to the trip's copy of it:** the record is rewritten, its
 * barcode back page is redrawn, its stored PDF is replaced and it is marked
 * `Amended`, exactly as it would be from the challan's own page. Every other
 * trip carrying that challan reads the correction too. The notice above the
 * form says so before anything is saved, because somebody holding a printed
 * copy needs to reprint it.
 *
 * A challan already on other trips is corrected all the same, and those trips
 * follow it on the server. What still comes back as a refusal is reported as
 * it arrives: a quantity cut that two lorries would have to share, a trip left
 * carrying nothing of the challan, and a role that may not write challans.
 * None is re-implemented in the browser — the one place that can answer them
 * is the one that reads every trip.
 *
 * What it deliberately does not carry is the stored document beside the form.
 * The edit page shows it because a correction has to be checked against
 * something and there is nothing else on that page; here the operator is
 * standing over the paper challan itself, and a PDF frame with its own
 * fullscreen dialog nested inside this one would buy a worse copy of what is
 * already in their hand. The link in the notice opens the stored pages.
 *
 * The page range is not editable, for the same reason it is not on the edit
 * page: it records which pages of a file that no longer exists these were.
 */
export function CorrectChallanDialog({
  challanId,
  challanNumber,
  onOpenChange,
  onCorrected,
}: CorrectChallanDialogProps) {
  const t = useT()

  const query = useChallan(challanId)
  const record = query.data ?? null
  const update = useUpdateChallan()

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[96svh] w-[98vw] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none lg:w-[62rem]">
        <header className="border-b px-4 py-3 pe-12 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-base font-semibold tracking-tight">
              {t('challan.details.correctTitle')}
            </DialogTitle>
            <span className="font-mono text-sm font-bold tracking-tight">{challanNumber}</span>
            {record && <ChallanStatusBadge status={record.status} />}
          </div>
          <DialogDescription className="mt-1 text-xs leading-relaxed">
            {record
              ? t('challan.details.editSubtitle', {
                  challan: record.challanNumber,
                  sl: formatNumber(record.slNumber),
                })
              : t('delivery.correct.loading')}
          </DialogDescription>
        </header>

        {query.isPending && (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <Loader2 className="size-6 animate-spin" aria-hidden />
          </div>
        )}

        {!query.isPending && !record && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
              <TriangleAlert className="size-5" aria-hidden />
            </div>
            <p className="mt-4 text-sm font-semibold">{t('challan.details.notFound')}</p>
            <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
              {query.error?.message ?? t('challan.details.notFoundHint')}
            </p>
            <Button variant="outline" size="sm" className="mt-5" onClick={() => onOpenChange(false)}>
              {t('common.actions.cancel')}
            </Button>
          </div>
        )}

        {record && (
          /* The form brings its own sticky footer, so it scrolls inside this
             box rather than the box growing to fit three field groups. */
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-2 border-b bg-tone-amber/5 px-4 py-2.5 text-xs leading-relaxed sm:px-5">
              <p className="flex items-start gap-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-tone-amber" aria-hidden />
                <span>
                  <span className="font-semibold">{t('delivery.correct.changesChallan')}</span>{' '}
                  {t('challan.details.regeneratesNote', {
                    range: formatRange(
                      { startPage: record.sourcePageStart, endPage: record.sourcePageEnd },
                      t,
                    ),
                    file: record.sourceFileName,
                  })}
                </span>
              </p>
              <p className="flex items-start gap-2 text-muted-foreground">
                <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                <span>{t('delivery.correct.retakeNote')}</span>
              </p>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs"
                onClick={() => window.open(`/challan/${record.id}`, '_blank', 'noopener')}
              >
                <ExternalLink data-icon="inline-start" aria-hidden />
                {t('delivery.cart.openChallan')}
              </Button>
            </div>

            <ChallanEntryForm
              defaultValues={toFormValues(record)}
              isBusy={update.isPending}
              submitLabel={t('challan.details.saveAndRegenerate')}
              secondaryAction={{
                label: t('common.actions.cancel'),
                onClick: () => onOpenChange(false),
              }}
              onSubmit={(values) =>
                update.mutate(
                  { id: record.id, values },
                  {
                    onSuccess: () => {
                      onCorrected(record.id)
                      onOpenChange(false)
                    },
                  },
                )
              }
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
