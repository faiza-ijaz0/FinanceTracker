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
