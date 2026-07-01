import type { Transaction } from "./types";

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function getTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getBalance(transactions: Transaction[]): number {
  return getTotalIncome(transactions) - getTotalExpenses(transactions);
}

export function getCategoryTotals(
  transactions: Transaction[],
  type: "income" | "expense"
): Record<string, number> {
  return transactions
    .filter((t) => t.type === type)
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + t.amount;
      return acc;
    }, {});
}

export function getTodayExpenses(transactions: Transaction[]): number {
  const today = new Date().toISOString().slice(0, 10);
  return transactions
    .filter((t) => t.type === "expense" && t.date === today)
    .reduce((sum, t) => sum + t.amount, 0);
}

export function getCurrentMonthTransactions(transactions: Transaction[]): Transaction[] {
  const now = new Date();
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
}

export function getMonthlyIncome(transactions: Transaction[]): number {
  return getTotalIncome(getCurrentMonthTransactions(transactions));
}

export function getMonthlyExpenses(transactions: Transaction[]): number {
  return getTotalExpenses(getCurrentMonthTransactions(transactions));
}

export function getRecentTransactions(transactions: Transaction[], n = 5): Transaction[] {
  return [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, n);
}

export function getCurrentMonthCategoryBreakdown(
  transactions: Transaction[]
): { category: string; amount: number; percentage: number }[] {
  const monthly = getCurrentMonthTransactions(transactions);
  const totalExpenses = getTotalExpenses(monthly);
  if (totalExpenses === 0) return [];
  const totals = getCategoryTotals(monthly, "expense");
  return Object.entries(totals)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / totalExpenses) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getRunningBalance(transactions: Transaction[]): {
  labels: string[];
  balances: number[];
} {
  if (transactions.length === 0) return { labels: [], balances: [] };
  const monthMap = new Map<string, { income: number; expenses: number }>();
  for (const t of transactions) {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key) ?? { income: 0, expenses: 0 };
    if (t.type === "income") entry.income += t.amount;
    else entry.expenses += t.amount;
    monthMap.set(key, entry);
  }
  const sortedKeys = [...monthMap.keys()].sort();
  const labels = sortedKeys.map((key) => {
    const [year, month] = key.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });
  });
  let running = 0;
  const balances = sortedKeys.map((k) => {
    const e = monthMap.get(k)!;
    running += e.income - e.expenses;
    return Math.round(running * 100) / 100;
  });
  return { labels, balances };
}

export function getHighestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = transactions.filter((t) => t.type === "expense");
  if (!expenses.length) return null;
  return expenses.reduce((max, t) => (t.amount > max.amount ? t : max));
}

export function getLowestExpense(transactions: Transaction[]): Transaction | null {
  const expenses = transactions.filter((t) => t.type === "expense");
  if (!expenses.length) return null;
  return expenses.reduce((min, t) => (t.amount < min.amount ? t : min));
}

export function getAvgMonthlySpending(transactions: Transaction[]): number {
  const expenses = transactions.filter((t) => t.type === "expense");
  if (!expenses.length) return 0;
  const months = new Set(expenses.map((t) => t.date.slice(0, 7)));
  const total = expenses.reduce((s, t) => s + t.amount, 0);
  return total / months.size;
}

export function getBiggestCategory(
  transactions: Transaction[]
): { category: string; amount: number } | null {
  const totals = getCategoryTotals(transactions, "expense");
  const entries = Object.entries(totals);
  if (!entries.length) return null;
  const [category, amount] = entries.reduce((max, e) => (e[1] > max[1] ? e : max));
  return { category, amount };
}

export function getSavingsRate(transactions: Transaction[]): number {
  const income = getTotalIncome(transactions);
  if (!income) return 0;
  const balance = getBalance(transactions);
  return Math.max(0, Math.round((balance / income) * 100));
}

export function getTransactionsByDate(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});
}

export function getMonthlyBreakdownTable(transactions: Transaction[]): {
  month: string;
  label: string;
  income: number;
  expenses: number;
  savings: number;
  savingsRate: number;
}[] {
  const monthMap = new Map<string, { income: number; expenses: number }>();
  for (const t of transactions) {
    const key = t.date.slice(0, 7);
    const entry = monthMap.get(key) ?? { income: 0, expenses: 0 };
    if (t.type === "income") entry.income += t.amount;
    else entry.expenses += t.amount;
    monthMap.set(key, entry);
  }
  return [...monthMap.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([month, { income, expenses }]) => {
      const [y, m] = month.split("-");
      const savings = income - expenses;
      return {
        month,
        label: new Date(Number(y), Number(m) - 1).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        income,
        expenses,
        savings,
        savingsRate: income > 0 ? Math.round(Math.max(0, savings / income) * 100) : 0,
      };
    });
}

export function getMonthlyTotals(transactions: Transaction[]): {
  labels: string[];
  income: number[];
  expenses: number[];
} {
  const monthMap = new Map<string, { income: number; expenses: number }>();

  for (const t of transactions) {
    const date = new Date(t.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key) ?? { income: 0, expenses: 0 };

    if (t.type === "income") {
      entry.income += t.amount;
    } else {
      entry.expenses += t.amount;
    }

    monthMap.set(key, entry);
  }

  const sortedKeys = [...monthMap.keys()].sort();
  const labels = sortedKeys.map((key) => {
    const [year, month] = key.split("-");
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  });

  return {
    labels,
    income: sortedKeys.map((k) => monthMap.get(k)!.income),
    expenses: sortedKeys.map((k) => monthMap.get(k)!.expenses),
  };
}
