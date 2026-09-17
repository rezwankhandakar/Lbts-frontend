import { Plus, Receipt, Tags } from 'lucide-react'
import { useState } from 'react'
import { ListPagination } from '@/components/shared/list-pagination'
import { Button } from '@/components/ui/button'
import { Panel, StatTile } from '@/features/accounts/components/account-atoms'
import { AccountsShell } from '@/features/accounts/components/accounts-shell'
import { CashBookToolbar } from '@/features/accounts/components/cash-book-toolbar'
import { EntryList } from '@/features/accounts/components/entry-list'
import { ExpenseBreakdown } from '@/features/accounts/components/expense-breakdown'
import { PeriodStepper } from '@/features/accounts/components/period-stepper'
import { useEntries, useProfitLoss } from '@/features/accounts/hooks/use-accounts'
import { useEntryDialog } from '@/features/accounts/hooks/use-entry-dialog'
import { useEntryListParams } from '@/features/accounts/hooks/use-entry-list-params'
import { currentPeriod, periodParam, periodRange, taka } from '@/features/accounts/lib/accounts-meta'
import { canWriteAccounts } from '@/features/accounts/types'
import type { Period } from '@/features/accounts/types'
import { useCurrentRole } from '@/hooks/use-current-role'

export function AccountsExpensesPage() {
  return (
    <AccountsShell
      title="Expenses"
      description="Every office expense, month by month, grouped by the name it was recorded under. Type the name when you add an expense — names used before are suggested."
    >
      <ExpensesBody />
    </AccountsShell>
  )
}

/** Inside the shell, so the entry form it opens is the module's one. */
function ExpensesBody() {
  const canWrite = canWriteAccounts(useCurrentRole())
  const dialog = useEntryDialog()
  const [period, setPeriod] = useState<Period>(currentPeriod)
  const range = periodRange(period)
  const list = useEntryListParams({ from: range.from, to: range.to }, { kind: 'Expense' })
  const report = useProfitLoss(periodParam(period), periodParam(period))
  const query = useEntries(list.applied)
  const meta = query.data?.meta
  const month = report.data?.months[0]

  const changePeriod = (next: Period) => {
    setPeriod(next)
    const bounds = periodRange(next)
    list.applyFilters({ from: bounds.from, to: bounds.to, expenseName: '' })
  }

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodStepper period={period} onChange={changePeriod} />
        {canWrite && (
          <Button onClick={() => dialog.open({ kind: 'Expense', preset: { date: range.defaultDay } })}>
            <Plus data-icon="inline-start" aria-hidden />
            Add expense
          </Button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Office expenses" value={taka(month?.officeExpense ?? 0)} hint="Every office expense this month" icon={Receipt} tone="rose" isLoading={report.isPending} />
        <StatTile label="Expense names used" value={String(report.data?.expenseByName.length ?? 0)} hint="This month" icon={Tags} tone="violet" isLoading={report.isPending} />
        <StatTile label="Trip rent + labour" value={taka((month?.tripRent ?? 0) + (month?.labourBill ?? 0))} hint="For comparison — from vendor trip bills" icon={Receipt} tone="orange" isLoading={report.isPending} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.6fr]">
        <Panel title="By expense name" description="Press one to see only its expenses.">
          <ExpenseBreakdown
            report={report.data}
            selectedName={list.params.expenseName}
            onSelect={(expenseName) => list.applyFilters({ expenseName })}
          />
        </Panel>

        <section aria-label="Expenses" className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <CashBookToolbar params={list.params} onChange={list.applyFilters} onReset={list.reset} isFiltered={list.isFiltered} showKind={false} />
          <EntryList
            records={query.data?.records ?? []}
            isLoading={query.isPending}
            errorMessage={query.isError ? query.error.message : null}
            onRetry={() => void query.refetch()}
            canWrite={canWrite}
            emptyTitle="No expenses here"
            emptyDescription="Office rent, bills, salary, conveyance — any cost the office pays is an expense."
          />
          {meta && !query.isError && (
            <ListPagination meta={meta} onPageChange={list.setPage} isFetching={query.isFetching} noun={['expense', 'expenses']} />
          )}
        </section>
      </div>
    </div>
  )
}
