import type { Budget, SavingsGoal, Transaction } from "./types";
import {
  getBalance,
  getTotalExpenses,
  getTotalIncome,
} from "./finance";

export type HealthGrade = "A+" | "A" | "B" | "C" | "D" | "F";

export interface HealthScoreBreakdown {
  savingsRate: number;     // 0-25
  budgetAdherence: number; // 0-25
  expenseRatio: number;    // 0-25
  consistency: number;     // 0-25
}

export interface HealthScore {
  total: number;
  grade: HealthGrade;
  color: string;
  breakdown: HealthScoreBreakdown;
  savingsRatePct: number;
  expenseRatioPct: number;
  recommendations: string[];
  strengths: string[];
}

function gradeFromScore(score: number): HealthGrade {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 65) return "B";
  if (score >= 50) return "C";
  if (score >= 35) return "D";
  return "F";
}

export function gradeColor(grade: HealthGrade): string {
  const map: Record<HealthGrade, string> = {
    "A+": "#22c55e",
    A: "#4ade80",
    B: "#f59e0b",
    C: "#f97316",
    D: "#ef4444",
    F: "#991b1b",
  };
  return map[grade];
}

export function calculateHealthScore(data: {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
}): HealthScore {
  const { transactions, budgets } = data;

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const balance = getBalance(transactions);

  // ── 1. Savings-rate score (0-25) ────────────────────────────────────────
  const savingsRate = totalIncome > 0 ? balance / totalIncome : 0;
  const savingsScore =
    savingsRate >= 0.3 ? 25 :
    savingsRate >= 0.2 ? 21 :
    savingsRate >= 0.1 ? 16 :
    savingsRate > 0   ? 10 :
    savingsRate === 0 ?  5 : 0;

  // ── 2. Budget adherence score (0-25) ────────────────────────────────────
  const currentBudgets = budgets.filter((b) => b.month === currentMonthKey);
  let budgetScore = 13; // neutral when no budgets set
  if (currentBudgets.length > 0) {
    const monthExpenses = transactions.filter(
      (t) => t.type === "expense" && t.date.slice(0, 7) === currentMonthKey
    );
    let underCount = 0;
    for (const b of currentBudgets) {
      const spent =
        b.category === "overall"
          ? monthExpenses.reduce((s, t) => s + t.amount, 0)
          : monthExpenses
              .filter((t) => t.category === b.category)
              .reduce((s, t) => s + t.amount, 0);
      if (spent <= b.amount) underCount++;
    }
    budgetScore = Math.round((underCount / currentBudgets.length) * 25);
  }

  // ── 3. Expense-ratio score (0-25) ───────────────────────────────────────
  const expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 1;
  const expenseScore =
    expenseRatio <= 0.5 ? 25 :
    expenseRatio <= 0.65 ? 21 :
    expenseRatio <= 0.8  ? 16 :
    expenseRatio <= 1.0  ?  8 : 0;

  // ── 4. Consistency score (0-25) ─────────────────────────────────────────
  const allMonths = new Set(transactions.map((t) => t.date.slice(0, 7)));
  const incomeMonths = new Set(
    transactions.filter((t) => t.type === "income").map((t) => t.date.slice(0, 7))
  );
  const consistencyScore =
    allMonths.size === 0
      ? 0
      : Math.round((incomeMonths.size / allMonths.size) * 25);

  const total = Math.min(100, savingsScore + budgetScore + expenseScore + consistencyScore);
  const grade = gradeFromScore(total);

  // ── Recommendations ────────────────────────────────────────────────────
  const recommendations: string[] = [];
  const strengths: string[] = [];

  if (totalIncome === 0) {
    recommendations.push("Start tracking your income to get a complete financial picture.");
  }
  if (savingsScore < 16) {
    const pct = Math.round(savingsRate * 100);
    if (pct < 0) {
      recommendations.push(
        `You are spending ${Math.abs(pct)}% more than you earn. Prioritise cutting non-essential expenses.`
      );
    } else {
      recommendations.push(
        `Your savings rate is ${pct}%. Aim for at least 20% to build wealth over time.`
      );
    }
  } else {
    strengths.push(`Solid savings rate of ${Math.round(savingsRate * 100)}%.`);
  }

  if (budgets.length === 0) {
    recommendations.push("Set monthly budgets for your expense categories to control spending.");
  } else if (budgetScore < 13) {
    recommendations.push("You are exceeding budget limits. Review your highest-spend categories.");
  } else {
    strengths.push("Staying within budget limits this month.");
  }

  if (expenseScore < 16) {
    recommendations.push(
      expenseRatio > 1
        ? "Expenses exceed income. Create a strict spending plan immediately."
        : `You spend ${Math.round(expenseRatio * 100)}% of income on expenses. Target below 70%.`
    );
  } else {
    strengths.push(`Healthy expense ratio of ${Math.round(expenseRatio * 100)}%.`);
  }

  if (consistencyScore < 13) {
    recommendations.push("Log transactions every month for a more accurate financial picture.");
  } else {
    strengths.push("Consistent monthly tracking across all periods.");
  }

  if (total >= 85) {
    recommendations.push("Excellent health! Consider investing your surplus to grow your wealth.");
  }

  return {
    total,
    grade,
    color: gradeColor(grade),
    breakdown: {
      savingsRate: savingsScore,
      budgetAdherence: budgetScore,
      expenseRatio: expenseScore,
      consistency: consistencyScore,
    },
    savingsRatePct: Math.round(savingsRate * 100),
    expenseRatioPct: Math.round(expenseRatio * 100),
    recommendations,
    strengths,
  };
}
