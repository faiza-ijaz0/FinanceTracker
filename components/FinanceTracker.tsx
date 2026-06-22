"use client";

import FinanceCharts from "@/components/FinanceCharts";
import PageHeader from "@/components/PageHeader";
import SummaryCards from "@/components/SummaryCards";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/components/TransactionsProvider";
import {
  getBalance,
  getTotalExpenses,
  getTotalIncome,
} from "@/lib/finance";

export default function FinanceTracker() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();

  const income = getTotalIncome(transactions);
  const expenses = getTotalExpenses(transactions);
  const balance = getBalance(transactions);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Personal Finance"
        title="Dashboard"
        description="Track income and expenses, see your balance at a glance. All data stays in your browser."
      />

      <div className="space-y-8">
        <SummaryCards income={income} expenses={expenses} balance={balance} />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm onAdd={addTransaction} />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={transactions}
              onDelete={deleteTransaction}
            />
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
            Quick Insights
          </h2>
          <FinanceCharts transactions={transactions} mode="all" compact />
        </section>
      </div>
    </div>
  );
}
