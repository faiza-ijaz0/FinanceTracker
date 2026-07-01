"use client";

import PageHeader from "@/components/PageHeader";
import { useTransactions } from "@/components/TransactionsProvider";
import {
  formatCurrency,
  getAvgMonthlySpending,
  getBiggestCategory,
  getHighestExpense,
  getLowestExpense,
  getMonthlyBreakdownTable,
  getSavingsRate,
  getTotalExpenses,
  getTotalIncome,
} from "@/lib/finance";

function StatCard({
  label,
  value,
  sub,
  color = "violet",
}: {
  label: string;
  value: string;
  sub?: string;
  color?: "violet" | "emerald" | "rose" | "amber";
}) {
  const colorMap = {
    violet: "text-violet-600 dark:text-violet-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colorMap[color]}`}>{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

export default function StatisticsPage() {
  const { transactions } = useTransactions();

  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const highestExpense = getHighestExpense(transactions);
  const lowestExpense = getLowestExpense(transactions);
  const avgMonthly = getAvgMonthlySpending(transactions);
  const biggestCategory = getBiggestCategory(transactions);
  const savingsRate = getSavingsRate(transactions);
  const monthlyTable = getMonthlyBreakdownTable(transactions);

  const months = new Set(
    transactions.map((t) => t.date.slice(0, 7))
  ).size;

  if (transactions.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          badge="Analytics"
          title="Statistics"
          description="Deep insights into your financial patterns and habits."
        />
        <div className="rounded-2xl border border-dashed border-slate-200 p-16 text-center dark:border-white/10">
          <p className="text-5xl">📈</p>
          <p className="mt-4 font-medium text-slate-700 dark:text-slate-300">
            No data yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add some transactions to see your financial statistics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Analytics"
        title="Statistics"
        description="Deep insights into your financial patterns and habits."
      />

      {/* Overview cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          sub={`across ${months} month${months !== 1 ? "s" : ""}`}
          color="emerald"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          sub={`across ${months} month${months !== 1 ? "s" : ""}`}
          color="rose"
        />
        <StatCard
          label="Overall Savings Rate"
          value={`${savingsRate}%`}
          sub="of total income saved"
          color={savingsRate >= 20 ? "emerald" : savingsRate >= 10 ? "amber" : "rose"}
        />
        <StatCard
          label="Highest Single Expense"
          value={highestExpense ? formatCurrency(highestExpense.amount) : "—"}
          sub={
            highestExpense
              ? `${highestExpense.description} · ${highestExpense.category}`
              : undefined
          }
          color="rose"
        />
        <StatCard
          label="Lowest Single Expense"
          value={lowestExpense ? formatCurrency(lowestExpense.amount) : "—"}
          sub={
            lowestExpense
              ? `${lowestExpense.description} · ${lowestExpense.category}`
              : undefined
          }
          color="violet"
        />
        <StatCard
          label="Avg Monthly Spending"
          value={formatCurrency(avgMonthly)}
          sub="per month"
          color="amber"
        />
      </div>

      {/* Biggest category */}
      {biggestCategory && (
        <div className="mb-8 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-50 to-indigo-50 p-5 dark:border-violet-500/20 dark:from-violet-500/10 dark:to-indigo-500/10">
          <p className="text-sm text-violet-600 dark:text-violet-400">
            Biggest Spending Category
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {biggestCategory.category}
          </p>
          <p className="text-sm text-slate-500">
            {formatCurrency(biggestCategory.amount)} total spent
          </p>
        </div>
      )}

      {/* Monthly breakdown table */}
      {monthlyTable.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Monthly Breakdown
            </h2>
            <p className="text-sm text-slate-500">
              Income, expenses, and savings per month
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/10">
                  {["Month", "Income", "Expenses", "Savings", "Savings Rate"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {monthlyTable.map((row) => (
                  <tr
                    key={row.month}
                    className="transition hover:bg-slate-50 dark:hover:bg-white/5"
                  >
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {row.label}
                    </td>
                    <td className="px-5 py-3 text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(row.income)}
                    </td>
                    <td className="px-5 py-3 text-rose-600 dark:text-rose-400">
                      {formatCurrency(row.expenses)}
                    </td>
                    <td
                      className={`px-5 py-3 font-medium ${
                        row.savings >= 0
                          ? "text-violet-600 dark:text-violet-400"
                          : "text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {row.savings >= 0 ? "+" : ""}
                      {formatCurrency(row.savings)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                          <div
                            className={`h-full rounded-full ${
                              row.savingsRate >= 20
                                ? "bg-emerald-500"
                                : row.savingsRate >= 10
                                  ? "bg-amber-400"
                                  : "bg-rose-500"
                            }`}
                            style={{ width: `${row.savingsRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">
                          {row.savingsRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
