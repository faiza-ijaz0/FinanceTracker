"use client";

import FinanceCharts from "@/components/FinanceCharts";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/components/TransactionsProvider";
import { getTotalIncome } from "@/lib/finance";

export default function IncomePage() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const totalIncome = getTotalIncome(transactions);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Income"
        title="Income Tracker"
        description="Add and manage all your income sources. See how your earnings break down by category."
      />

      <div className="space-y-8">
        <StatCard
          label="Total Income"
          value={totalIncome}
          icon="↑"
          variant="income"
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm onAdd={addTransaction} fixedType="income" />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={incomeTransactions}
              onDelete={deleteTransaction}
              title="Income Transactions"
              emptyMessage="No income recorded yet. Add your first income entry."
            />
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
            Income Breakdown
          </h2>
          <FinanceCharts transactions={transactions} mode="income" />
        </section>
      </div>
    </div>
  );
}
