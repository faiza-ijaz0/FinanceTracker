"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import TransactionForm from "@/components/TransactionForm";
import TransactionList from "@/components/TransactionList";
import { useCategories } from "@/components/CategoriesProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import { formatCurrency } from "@/lib/finance";
import type { Transaction, TransactionType } from "@/lib/types";

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type DateFilter = "all" | "today" | "week" | "month" | "year" | "custom";

const selectClass =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

export default function TransactionsPage() {
  const { transactions, updateTransaction, deleteTransaction } = useTransactions();
  const { allCategories } = useCategories();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterDate, setFilterDate] = useState<DateFilter>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const hasActiveFilters =
    search !== "" ||
    filterType !== "all" ||
    filterCategory !== "all" ||
    filterDate !== "all";

  function resetFilters() {
    setSearch("");
    setSortBy("newest");
    setFilterType("all");
    setFilterCategory("all");
    setFilterDate("all");
    setDateFrom("");
    setDateTo("");
  }

  const filteredCategories = useMemo(
    () => allCategories.filter((c) => filterType === "all" || c.type === filterType),
    [allCategories, filterType]
  );

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.notes ?? "").toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      );
    }

    if (filterType !== "all") result = result.filter((t) => t.type === filterType);
    if (filterCategory !== "all") result = result.filter((t) => t.category === filterCategory);

    const now = new Date();
    if (filterDate === "today") {
      const todayStr = now.toISOString().slice(0, 10);
      result = result.filter((t) => t.date === todayStr);
    } else if (filterDate === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      result = result.filter((t) => new Date(t.date) >= weekAgo);
    } else if (filterDate === "month") {
      result = result.filter((t) => {
        const d = new Date(t.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
    } else if (filterDate === "year") {
      result = result.filter((t) => new Date(t.date).getFullYear() === now.getFullYear());
    } else if (filterDate === "custom" && dateFrom && dateTo) {
      result = result.filter((t) => t.date >= dateFrom && t.date <= dateTo);
    }

    result.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === "oldest") return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [transactions, search, sortBy, filterType, filterCategory, filterDate, dateFrom, dateTo]);

  const filteredIncome = filtered
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const filteredExpenses = filtered
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  function handleUpdate(id: string, data: Omit<Transaction, "id">) {
    updateTransaction(id, data);
    setEditingTransaction(null);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Transactions"
        title="Transaction History"
        description="Search, sort, and filter your complete financial record."
      />

      {/* Filter Bar */}
      <div className="mb-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
        {/* Search + Sort */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category, amount, or notes…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white dark:placeholder-slate-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={selectClass}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        {/* Type + Category + Date filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900/60">
            {(["all", "income", "expense"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setFilterType(t);
                  setFilterCategory("all");
                }}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition ${
                  filterType === t
                    ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                {t === "all" ? "All Types" : t}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={selectClass}
          >
            <option value="all">All Categories</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value as DateFilter)}
            className={selectClass}
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>

          {filterDate === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={selectClass}
              />
              <span className="text-sm text-slate-400">to</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={selectClass}
              />
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-violet-600 transition hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Result summary */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-900 dark:text-white">{filtered.length}</span>{" "}
          transaction{filtered.length !== 1 ? "s" : ""} found
        </p>
        {filtered.length > 0 && (
          <div className="flex gap-4 text-sm">
            <span className="text-emerald-600 dark:text-emerald-400">
              Income: {formatCurrency(filteredIncome)}
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              Expenses: {formatCurrency(filteredExpenses)}
            </span>
          </div>
        )}
      </div>

      {/* Transaction list */}
      <TransactionList
        transactions={filtered}
        onDelete={deleteTransaction}
        onEdit={setEditingTransaction}
        emptyMessage={
          hasActiveFilters
            ? "No transactions match your filters."
            : "No transactions yet. Add your first one from the dashboard."
        }
      />

      {/* Edit modal */}
      {editingTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditingTransaction(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-slate-50 shadow-2xl dark:bg-slate-900">
            <TransactionForm
              key={editingTransaction.id}
              editingTransaction={editingTransaction}
              onAdd={() => {}}
              onUpdate={handleUpdate}
              onCancelEdit={() => setEditingTransaction(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
