"use client";

import FinanceCharts from "@/components/FinanceCharts";
import PageHeader from "@/components/PageHeader";
import { useTransactions } from "@/components/TransactionsProvider";
import {
  formatCurrency,
  getCurrentMonthCategoryBreakdown,
  getMonthlyExpenses,
  getMonthlyIncome,
} from "@/lib/finance";

export default function ChartsPage() {
  const { transactions } = useTransactions();
  const categoryBreakdown = getCurrentMonthCategoryBreakdown(transactions);
  const monthlyIncome = getMonthlyIncome(transactions);
  const monthlyExpenses = getMonthlyExpenses(transactions);
  const monthlySavings = monthlyIncome - monthlyExpenses;

  const now = new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Analytics"
        title="Charts & Insights"
        description="Visualize your income, expenses, and financial trends with interactive charts."
      />

      <div className="space-y-10">
        {/* All charts */}
        <FinanceCharts transactions={transactions} mode="all" />

        {/* Monthly spending analysis */}
        <section>
          <h2 className="mb-1 text-xl font-semibold text-slate-900 dark:text-white">
            Monthly Spending Analysis
          </h2>
          <p className="mb-5 text-sm text-slate-500">{monthName}</p>

          {/* Month summary row */}
          <div className="mb-5 grid grid-cols-3 gap-4">
            {[
              {
                label: "Income",
                value: monthlyIncome,
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                label: "Expenses",
                value: monthlyExpenses,
                color: "text-rose-600 dark:text-rose-400",
                bg: "bg-rose-500/10",
              },
              {
                label: "Net Savings",
                value: monthlySavings,
                color:
                  monthlySavings >= 0
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-amber-600 dark:text-amber-400",
                bg: monthlySavings >= 0 ? "bg-violet-500/10" : "bg-amber-500/10",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm text-slate-500">{item.label}</p>
                <p className={`mt-1 text-xl font-bold ${item.color}`}>
                  {formatCurrency(item.value)}
                </p>
              </div>
            ))}
          </div>

          {/* Category breakdown */}
          {categoryBreakdown.length > 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  Top Expense Categories
                </h3>
                <p className="text-sm text-slate-500">
                  Where your money went this month
                </p>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-white/5">
                {categoryBreakdown.map((item) => (
                  <li key={item.category} className="flex items-center gap-4 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {item.category}
                        </span>
                        <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-10 shrink-0 text-right text-sm font-medium text-slate-500">
                      {item.percentage}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/5">
              <p className="text-4xl">📊</p>
              <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
                No expenses this month yet
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add some expenses to see your spending breakdown.
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
