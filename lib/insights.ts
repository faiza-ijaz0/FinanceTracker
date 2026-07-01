import type { Budget, Transaction } from "./types";
import {
  formatCurrency,
  getCategoryTotals,
  getTotalExpenses,
  getTotalIncome,
} from "./finance";

export type InsightType = "positive" | "warning" | "danger" | "info" | "tip";

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  metric?: string; // e.g. "+23%" or "$1,234"
  priority: number; // higher = shown first
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthTotals(
  transactions: Transaction[],
  key: string
): { income: number; expenses: number } {
  const month = transactions.filter((t) => t.date.slice(0, 7) === key);
  return {
    income: month.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    expenses: month.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
  };
}

export function generateInsights(data: {
  transactions: Transaction[];
  budgets: Budget[];
}): Insight[] {
  const { transactions, budgets } = data;
  const insights: Insight[] = [];
  const now = new Date();

  const curKey = monthKey(now);
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = monthKey(prevDate);

  const cur = monthTotals(transactions, curKey);
  const prev = monthTotals(transactions, prevKey);

  // ── 1. Spending change month-over-month ─────────────────────────────────
  if (prev.expenses > 0 && cur.expenses > 0) {
    const change = ((cur.expenses - prev.expenses) / prev.expenses) * 100;
    if (change > 15) {
      insights.push({
        id: "spending-spike",
        type: "warning",
        title: "Spending Spike",
        description: `Expenses are ${change.toFixed(0)}% higher than last month (${formatCurrency(prev.expenses)} → ${formatCurrency(cur.expenses)}).`,
        icon: "TrendingUp",
        metric: `+${change.toFixed(0)}%`,
        priority: 90,
      });
    } else if (change < -10) {
      insights.push({
        id: "spending-drop",
        type: "positive",
        title: "Spending Down",
        description: `Great discipline — expenses dropped ${Math.abs(change).toFixed(0)}% vs last month.`,
        icon: "TrendingDown",
        metric: `${change.toFixed(0)}%`,
        priority: 80,
      });
    }
  }

  // ── 2. Savings improvement ──────────────────────────────────────────────
  const curSavings = cur.income - cur.expenses;
  const prevSavings = prev.income - prev.expenses;
  if (prevSavings > 0 && curSavings > prevSavings) {
    insights.push({
      id: "savings-improved",
      type: "positive",
      title: "Savings Improved",
      description: `You saved ${formatCurrency(curSavings)} this month vs ${formatCurrency(prevSavings)} last month.`,
      icon: "PiggyBank",
      metric: `+${formatCurrency(curSavings - prevSavings)}`,
      priority: 75,
    });
  }
  if (curSavings < 0) {
    insights.push({
      id: "savings-negative",
      type: "danger",
      title: "Spending Exceeds Income",
      description: `You are ${formatCurrency(Math.abs(curSavings))} in the red this month. Reduce expenses urgently.`,
      icon: "AlertTriangle",
      metric: formatCurrency(curSavings),
      priority: 100,
    });
  }

  // ── 3. Top spending category ────────────────────────────────────────────
  const curExpenses = transactions.filter(
    (t) => t.type === "expense" && t.date.slice(0, 7) === curKey
  );
  const catTotals = getCategoryTotals(curExpenses, "expense");
  const catEntries = Object.entries(catTotals).sort(([, a], [, b]) => b - a);
  if (catEntries.length > 0) {
    const [topCat, topAmt] = catEntries[0];
    const pct = cur.expenses > 0 ? Math.round((topAmt / cur.expenses) * 100) : 0;
    insights.push({
      id: "top-category",
      type: pct > 50 ? "warning" : "info",
      title: `Top Category: ${topCat}`,
      description: `${topCat} accounts for ${pct}% (${formatCurrency(topAmt)}) of this month's expenses.`,
      icon: "Tag",
      metric: `${pct}%`,
      priority: 60,
    });
  }

  // ── 4. Budget alerts ────────────────────────────────────────────────────
  const curBudgets = budgets.filter((b) => b.month === curKey);
  for (const budget of curBudgets) {
    const spent =
      budget.category === "overall"
        ? cur.expenses
        : curExpenses
            .filter((t) => t.category === budget.category)
            .reduce((s, t) => s + t.amount, 0);
    const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    if (pct > 100) {
      insights.push({
        id: `budget-exceeded-${budget.id}`,
        type: "danger",
        title: `Budget Exceeded: ${budget.category === "overall" ? "Overall" : budget.category}`,
        description: `You've spent ${formatCurrency(spent)} against a ${formatCurrency(budget.amount)} budget (${pct.toFixed(0)}%).`,
        icon: "AlertCircle",
        metric: `${pct.toFixed(0)}%`,
        priority: 95,
      });
    } else if (pct >= 80) {
      insights.push({
        id: `budget-warning-${budget.id}`,
        type: "warning",
        title: `Budget Warning: ${budget.category === "overall" ? "Overall" : budget.category}`,
        description: `${pct.toFixed(0)}% of your ${budget.category === "overall" ? "overall" : budget.category} budget used with more month remaining.`,
        icon: "AlertTriangle",
        metric: `${pct.toFixed(0)}%`,
        priority: 85,
      });
    }
  }

  // ── 5. Largest single expense ───────────────────────────────────────────
  const allExpenses = transactions.filter((t) => t.type === "expense");
  if (allExpenses.length > 0) {
    const biggest = allExpenses.reduce((m, t) => (t.amount > m.amount ? t : m));
    if (biggest.amount > cur.expenses * 0.4 && cur.expenses > 0) {
      insights.push({
        id: "large-expense",
        type: "info",
        title: "Large Expense Detected",
        description: `"${biggest.description}" (${formatCurrency(biggest.amount)}) is your largest single expense.`,
        icon: "Zap",
        metric: formatCurrency(biggest.amount),
        priority: 55,
      });
    }
  }

  // ── 6. No-income month warning ──────────────────────────────────────────
  if (cur.expenses > 0 && cur.income === 0) {
    insights.push({
      id: "no-income",
      type: "warning",
      title: "No Income Recorded",
      description: "You have expenses but no income logged this month. Track all income sources.",
      icon: "AlertCircle",
      priority: 88,
    });
  }

  // ── 7. Suggested reduction ──────────────────────────────────────────────
  if (catEntries.length >= 3 && cur.income > 0) {
    const ratio = cur.expenses / cur.income;
    if (ratio > 0.8) {
      const [cat, amt] = catEntries[0];
      const reduction = amt * 0.15;
      insights.push({
        id: "reduce-suggestion",
        type: "tip",
        title: "Reduction Opportunity",
        description: `Cutting ${cat} spending by 15% would save ${formatCurrency(reduction)} and reduce your expense ratio.`,
        icon: "Lightbulb",
        metric: `-${formatCurrency(reduction)}`,
        priority: 50,
      });
    }
  }

  // ── 8. Good savings rate ────────────────────────────────────────────────
  if (cur.income > 0) {
    const rate = (cur.income - cur.expenses) / cur.income;
    if (rate >= 0.3) {
      insights.push({
        id: "great-savings",
        type: "positive",
        title: "Excellent Savings Rate",
        description: `You're saving ${Math.round(rate * 100)}% of your income this month. Outstanding!`,
        icon: "Star",
        priority: 70,
      });
    }
  }

  // ── 9. Income growth ────────────────────────────────────────────────────
  if (prev.income > 0 && cur.income > prev.income) {
    const growth = ((cur.income - prev.income) / prev.income) * 100;
    if (growth > 10) {
      insights.push({
        id: "income-growth",
        type: "positive",
        title: "Income Increased",
        description: `Income grew ${growth.toFixed(0)}% compared to last month (${formatCurrency(prev.income)} → ${formatCurrency(cur.income)}).`,
        icon: "ArrowUpCircle",
        metric: `+${growth.toFixed(0)}%`,
        priority: 72,
      });
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

export function getMonthlyComparisonData(transactions: Transaction[]): {
  month: string;
  label: string;
  income: number;
  expenses: number;
}[] {
  const now = new Date();
  const result = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    const t = monthTotals(transactions, key);
    result.push({
      month: key,
      label: d.toLocaleDateString("en-US", { month: "short" }),
      income: t.income,
      expenses: t.expenses,
    });
  }
  return result;
}
