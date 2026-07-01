"use client";

import { useState } from "react";
import FinanceCharts from "@/components/FinanceCharts";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { useTransactions } from "@/components/TransactionsProvider";
import { getTotalExpenses } from "@/lib/finance";
import type { Transaction } from "@/lib/types";

export default function ExpensesPage() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const expenseTransactions = transactions.filter((t) => t.type === "expense");
  const totalExpenses = getTotalExpenses(transactions);

  function handleUpdate(id: string, data: Omit<Transaction, "id">) {
    updateTransaction(id, data);
    setEditingTransaction(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Expenses"
        title="Expense Tracker"
        description="Track where your money goes. Manage expenses and see spending by category."
      />

      <div className="space-y-8">
        <StatCard
          label="Total Expenses"
          value={totalExpenses}
          icon="↓"
          variant="expense"
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm
              key={editingTransaction?.id ?? "new"}
              onAdd={addTransaction}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingTransaction(null)}
              editingTransaction={editingTransaction ?? undefined}
              fixedType="expense"
            />
          </div>
          <div className="lg:col-span-3">
            <TransactionList
              transactions={expenseTransactions}
              onDelete={deleteTransaction}
              onEdit={setEditingTransaction}
              title="Expense Transactions"
              emptyMessage="No expenses recorded yet. Add your first expense entry."
            />
          </div>
        </div>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-slate-900 dark:text-white">
            Expense Breakdown
          </h2>
          <FinanceCharts transactions={transactions} mode="expense" />
        </section>
      </div>
    </div>
  );
}
