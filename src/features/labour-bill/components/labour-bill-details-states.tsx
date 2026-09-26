import { ArrowLeft, RefreshCcw, ScanBarcode, TriangleAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useT } from '@/lib/i18n'

/** The labour bill page while it loads: the hero and the sheet as shapes, so nothing jumps when it lands. */
export function LabourBillDetailsSkeleton() {
  const t = useT()

  return (
    <div className="mx-auto w-full max-w-[1600px]" aria-busy="true">
      <span className="sr-only">{t('labourBill.details.loading')}</span>
      <Skeleton className="mb-5 h-[15rem] rounded-2xl" />
      <Skeleton className="mb-5 h-[4.5rem] rounded-xl" />
      <Skeleton className="h-[24rem] rounded-xl" />
    </div>
  )
}

export function LabourBillDetailsError({
  message,
  isRetrying,
  onRetry,
}: {
  message: string
  isRetrying: boolean
  onRetry: () => void
}) {
  const t = useT()

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center px-6 py-20 text-center" role="alert">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive ring-1 ring-destructive/20">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">
        {t('labourBill.details.openFailed')}
      </h1>
      <p className="mt-1.5 text-sm text-pretty text-muted-foreground">{message}</p>
      <div className="mt-5 flex gap-2">
        <Link to="/labour-bills" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          <ArrowLeft data-icon="inline-start" aria-hidden />
          {t('labourBill.allBills')}
        </Link>
        <Button size="sm" onClick={onRetry} disabled={isRetrying}>
          <RefreshCcw data-icon="inline-start" aria-hidden />
          {isRetrying ? t('labourBill.list.retrying') : t('common.actions.retry')}
        </Button>
      </div>
    </div>
  )
}

/** A labour bill with nothing on it yet: the one thing to do next, said once. */
export function EmptyLabourSheet({ canScan }: { canScan: boolean }) {
  const t = useT()

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
        <ScanBarcode className="size-6" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-semibold tracking-tight">
        {t('labourBill.details.noRows')}
      </h3>
      <p className="mt-1.5 max-w-md text-sm text-pretty text-muted-foreground">
        {canScan
          ? t('labourBill.details.scanHint')
          : t('labourBill.details.noRowsHint')}
      </p>
    </div>
  )
}
