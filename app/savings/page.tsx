"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useSavings } from "@/components/SavingsProvider";
import { formatCurrency } from "@/lib/finance";

const inputCls =
  "rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

export default function SavingsPage() {
  const { goals, addGoal, deleteGoal, addFunds } = useSavings();

  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [fundsGoalId, setFundsGoalId] = useState<string | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    if (!name.trim() || !target || target <= 0) return;
    addGoal({
      name: name.trim(),
      targetAmount: target,
      targetDate: targetDate || undefined,
      description: description.trim() || undefined,
    });
    setName("");
    setTargetAmount("");
    setTargetDate("");
    setDescription("");
    setShowAddForm(false);
  }

  function handleAddFunds(e: React.FormEvent, id: string) {
    e.preventDefault();
    const amount = parseFloat(fundsAmount);
    if (!amount || amount <= 0) return;
    addFunds(id, amount);
    setFundsGoalId(null);
    setFundsAmount("");
  }

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Goals"
        title="Savings Goals"
        description="Create savings goals, track progress, and add funds whenever you save."
      />

      {/* Summary row */}
      {goals.length > 0 && (
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "Goals", value: goals.length.toString(), plain: true },
            { label: "Total Target", value: formatCurrency(totalTarget) },
            { label: "Total Saved", value: formatCurrency(totalSaved) },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-white/5"
            >
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-1 text-xl font-bold text-violet-600 dark:text-violet-400">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 && !showAddForm ? (
        <div className="mb-6 rounded-2xl border border-dashed border-slate-200 p-12 text-center dark:border-white/10">
          <p className="text-4xl">🎯</p>
          <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
            No savings goals yet
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Create your first goal to start tracking your savings progress.
          </p>
        </div>
      ) : (
        <div className="mb-6 grid gap-5 sm:grid-cols-2">
          {goals.map((goal) => {
            const pct =
              goal.targetAmount > 0
                ? Math.min(100, (goal.savedAmount / goal.targetAmount) * 100)
                : 0;
            const completed = goal.savedAmount >= goal.targetAmount;
            const remaining = Math.max(
              0,
              goal.targetAmount - goal.savedAmount
            );
            const isFunding = fundsGoalId === goal.id;
            const isConfirmDelete = confirmDeleteId === goal.id;

            return (
              <div
                key={goal.id}
                className={`rounded-2xl border bg-white p-5 shadow-sm dark:bg-white/5 ${
                  completed
                    ? "border-emerald-500/40 dark:border-emerald-500/30"
                    : "border-slate-200 dark:border-white/10"
                }`}
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {goal.name}
                      </p>
                      {completed && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          Completed
                        </span>
                      )}
                    </div>
                    {goal.description && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  {isConfirmDelete ? (
                    <div className="flex shrink-0 items-center gap-1 text-xs">
                      <span className="text-slate-500">Delete?</span>
                      <button
                        onClick={() => {
                          deleteGoal(goal.id);
                          setConfirmDeleteId(null);
                        }}
                        className="rounded-lg px-2 py-1 font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(goal.id)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
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

                {/* Progress */}
                <div className="mb-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      completed ? "bg-emerald-500" : "bg-gradient-to-r from-violet-600 to-indigo-600"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {formatCurrency(goal.savedAmount)} saved of{" "}
                    {formatCurrency(goal.targetAmount)}
                  </span>
                  <span className="font-medium">{pct.toFixed(0)}%</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  {!completed && (
                    <span>{formatCurrency(remaining)} remaining</span>
                  )}
                  {goal.targetDate && (
                    <span>
                      Target:{" "}
                      {new Date(goal.targetDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {/* Add funds */}
                {!completed && (
                  <div className="mt-3 border-t border-slate-100 pt-3 dark:border-white/10">
                    {isFunding ? (
                      <form
                        onSubmit={(e) => handleAddFunds(e, goal.id)}
                        className="flex gap-2"
                      >
                        <input
                          autoFocus
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={fundsAmount}
                          onChange={(e) => setFundsAmount(e.target.value)}
                          placeholder="Amount to add"
                          className={`${inputCls} flex-1`}
                        />
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Add
                        </button>
                        <button
                          type="button"
                          onClick={() => setFundsGoalId(null)}
                          className="rounded-lg border border-slate-200 px-2 text-xs text-slate-500 dark:border-white/10"
                        >
                          ✕
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => {
                          setFundsGoalId(goal.id);
                          setFundsAmount("");
                        }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-violet-50 py-2 text-xs font-medium text-violet-600 transition hover:bg-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:hover:bg-violet-500/20"
                      >
                        + Add Funds
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add goal form */}
      {showAddForm ? (
        <form
          onSubmit={handleAdd}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
        >
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            New Savings Goal
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-slate-500">
                Goal Name
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Emergency Fund, Vacation, New Laptop"
                className={`${inputCls} w-full`}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-500">
                Target Amount
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="5000.00"
                className={`${inputCls} w-full`}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-slate-500">
                Target Date (optional)
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`${inputCls} w-full`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm text-slate-500">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why are you saving for this?"
                className={`${inputCls} w-full`}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500"
            >
              Create Goal
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
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 py-4 text-sm font-medium text-violet-600 transition hover:border-violet-400 hover:bg-violet-50 dark:border-white/20 dark:text-violet-400 dark:hover:bg-violet-500/10"
        >
          <span className="text-lg leading-none">+</span> New Savings Goal
        </button>
      )}
    </div>
  );
}
