"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useCategories } from "@/components/CategoriesProvider";
import type { Category, TransactionType } from "@/lib/types";

const inputClass =
  "flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

function CategorySection({
  title,
  type,
  categories,
  onAdd,
  onUpdate,
  onDelete,
}: {
  title: string;
  type: TransactionType;
  categories: Category[];
  onAdd: (name: string, type: TransactionType) => { success: boolean; error?: string };
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [addError, setAddError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const result = onAdd(newName, type);
    if (result.success) {
      setNewName("");
      setAdding(false);
      setAddError("");
    } else {
      setAddError(result.error ?? "Failed to add category.");
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
    setConfirmDeleteId(null);
  }

  function handleSaveEdit(e: React.FormEvent, id: string) {
    e.preventDefault();
    if (editingName.trim()) {
      onUpdate(id, editingName);
    }
    setEditingId(null);
  }

  const accentColor =
    type === "income"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  const badgeColor =
    type === "income"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
      : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
        <div>
          <h2 className="font-semibold text-slate-900 dark:text-white">{title}</h2>
          <p className="text-sm text-slate-500">
            {categories.length} total · {categories.filter((c) => c.isCustom).length} custom
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeColor}`}
        >
          {type}
        </span>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-white/5">
        {categories.map((cat) => (
          <li key={cat.id} className="px-5 py-3">
            {editingId === cat.id ? (
              <form onSubmit={(e) => handleSaveEdit(e, cat.id)} className="flex gap-2">
                <input
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className={inputClass}
                />
                <button
                  type="submit"
                  className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-2 w-2 rounded-full ${
                      type === "income" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {cat.name}
                  </span>
                </div>

                {cat.isCustom ? (
                  <div className="flex items-center gap-1">
                    {confirmDeleteId === cat.id ? (
                      <>
                        <span className="mr-1 text-xs text-slate-500">Delete?</span>
                        <button
                          onClick={() => {
                            onDelete(cat.id);
                            setConfirmDeleteId(null);
                          }}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5"
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-500/10"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cat.id)}
                          className="rounded-lg px-2 py-1 text-xs font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="rounded-full border border-slate-200/80 px-2 py-0.5 text-xs text-slate-400 dark:border-white/10">
                    Default
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Add new category */}
      <div className="border-t border-slate-100 p-4 dark:border-white/10">
        {adding ? (
          <form onSubmit={handleAdd} className="space-y-2">
            <div className="flex gap-2">
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setAddError("");
                }}
                placeholder={`New ${type} category name`}
                className={inputClass}
              />
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-violet-500 hover:to-indigo-500"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setNewName("");
                  setAddError("");
                }}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
              >
                Cancel
              </button>
            </div>
            {addError && <p className="text-xs text-rose-500">{addError}</p>}
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className={`flex items-center gap-2 text-sm font-medium transition hover:opacity-80 ${accentColor}`}
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-current/10 text-base leading-none">
              +
            </span>
            Add {type} category
          </button>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const { incomeCategories, expenseCategories, addCategory, updateCategory, deleteCategory } =
    useCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Settings"
        title="Categories"
        description="Manage your income and expense categories. Add custom ones or keep the defaults."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CategorySection
          title="Income Categories"
          type="income"
          categories={incomeCategories}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
        <CategorySection
          title="Expense Categories"
          type="expense"
          categories={expenseCategories}
          onAdd={addCategory}
          onUpdate={updateCategory}
          onDelete={deleteCategory}
        />
      </div>
    </div>
  );
}
