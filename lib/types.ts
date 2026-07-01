export type TransactionType = "income" | "expense";
export type TransactionStatus = "completed" | "pending" | "cancelled";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: string;
  notes?: string;
  tags?: string[];
  status?: TransactionStatus;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  isCustom: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Entertainment",
  "Shopping",
  "Health",
  "Utilities",
  "Other",
] as const;

export type RecurrenceFrequency = "monthly";

export interface Budget {
  id: string;
  category: string;   // "overall" or expense category name
  amount: number;
  month: string;      // "YYYY-MM"
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  targetDate?: string;
  description?: string;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  notes?: string;
  frequency: RecurrenceFrequency;
  dayOfMonth: number;       // 1–28 (safe for every month)
  startDate: string;        // "YYYY-MM-DD"
  lastGenerated?: string;   // "YYYY-MM"
  isActive: boolean;
}

export type AchievementCategory = "milestone" | "savings" | "budget" | "streak" | "special";
export type AchievementRarity = "common" | "rare" | "epic" | "legendary";

export interface EarnedAchievement {
  id: string;
  earnedAt: string; // ISO date string
}

export const USERS_KEY = "finance-tracker-users";
export const SESSION_KEY = "finance-tracker-session";
export const TRANSACTIONS_KEY_PREFIX = "finance-tracker-transactions";
export const CATEGORIES_KEY_PREFIX = "finance-tracker-categories";
export const BUDGETS_KEY_PREFIX = "finance-tracker-budgets";
export const SAVINGS_GOALS_KEY_PREFIX = "finance-tracker-savings-goals";
export const RECURRING_KEY_PREFIX = "finance-tracker-recurring";
export const ACHIEVEMENTS_KEY_PREFIX = "finance-tracker-achievements";
