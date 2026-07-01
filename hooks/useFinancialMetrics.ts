"use client";

import { useMemo } from "react";
import { useBudgets } from "@/components/BudgetProvider";
import { useSavings } from "@/components/SavingsProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import {
  getAvgMonthlySpending,
  getBalance,
  getBiggestCategory,
  getMonthlyExpenses,
  getMonthlyIncome,
  getSavingsRate,
  getTodayExpenses,
  getTotalExpenses,
  getTotalIncome,
} from "@/lib/finance";
import { calculateHealthScore } from "@/lib/healthScore";

export function useFinancialMetrics() {
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useSavings();

  return useMemo(() => {
    const totalIncome = getTotalIncome(transactions);
    const totalExpenses = getTotalExpenses(transactions);
    const balance = getBalance(transactions);
    const monthlyIncome = getMonthlyIncome(transactions);
    const monthlyExpenses = getMonthlyExpenses(transactions);
    const monthlySavings = monthlyIncome - monthlyExpenses;
    const todayExpenses = getTodayExpenses(transactions);
    const savingsRate = getSavingsRate(transactions);
    const avgMonthlySpending = getAvgMonthlySpending(transactions);
    const biggestCategory = getBiggestCategory(transactions);
    const completedGoals = goals.filter((g) => g.savedAmount >= g.targetAmount).length;
    const activeGoals = goals.filter((g) => g.savedAmount < g.targetAmount).length;
    const totalGoalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
    const totalGoalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
    const healthScore = calculateHealthScore({ transactions, budgets, goals });

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const currentMonthBudgets = budgets.filter((b) => b.month === currentMonthKey);
    const exceededBudgets = currentMonthBudgets.filter((b) => {
      const spent =
        b.category === "overall"
          ? transactions
              .filter(
                (t) => t.type === "expense" && t.date.slice(0, 7) === currentMonthKey
              )
              .reduce((s, t) => s + t.amount, 0)
          : transactions
              .filter(
                (t) =>
                  t.type === "expense" &&
                  t.date.slice(0, 7) === currentMonthKey &&
                  t.category === b.category
              )
              .reduce((s, t) => s + t.amount, 0);
      return spent > b.amount;
    });

    return {
      totalIncome,
      totalExpenses,
      balance,
      monthlyIncome,
      monthlyExpenses,
      monthlySavings,
      todayExpenses,
      savingsRate,
      avgMonthlySpending,
      biggestCategory,
      completedGoals,
      activeGoals,
      totalGoalTarget,
      totalGoalSaved,
      healthScore,
      currentMonthBudgets,
      exceededBudgets,
      transactionCount: transactions.length,
    };
  }, [transactions, budgets, goals]);
}
