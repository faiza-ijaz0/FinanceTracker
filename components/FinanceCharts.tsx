"use client";

import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useTheme } from "@/components/ThemeProvider";
import { getCategoryTotals, getMonthlyTotals } from "@/lib/finance";
import type { Transaction } from "@/lib/types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
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

export default function FinanceCharts({
  transactions,
  mode = "all",
  compact = false,
}: FinanceChartsProps) {
  const chartTheme = useChartTheme();
  const expenseTotals = getCategoryTotals(transactions, "expense");
  const incomeTotals = getCategoryTotals(transactions, "income");
  const monthly = getMonthlyTotals(transactions);

  const expenseLabels = Object.keys(expenseTotals);
  const expenseData = Object.values(expenseTotals);
  const incomeLabels = Object.keys(incomeTotals);
  const incomeData = Object.values(incomeTotals);

  const showIncome = mode === "all" || mode === "income";
  const showExpense = mode === "all" || mode === "expense";
  const showMonthly = mode === "all" && monthly.labels.length > 0;

  const hasExpenses = showExpense && expenseData.length > 0;
  const hasIncome = showIncome && incomeData.length > 0;
  const hasAny = hasExpenses || hasIncome || showMonthly;

  const chartOptions = {
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

  const cardClass =
    "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5";

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
    <div
      className={`grid gap-6 ${compact ? "lg:grid-cols-2" : mode === "all" ? "lg:grid-cols-2" : "max-w-2xl"}`}
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
              options={{ ...chartOptions, cutout: "65%" }}
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
              options={{ ...chartOptions, cutout: "65%" }}
            />
          </div>
        </div>
      )}

      {showMonthly && (
        <div className={`${cardClass} lg:col-span-2`}>
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            Monthly Overview
          </h3>
          <div className="h-72">
            <Bar
              data={{
                labels: monthly.labels,
                datasets: [
                  {
                    label: "Income",
                    data: monthly.income,
                    backgroundColor: "rgba(52, 211, 153, 0.7)",
                    borderColor: "#34d399",
                    borderWidth: 1,
                    borderRadius: 8,
                  },
                  {
                    label: "Expenses",
                    data: monthly.expenses,
                    backgroundColor: "rgba(251, 113, 133, 0.7)",
                    borderColor: "#fb7185",
                    borderWidth: 1,
                    borderRadius: 8,
                  },
                ],
              }}
              options={{
                ...chartOptions,
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
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
