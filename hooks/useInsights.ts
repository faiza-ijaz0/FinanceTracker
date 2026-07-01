"use client";

import { useMemo } from "react";
import { useBudgets } from "@/components/BudgetProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import { generateInsights, getMonthlyComparisonData } from "@/lib/insights";
import type { Insight } from "@/lib/insights";

export function useInsights(): { insights: Insight[]; chartData: ReturnType<typeof getMonthlyComparisonData> } {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();

  const insights = useMemo(
    () => generateInsights({ transactions, budgets }),
    [transactions, budgets]
  );

  const chartData = useMemo(
    () => getMonthlyComparisonData(transactions),
    [transactions]
  );

  return { insights, chartData };
}
