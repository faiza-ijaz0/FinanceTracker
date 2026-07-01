import type { Category, TransactionType } from "./types";
import { CATEGORIES_KEY_PREFIX, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "./types";

function getKey(userId: string): string {
  return `${CATEGORIES_KEY_PREFIX}-${userId}`;
}

export function getDefaultCategories(): Category[] {
  return [
    ...INCOME_CATEGORIES.map((name) => ({
      id: `builtin-income-${name}`,
      name,
      type: "income" as TransactionType,
      isCustom: false,
    })),
    ...EXPENSE_CATEGORIES.map((name) => ({
      id: `builtin-expense-${name}`,
      name,
      type: "expense" as TransactionType,
      isCustom: false,
    })),
  ];
}

export function loadCustomCategories(userId: string): Category[] {
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomCategories(userId: string, categories: Category[]): void {
  localStorage.setItem(getKey(userId), JSON.stringify(categories));
}
