"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useRecurring } from "@/components/RecurringProvider";
import { useCategories } from "@/components/CategoriesProvider";
import { formatCurrency } from "@/lib/finance";
import type { TransactionType } from "@/lib/types";

const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

const DAY_OPTIONS = Array.from({ length: 28 }, (_, i) => i + 1);

export default function RecurringPage() {
  const { recurring, addRecurring, deleteRecurring, toggleActive, generateNow } =
    useRecurring();
  const { incomeCategories, expenseCategories } = useCategories();

  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [dayOfMonth, setDayOfMonth] = useState("1");
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const categories = type === "income" ? incomeCategories : expenseCategories;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !description.trim() || !category) return;
    addRecurring({
      type,
      amount: amt,
      description: description.trim(),
      category,
      notes: notes.trim() || undefined,
      frequency: "monthly",
      dayOfMonth: parseInt(dayOfMonth),
      startDate,
      isActive: true,
    });
    setAmount("");
    setDescription("");
    setCategory("");
    setNotes("");
    setDayOfMonth("1");
    setStartDate(new Date().toISOString().slice(0, 10));
    setShowForm(false);
  }

  function handleGenerateNow() {
    generateNow();
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  }

  const active = recurring.filter((r) => r.isActive);
  const inactive = recurring.filter((r) => !r.isActive);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Automation"
        title="Recurring Transactions"
        description="Set up automatic transactions for salary, rent, subscriptions, and other regular payments."
      />

      {/* Actions row */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-medium text-slate-900 dark:text-white">
            {active.length}
          </span>{" "}
          active,{" "}
          <span className="font-medium text-slate-900 dark:text-white">
            {inactive.length}
          </span>{" "}
          paused
        </p>
        <div className="flex gap-2">
          {generated && (
            <span className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Transactions generated
            </span>
          )}
          <button
            onClick={handleGenerateNow}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
          >
            Generate Now
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
          >
            + Add Recurring
          </button>
        </div>
      </div>

      {recurring.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-white/10">
          <p className="text-4xl">🔄</p>
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            No recurring transactions
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Add regular income and expenses to auto-generate them each month.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recurring.map((r) => {
            const isConfirmDelete = confirmDeleteId === r.id;
            const catList =
              r.type === "income" ? incomeCategories : expenseCategories;
            const catObj = catList.find((c) => c.name === r.category);

            return (
              <div
                key={r.id}
                className={`flex items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm transition dark:bg-white/5 ${
                  r.isActive
                    ? "border-slate-200 dark:border-white/10"
                    : "border-slate-100 opacity-60 dark:border-white/5"
                }`}
              >
                {/* Type indicator */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${
                    r.type === "income"
                      ? "bg-emerald-500/10"
                      : "bg-rose-500/10"
                  }`}
                >
                  {r.type === "income" ? "+" : "-"}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {r.description}
                    </p>
                    {!r.isActive && (
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-400 dark:border-white/10">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {catObj?.name ?? r.category} · Day {r.dayOfMonth} of each
                    month
                    {r.lastGenerated
                      ? ` · Last: ${r.lastGenerated}`
                      : " · Not yet generated"}
                  </p>
                </div>

                {/* Amount */}
                <p
                  className={`shrink-0 font-semibold ${
                    r.type === "income"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {r.type === "income" ? "+" : "-"}
                  {formatCurrency(r.amount)}
                </p>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => toggleActive(r.id)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      r.isActive
                        ? "text-slate-500 hover:bg-amber-50 hover:text-amber-600 dark:text-slate-400 dark:hover:bg-amber-500/10 dark:hover:text-amber-400"
                        : "text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:text-slate-400 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
                    }`}
                  >
                    {r.isActive ? "Pause" : "Resume"}
                  </button>
                  {isConfirmDelete ? (
                    <>
                      <span className="text-xs text-slate-500">Delete?</span>
                      <button
                        onClick={() => {
                          deleteRecurring(r.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(r.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
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
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add Recurring Transaction
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(["expense", "income"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setType(t);
                      setCategory("");
                    }}
                    className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition ${
                      type === t
                        ? "bg-white text-slate-900 shadow dark:bg-slate-700 dark:text-white"
                        : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm text-slate-500">
                    Description
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Monthly Salary, Rent, Netflix"
                    className={`${inputCls} w-full`}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-500">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className={`${inputCls} w-full`}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-500">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`${inputCls} w-full`}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-500">
                    Day of Month
                  </label>
                  <select
                    value={dayOfMonth}
                    onChange={(e) => setDayOfMonth(e.target.value)}
                    className={`${inputCls} w-full`}
                  >
                    {DAY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                        {d === 1 ? "st" : d === 2 ? "nd" : d === 3 ? "rd" : "th"}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm text-slate-500">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`${inputCls} w-full`}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm text-slate-500">
                    Notes (optional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add a note"
                    className={`${inputCls} w-full`}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
                >
                  Add Recurring
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
