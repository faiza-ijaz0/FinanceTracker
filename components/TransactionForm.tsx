"use client";

import { useEffect, useRef, useState } from "react";
import { useCategories } from "@/components/CategoriesProvider";
import type { Transaction, TransactionStatus, TransactionType } from "@/lib/types";

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, "id">) => void;
  onUpdate?: (id: string, data: Omit<Transaction, "id">) => void;
  onCancelEdit?: () => void;
  fixedType?: TransactionType;
  editingTransaction?: Transaction;
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

const TAG_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
];

function tagColor(tag: string) {
  const hash = tag.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
}

export default function TransactionForm({
  onAdd,
  onUpdate,
  onCancelEdit,
  fixedType,
  editingTransaction,
}: TransactionFormProps) {
  const { incomeCategories, expenseCategories } = useCategories();
  const isEditing = !!editingTransaction;

  const [type, setType] = useState<TransactionType>(
    editingTransaction?.type ?? fixedType ?? "expense"
  );
  const [amount, setAmount] = useState(
    editingTransaction ? String(editingTransaction.amount) : ""
  );
  const [description, setDescription] = useState(editingTransaction?.description ?? "");
  const [category, setCategory] = useState<string>(editingTransaction?.category ?? "");
  const [date, setDate] = useState(
    editingTransaction?.date ?? new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(editingTransaction?.notes ?? "");
  const [tags, setTags] = useState<string[]>(editingTransaction?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [status, setStatus] = useState<TransactionStatus>(
    editingTransaction?.status ?? "completed"
  );

  const tagInputRef = useRef<HTMLInputElement>(null);
  const activeType = editingTransaction?.type ?? fixedType ?? type;
  const categories = activeType === "income" ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (!category && categories.length > 0) setCategory(categories[0].name);
  }, [category, categories]);

  function handleTypeChange(next: TransactionType) {
    if (fixedType || isEditing) return;
    setType(next);
    const cats = next === "income" ? incomeCategories : expenseCategories;
    setCategory(cats[0]?.name ?? "");
  }

  function addTag(raw: string) {
    const clean = raw.trim().toLowerCase().replace(/,/g, "");
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Flush any pending tag input
    if (tagInput.trim()) addTag(tagInput);
    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0 || !description.trim()) return;

    const data: Omit<Transaction, "id"> = {
      type: activeType,
      amount: parsed,
      description: description.trim(),
      category,
      date,
      status,
      ...(notes.trim() ? { notes: notes.trim() } : {}),
      ...(tags.length > 0 ? { tags } : {}),
    };

    if (isEditing && onUpdate) {
      onUpdate(editingTransaction.id, data);
    } else {
      onAdd(data);
      setAmount("");
      setDescription("");
      setNotes("");
      setTags([]);
      setTagInput("");
      setStatus("completed");
      setDate(new Date().toISOString().slice(0, 10));
    }
  }

  const title = isEditing
    ? `Edit ${activeType === "income" ? "Income" : "Expense"}`
    : fixedType === "income"
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

      {!fixedType && !isEditing && (
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
        {/* Amount */}
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

        {/* Date */}
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

        {/* Description */}
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

        {/* Category */}
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Category
          </span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name} className="bg-white dark:bg-slate-900">
                {cat.name}
                {cat.isCustom ? " ★" : ""}
              </option>
            ))}
          </select>
        </label>

        {/* Status */}
        <label className="block">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Status
          </span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TransactionStatus)}
            className={inputClass}
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        {/* Tags */}
        <div className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Tags{" "}
            <span className="text-xs text-slate-400">
              (press Enter or comma to add)
            </span>
          </span>
          <div
            onClick={() => tagInputRef.current?.focus()}
            className="flex min-h-[42px] cursor-text flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50"
          >
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${tagColor(tag)}`}
              >
                #{tag}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(tag);
                  }}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={tagInputRef}
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput); }}
              placeholder={tags.length === 0 ? "work, food, monthly…" : ""}
              className="min-w-[120px] flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>
        </div>

        {/* Notes */}
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm text-slate-500 dark:text-slate-400">
            Notes{" "}
            <span className="text-xs text-slate-400">(optional)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any extra details..."
            rows={2}
            className={`${inputClass} resize-none`}
          />
        </label>
      </div>

      <div className="mt-5 flex gap-3">
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={`${isEditing ? "flex-1" : "w-full"} rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition active:scale-[0.99] ${
            activeType === "income"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:from-emerald-500 hover:to-teal-500"
              : "bg-gradient-to-r from-violet-600 to-indigo-600 shadow-violet-500/25 hover:from-violet-500 hover:to-indigo-500"
          }`}
        >
          {isEditing
            ? "Save Changes"
            : `Add ${activeType === "income" ? "Income" : "Expense"}`}
        </button>
      </div>
    </form>
  );
}
