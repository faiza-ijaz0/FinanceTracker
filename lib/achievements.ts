import type { Budget, SavingsGoal, Transaction } from "./types";
import type { AchievementCategory, AchievementRarity } from "./types";
import { getTotalIncome, getTotalExpenses, getBalance } from "./finance";

export interface AchievementDef {
  id: string;
  title: string;
  description: string;
  emoji: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  xp: number;
  check: (data: AchievementCheckData) => boolean;
}

export interface AchievementCheckData {
  transactions: Transaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
}

export const RARITY_LABELS: Record<AchievementRarity, string> = {
  common: "Common",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

export const RARITY_COLORS: Record<AchievementRarity, string> = {
  common: "border-slate-300 dark:border-slate-600",
  rare: "border-blue-400 dark:border-blue-500",
  epic: "border-violet-500 dark:border-violet-400",
  legendary: "border-amber-400 dark:border-amber-300",
};

export const RARITY_BADGE: Record<AchievementRarity, string> = {
  common: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  epic: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  legendary: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
};

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  // ── Milestone ────────────────────────────────────────────────────────────
  {
    id: "first-transaction",
    title: "First Steps",
    description: "Logged your very first transaction",
    emoji: "🎯",
    category: "milestone",
    rarity: "common",
    xp: 10,
    check: ({ transactions }) => transactions.length >= 1,
  },
  {
    id: "first-income",
    title: "Money In",
    description: "Recorded your first income",
    emoji: "💰",
    category: "milestone",
    rarity: "common",
    xp: 15,
    check: ({ transactions }) => transactions.some((t) => t.type === "income"),
  },
  {
    id: "first-budget",
    title: "Budget Setter",
    description: "Created your first monthly budget",
    emoji: "📋",
    category: "milestone",
    rarity: "common",
    xp: 20,
    check: ({ budgets }) => budgets.length >= 1,
  },
  {
    id: "first-goal",
    title: "Dream Builder",
    description: "Created your first savings goal",
    emoji: "🌟",
    category: "milestone",
    rarity: "common",
    xp: 20,
    check: ({ goals }) => goals.length >= 1,
  },
  {
    id: "tx-10",
    title: "Getting Started",
    description: "Logged 10 transactions",
    emoji: "📝",
    category: "milestone",
    rarity: "common",
    xp: 25,
    check: ({ transactions }) => transactions.length >= 10,
  },
  {
    id: "tx-50",
    title: "Power Tracker",
    description: "Logged 50 transactions",
    emoji: "⚡",
    category: "milestone",
    rarity: "rare",
    xp: 75,
    check: ({ transactions }) => transactions.length >= 50,
  },
  {
    id: "tx-100",
    title: "Century Tracker",
    description: "Logged 100 transactions",
    emoji: "💯",
    category: "milestone",
    rarity: "epic",
    xp: 200,
    check: ({ transactions }) => transactions.length >= 100,
  },
  {
    id: "tx-500",
    title: "Finance Maestro",
    description: "Logged 500 transactions",
    emoji: "🏆",
    category: "milestone",
    rarity: "legendary",
    xp: 500,
    check: ({ transactions }) => transactions.length >= 500,
  },
  {
    id: "multi-category",
    title: "Category Explorer",
    description: "Used 5 or more expense categories",
    emoji: "🗂️",
    category: "milestone",
    rarity: "common",
    xp: 30,
    check: ({ transactions }) => {
      const cats = new Set(
        transactions.filter((t) => t.type === "expense").map((t) => t.category)
      );
      return cats.size >= 5;
    },
  },
  {
    id: "multi-months",
    title: "Early Tracker",
    description: "Tracked finances for 3+ months",
    emoji: "📅",
    category: "streak",
    rarity: "rare",
    xp: 60,
    check: ({ transactions }) => {
      const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
      return months.size >= 3;
    },
  },
  {
    id: "year-tracker",
    title: "Year-Long Journey",
    description: "Tracked finances for 12+ months",
    emoji: "🗓️",
    category: "streak",
    rarity: "epic",
    xp: 300,
    check: ({ transactions }) => {
      const months = new Set(transactions.map((t) => t.date.slice(0, 7)));
      return months.size >= 12;
    },
  },

  // ── Savings ──────────────────────────────────────────────────────────────
  {
    id: "first-savings",
    title: "Saver",
    description: "Achieved a positive overall balance",
    emoji: "🐣",
    category: "savings",
    rarity: "common",
    xp: 20,
    check: ({ transactions }) => getBalance(transactions) > 0,
  },
  {
    id: "saved-1k",
    title: "First Thousand",
    description: "Saved $1,000 overall",
    emoji: "💵",
    category: "savings",
    rarity: "rare",
    xp: 100,
    check: ({ transactions }) => getBalance(transactions) >= 1000,
  },
  {
    id: "saved-5k",
    title: "Five Figures Club",
    description: "Saved $5,000 overall",
    emoji: "💎",
    category: "savings",
    rarity: "epic",
    xp: 250,
    check: ({ transactions }) => getBalance(transactions) >= 5000,
  },
  {
    id: "saved-10k",
    title: "Wealth Builder",
    description: "Saved $10,000 overall",
    emoji: "🏦",
    category: "savings",
    rarity: "legendary",
    xp: 500,
    check: ({ transactions }) => getBalance(transactions) >= 10000,
  },
  {
    id: "goal-completed",
    title: "Goal Achieved",
    description: "Completed a savings goal",
    emoji: "🎉",
    category: "savings",
    rarity: "rare",
    xp: 150,
    check: ({ goals }) => goals.some((g) => g.savedAmount >= g.targetAmount),
  },
  {
    id: "all-goals",
    title: "Goal Crusher",
    description: "Completed 3 savings goals",
    emoji: "🦾",
    category: "savings",
    rarity: "epic",
    xp: 300,
    check: ({ goals }) =>
      goals.filter((g) => g.savedAmount >= g.targetAmount).length >= 3,
  },
  {
    id: "savings-rate-20",
    title: "20% Rule",
    description: "Achieved a 20%+ savings rate",
    emoji: "📈",
    category: "savings",
    rarity: "rare",
    xp: 120,
    check: ({ transactions }) => {
      const inc = getTotalIncome(transactions);
      const exp = getTotalExpenses(transactions);
      return inc > 0 && (inc - exp) / inc >= 0.2;
    },
  },
  {
    id: "savings-rate-30",
    title: "Super Saver",
    description: "Achieved a 30%+ savings rate",
    emoji: "🚀",
    category: "savings",
    rarity: "epic",
    xp: 250,
    check: ({ transactions }) => {
      const inc = getTotalIncome(transactions);
      const exp = getTotalExpenses(transactions);
      return inc > 0 && (inc - exp) / inc >= 0.3;
    },
  },

  // ── Budget ───────────────────────────────────────────────────────────────
  {
    id: "budget-master",
    title: "Budget Master",
    description: "All budgets under limit for a month",
    emoji: "✅",
    category: "budget",
    rarity: "rare",
    xp: 100,
    check: ({ transactions, budgets }) => {
      const months = [...new Set(budgets.map((b) => b.month))];
      return months.some((month) => {
        const mb = budgets.filter((b) => b.month === month);
        if (mb.length === 0) return false;
        const monthExp = transactions.filter(
          (t) => t.type === "expense" && t.date.slice(0, 7) === month
        );
        return mb.every((b) => {
          const spent =
            b.category === "overall"
              ? monthExp.reduce((s, t) => s + t.amount, 0)
              : monthExp
                  .filter((t) => t.category === b.category)
                  .reduce((s, t) => s + t.amount, 0);
          return spent <= b.amount;
        });
      });
    },
  },
  {
    id: "no-spend-day",
    title: "No-Spend Day",
    description: "A day with zero expenses",
    emoji: "🧊",
    category: "special",
    rarity: "common",
    xp: 15,
    check: ({ transactions }) => {
      const expenseDates = new Set(
        transactions.filter((t) => t.type === "expense").map((t) => t.date)
      );
      const incomeDates = new Set(
        transactions.filter((t) => t.type === "income").map((t) => t.date)
      );
      return [...incomeDates].some((d) => !expenseDates.has(d));
    },
  },
  {
    id: "diverse-income",
    title: "Multiple Streams",
    description: "Income from 3+ different categories",
    emoji: "🌊",
    category: "special",
    rarity: "rare",
    xp: 80,
    check: ({ transactions }) => {
      const cats = new Set(
        transactions.filter((t) => t.type === "income").map((t) => t.category)
      );
      return cats.size >= 3;
    },
  },
  {
    id: "tagged-transactions",
    title: "Organized",
    description: "Added tags to 10 transactions",
    emoji: "🏷️",
    category: "special",
    rarity: "common",
    xp: 30,
    check: ({ transactions }) =>
      transactions.filter((t) => t.tags && t.tags.length > 0).length >= 10,
  },
];
