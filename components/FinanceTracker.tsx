"use client";

import Link from "next/link";
import { useState } from "react";
import FinanceCharts from "@/components/FinanceCharts";
import PageHeader from "@/components/PageHeader";
import SummaryCards from "@/components/SummaryCards";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { useAuth } from "@/components/AuthProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import {
  getBalance,
  getMonthlyExpenses,
  getMonthlyIncome,
  getRecentTransactions,
  getTodayExpenses,
  getTotalExpenses,
  getTotalIncome,
} from "@/lib/finance";
import type { Transaction } from "@/lib/types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function FinanceTracker() {
  const { user } = useAuth();
  const { transactions, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const totalBalance = getBalance(transactions);
  const totalSavings = Math.max(0, totalBalance);
  const todayExpenses = getTodayExpenses(transactions);
  const monthlyIncome = getMonthlyIncome(transactions);
  const monthlyExpenses = getMonthlyExpenses(transactions);
  const recent = getRecentTransactions(transactions, 5);

  const firstName = user?.name.split(" ")[0] ?? "there";

  function handleUpdate(id: string, data: Omit<Transaction, "id">) {
    updateTransaction(id, data);
    setEditingTransaction(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Personal Finance"
        title={`${getGreeting()}, ${firstName}!`}
        description="Track income and expenses and see your balance at a glance."
      />

      <div className="space-y-8">
        <SummaryCards
          totalBalance={totalBalance}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
          totalSavings={totalSavings}
          todayExpenses={todayExpenses}
          monthlyIncome={monthlyIncome}
          monthlyExpenses={monthlyExpenses}
        />

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <TransactionForm
              key={editingTransaction?.id ?? "new"}
              onAdd={addTransaction}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingTransaction(null)}
              editingTransaction={editingTransaction ?? undefined}
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-3">
            <TransactionList
              transactions={recent}
              onDelete={deleteTransaction}
              onEdit={setEditingTransaction}
              title="Recent Transactions"
              emptyMessage="Add your first income or expense to get started."
            />
            {transactions.length > 5 && (
              <Link
                href="/transactions"
                className="self-end text-sm font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
              >
                View all {transactions.length} transactions →
              </Link>
            )}
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
