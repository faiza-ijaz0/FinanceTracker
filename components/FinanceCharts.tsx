"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { useTheme } from "@/components/ThemeProvider";
import { getCategoryTotals, getMonthlyTotals, getRunningBalance } from "@/lib/finance";
import type { Transaction } from "@/lib/types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
);

const CHART_COLORS = [
  "#8b5cf6",
  "#6366f1",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
];

type ChartMode = "all" | "income" | "expense";

interface FinanceChartsProps {
  transactions: Transaction[];
  mode?: ChartMode;
  compact?: boolean;
}

function useChartTheme() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return {
    legendColor: isDark ? "#94a3b8" : "#64748b",
    tickColor: isDark ? "#94a3b8" : "#64748b",
    gridColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
    borderColor: isDark ? "#0f172a" : "#ffffff",
  };
}

const cardClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5";

export default function FinanceCharts({
  transactions,
  mode = "all",
  compact = false,
}: FinanceChartsProps) {
  const chartTheme = useChartTheme();
  const expenseTotals = getCategoryTotals(transactions, "expense");
  const incomeTotals = getCategoryTotals(transactions, "income");
  const monthly = getMonthlyTotals(transactions);
  const running = getRunningBalance(transactions);

  const expenseLabels = Object.keys(expenseTotals);
  const expenseData = Object.values(expenseTotals);
  const incomeLabels = Object.keys(incomeTotals);
  const incomeData = Object.values(incomeTotals);

  const showIncome = mode === "all" || mode === "income";
  const showExpense = mode === "all" || mode === "expense";
  const showMonthly = mode === "all" && monthly.labels.length > 0;
  const showLine = !compact && mode === "all" && running.labels.length >= 2;

  const hasExpenses = showExpense && expenseData.length > 0;
  const hasIncome = showIncome && incomeData.length > 0;
  const hasAny = hasExpenses || hasIncome || showMonthly;

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartTheme.legendColor,
          padding: 16,
          usePointStyle: true,
        },
      },
    },
  };

  const axisOptions = {
    ...baseOptions,
    scales: {
      x: {
        grid: { color: chartTheme.gridColor },
        ticks: { color: chartTheme.tickColor },
      },
      y: {
        grid: { color: chartTheme.gridColor },
        ticks: { color: chartTheme.tickColor },
      },
    },
  };

  if (!hasAny) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-4xl">📈</p>
        <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
          Charts will appear here
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Add transactions to visualize your finances.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Doughnut charts row */}
      {(hasExpenses || hasIncome) && (
        <div
          className={`grid gap-6 ${
            hasExpenses && hasIncome ? "lg:grid-cols-2" : ""
          }`}
        >
          {hasExpenses && (
            <div className={cardClass}>
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Expenses by Category
              </h3>
              <div className={compact ? "h-56" : "h-64"}>
                <Doughnut
                  data={{
                    labels: expenseLabels,
                    datasets: [
                      {
                        data: expenseData,
                        backgroundColor: CHART_COLORS.slice(0, expenseLabels.length),
                        borderColor: chartTheme.borderColor,
                        borderWidth: 2,
                        hoverOffset: 8,
                      },
                    ],
                  }}
                  options={{ ...baseOptions, cutout: "65%" }}
                />
              </div>
            </div>
          )}

          {hasIncome && (
            <div className={cardClass}>
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Income by Category
              </h3>
              <div className={compact ? "h-56" : "h-64"}>
                <Doughnut
                  data={{
                    labels: incomeLabels,
                    datasets: [
                      {
                        data: incomeData,
                        backgroundColor: CHART_COLORS.slice(0, incomeLabels.length),
                        borderColor: chartTheme.borderColor,
                        borderWidth: 2,
                        hoverOffset: 8,
                      },
                    ],
                  }}
                  options={{ ...baseOptions, cutout: "65%" }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Line chart — running balance trend */}
      {showLine && (
        <div className={cardClass}>
          <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
            Net Balance Trend
          </h3>
          <p className="mb-4 text-sm text-slate-500">Cumulative balance over time</p>
          <div className="h-64">
            <Line
              data={{
                labels: running.labels,
                datasets: [
                  {
                    label: "Net Balance",
                    data: running.balances,
                    borderColor: "#8b5cf6",
                    backgroundColor: "rgba(139,92,246,0.12)",
                    borderWidth: 2.5,
                    pointBackgroundColor: "#8b5cf6",
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: true,
                  },
                ],
              }}
              options={axisOptions}
            />
          </div>
        </div>
      )}

      {/* Bar chart — monthly income vs expenses */}
      {showMonthly && (
        <div className={cardClass}>
          <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
            Monthly Overview
          </h3>
          <p className="mb-4 text-sm text-slate-500">Income vs Expenses by month</p>
          <div className={compact ? "h-56" : "h-72"}>
            <Bar
              data={{
                labels: monthly.labels,
                datasets: [
                  {
                    label: "Income",
                    data: monthly.income,
                    backgroundColor: "rgba(52,211,153,0.7)",
                    borderColor: "#34d399",
                    borderWidth: 1,
                    borderRadius: 8,
                  },
                  {
                    label: "Expenses",
                    data: monthly.expenses,
                    backgroundColor: "rgba(251,113,133,0.7)",
                    borderColor: "#fb7185",
                    borderWidth: 1,
                    borderRadius: 8,
                  },
                ],
              }}
              options={axisOptions}
            />
          </div>
        </div>
      )}
    </div>
  );
}
