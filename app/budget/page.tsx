"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useBudgets } from "@/components/BudgetProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import { useCategories } from "@/components/CategoriesProvider";
import { formatCurrency } from "@/lib/finance";

const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

function progressColor(pct: number) {
  if (pct > 100) return "bg-rose-500";
  if (pct >= 80) return "bg-amber-500";
  if (pct >= 60) return "bg-yellow-400";
  return "bg-emerald-500";
}

function prevMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 1
    ? `${y - 1}-12`
    : `${y}-${String(m - 1).padStart(2, "0")}`;
}
function nextMonthKey(key: string) {
  const [y, m] = key.split("-").map(Number);
  return m === 12
    ? `${y + 1}-01`
    : `${y}-${String(m + 1).padStart(2, "0")}`;
}
function monthLabel(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function BudgetPage() {
  const { budgets, setBudget, deleteBudget } = useBudgets();
  const { transactions } = useTransactions();
  const { expenseCategories } = useCategories();

  const [selectedMonth, setSelectedMonth] = useState(
    () => new Date().toISOString().slice(0, 7)
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCategory, setAddCategory] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState("");

  const monthBudgets = budgets.filter((b) => b.month === selectedMonth);
  const monthExpenses = useMemo(
    () =>
      transactions.filter(
        (t) => t.type === "expense" && t.date.slice(0, 7) === selectedMonth
      ),
    [transactions, selectedMonth]
  );

  const budgetItems = monthBudgets.map((b) => {
    const spent =
      b.category === "overall"
        ? monthExpenses.reduce((s, t) => s + t.amount, 0)
        : monthExpenses
            .filter((t) => t.category === b.category)
            .reduce((s, t) => s + t.amount, 0);
    const pct = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    return { ...b, spent, pct };
  });

  const totalMonthExpenses = monthExpenses.reduce((s, t) => s + t.amount, 0);
  const budgetedCats = new Set(monthBudgets.map((b) => b.category));
  const availableToAdd = [
    ...(!budgetedCats.has("overall")
      ? [{ value: "overall", label: "Overall (All Expenses)" }]
      : []),
    ...expenseCategories
      .filter((c) => !budgetedCats.has(c.name))
      .map((c) => ({ value: c.name, label: c.name })),
  ];

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(addAmount);
    if (!addCategory || !amount || amount <= 0) return;
    setBudget(addCategory, selectedMonth, amount);
    setAddCategory("");
    setAddAmount("");
    setShowAddForm(false);
  }

  function handleSaveEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    const amount = parseFloat(editAmount);
    if (!amount || amount <= 0) return;
    const b = monthBudgets.find((x) => x.id === id);
    if (b) setBudget(b.category, selectedMonth, amount);
    setEditingId(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Planning"
        title="Monthly Budget"
        description="Set spending limits per category and track how close you are to each limit."
      />

      {/* Month navigation */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          onClick={() => setSelectedMonth(prevMonthKey(selectedMonth))}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
        >
          ← Prev
        </button>
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-900 dark:text-white">
            {monthLabel(selectedMonth)}
          </p>
          <p className="text-sm text-slate-500">
            Total expenses: {formatCurrency(totalMonthExpenses)}
          </p>
        </div>
        <button
          onClick={() => setSelectedMonth(nextMonthKey(selectedMonth))}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
        >
          Next →
        </button>
      </div>

      {/* Budget cards */}
      {budgetItems.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-white/10">
          <p className="text-4xl">📊</p>
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            No budgets set for {monthLabel(selectedMonth)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add a budget below to start tracking your spending limits.
          </p>
        </div>
      ) : (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {budgetItems.map((item) => {
            const isEditing = editingId === item.id;
            const exceeded = item.pct > 100;
            const warning = item.pct >= 80 && !exceeded;
            return (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {item.category === "overall"
                        ? "Overall (All Expenses)"
                        : item.category}
                    </p>
                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveEdit(e, item.id)}
                        className="mt-1 flex gap-2"
                      >
                        <input
                          autoFocus
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className={`${inputCls} w-28`}
                          placeholder="New limit"
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-semibold text-white hover:bg-violet-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-500 dark:border-white/10"
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <p className="text-sm text-slate-500">
                        {formatCurrency(item.spent)} /{" "}
                        {formatCurrency(item.amount)}
                      </p>
                    )}
                  </div>
                  {!isEditing && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => {
                          setEditingId(item.id);
                          setEditAmount(String(item.amount));
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-500/10 dark:hover:text-violet-400"
                        title="Edit"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteBudget(item.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        title="Delete"
                      >
                        <svg
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressColor(item.pct)}`}
                    style={{ width: `${Math.min(100, item.pct)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      exceeded
                        ? "font-semibold text-rose-600 dark:text-rose-400"
                        : warning
                          ? "font-semibold text-amber-600 dark:text-amber-400"
                          : "text-slate-500"
                    }
                  >
                    {item.pct.toFixed(1)}% used
                  </span>
                  <span className="text-slate-400">
                    {!exceeded
                      ? `${formatCurrency(item.amount - item.spent)} left`
                      : `${formatCurrency(item.spent - item.amount)} over`}
                  </span>
                </div>

                {exceeded && (
                  <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400">
                    ❌ Budget exceeded by{" "}
                    {formatCurrency(item.spent - item.amount)}
                  </div>
                )}
                {warning && (
                  <div className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                    ⚠ {item.pct.toFixed(0)}% used — approaching limit
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add budget form */}
      {showAddForm ? (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            Set Budget
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm text-slate-500">
                Category
              </label>
              <select
                value={addCategory}
                onChange={(e) => setAddCategory(e.target.value)}
                className={`${inputCls} w-full`}
                required
              >
                <option value="">Select a category</option>
                {availableToAdd.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-500">
                Monthly Limit
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="500.00"
                className={`${inputCls} w-full`}
                required
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
            >
              Set Budget
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : availableToAdd.length > 0 ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-4 text-sm font-medium text-violet-600 transition hover:border-violet-400 hover:bg-violet-50 dark:border-white/20 dark:text-violet-400 dark:hover:bg-violet-500/10"
        >
          <span className="text-lg leading-none">+</span> Add Budget
        </button>
      ) : budgetItems.length > 0 ? (
        <p className="text-center text-sm text-slate-500">
          All available categories have budgets for this month.
        </p>
      ) : null}
    </div>
  );
}
