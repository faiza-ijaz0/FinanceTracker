"use client";

import FinanceCharts from "@/components/FinanceCharts";
import PageHeader from "@/components/PageHeader";
import { useTransactions } from "@/components/TransactionsProvider";

export default function ChartsPage() {
  const { transactions } = useTransactions();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Analytics"
        title="Charts & Insights"
        description="Visualize your income, expenses, and monthly trends with interactive charts."
      />
      <FinanceCharts transactions={transactions} mode="all" />
    </div>
  );
}
