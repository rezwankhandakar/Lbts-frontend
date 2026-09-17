import { useQueryClient } from '@tanstack/react-query'
import { LoaderCircle, Printer } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { ApiError } from '@/lib/axios'
import { fetchVendorBill } from '../api/accounts-api'
import { accountsKeys, reportAccountsError } from '../hooks/use-accounts'
import { printVendorStatement } from '../lib/print-vendor-statement'
import type { Period, VendorBillDetail } from '../types'

interface VendorStatementButtonProps {
  vendorId: string
  vendorName: string
  period: Period
  /** The month already on screen. Without it the button reads it first, through the same query the vendor page uses. */
  detail?: VendorBillDetail
  /** Icon only, for a row in the vendor list. */
  compact?: boolean
}

/**
 * Prints a vendor's monthly trip bill statement. Open to every Accounts reader:
 * printing writes nothing.
 */
export function VendorStatementButton({
  vendorId,
  vendorName,
  period,
  detail,
  compact = false,
}: VendorStatementButtonProps) {
  const queryClient = useQueryClient()
  const [isPreparing, setIsPreparing] = useState(false)

  const print = async () => {
    if (detail) {
      printVendorStatement(detail)
      return
    }
    setIsPreparing(true)
    try {
      const fetched = await queryClient.fetchQuery({
        queryKey: accountsKeys.vendorBill(vendorId, period),
        queryFn: () => fetchVendorBill(vendorId, period),
        staleTime: 10_000,
        retry: 2,
      })
      printVendorStatement(fetched)
    } catch (error) {
      reportAccountsError(error as ApiError)
    } finally {
      setIsPreparing(false)
    }
  }

  const icon = isPreparing ? (
    <LoaderCircle className="animate-spin" aria-hidden />
  ) : (
    <Printer aria-hidden />
  )

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => void print()}
        disabled={isPreparing}
        aria-label={`Print ${vendorName}'s statement`}
        title="Print statement"
      >
        {icon}
      </Button>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void print()} disabled={isPreparing}>
      {isPreparing ? (
        <LoaderCircle data-icon="inline-start" className="animate-spin" aria-hidden />
      ) : (
        <Printer data-icon="inline-start" aria-hidden />
      )}
      Print statement
    </Button>
  )
}
