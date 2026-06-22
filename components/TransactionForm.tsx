"use client";

import { useState } from "react";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type Transaction,
  type TransactionType,
} from "@/lib/types";

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  fixedType?: TransactionType;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

export default function TransactionForm({
  onAdd,
  fixedType,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(fixedType ?? "expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(
    fixedType === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
  );
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const activeType = fixedType ?? type;
  const categories =
    activeType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleTypeChange(next: TransactionType) {
    if (fixedType) return;
    setType(next);
    setCategory(
      next === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0 || !description.trim()) return;

    onAdd({
      type: activeType,
      amount: parsed,
      description: description.trim(),
      category,
      date,
    });

    setAmount("");
    setDescription("");
    setDate(new Date().toISOString().slice(0, 10));
  }

  const title =
    fixedType === "income"
      ? "Add Income"
      : fixedType === "expense"
        ? "Add Expense"
        : "Add Transaction";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
    >
      <h2 className="mb-5 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>

      {!fixedType && (
        <div className="mb-5 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-900/60">
          {(["income", "expense"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleTypeChange(option)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium capitalize transition-all ${
                activeType === option
                  ? option === "income"
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-rose-500 text-white shadow-lg shadow-rose-500/25"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Amount
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              $
            </span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className={`${inputClass} pl-7`}
            />
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Date
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Description
          </span>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            required
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-slate-900">
                {cat}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        className={`mt-5 w-full rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99] ${
          activeType === "income"
            ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500"
            : "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
        }`}
      >
        Add {activeType === "income" ? "Income" : "Expense"}
      </button>
    </form>
  );
}
