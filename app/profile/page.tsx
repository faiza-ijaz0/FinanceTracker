"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";
import { toast } from "sonner";
import { useTransactions } from "@/components/TransactionsProvider";
import { formatCurrency, getTotalExpenses, getTotalIncome } from "@/lib/finance";

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 dark:border-white/10 dark:bg-slate-900/50 dark:text-white";

function getInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export default function ProfilePage() {
  const { user, updateProfile, updatePassword, logout } = useAuth();
  const { transactions } = useTransactions();
  

  const [name, setName] = useState(user?.name ?? "");
  const [nameLoading, setNameLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const totalIncome = getTotalIncome(transactions);
  const totalExpenses = getTotalExpenses(transactions);
  const netBalance = totalIncome - totalExpenses;

  function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim() === user?.name) return;
    setNameLoading(true);
    const result = updateProfile(name.trim());
    setNameLoading(false);
    if (result.success) {
     toast.success("Name updated", {
  description: "Your display name has been changed.",
});
    } else {
     toast.error("Update failed", {
  description: result.error,
});
    }
  }

  function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPw !== confirmPw) {
     toast.error("Passwords don't match", {
  description: "New password and confirmation must match.",
});
      return;
    }
    if (newPw.length < 6) {
    toast.error("Password too short", {
  description: "Password must be at least 6 characters.",
});
      return;
    }
    setPwLoading(true);
    const result = updatePassword(currentPw, newPw);
    setPwLoading(false);
    if (result.success) {
     toast.success("Password changed", {
  description: "Your password has been updated.",
});
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } else {
     toast.error("Failed to change password", {
  description: result.error,
});
    }
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Account"
        title="My Profile"
        description="Manage your account information and security settings."
      />

      <div className="space-y-6">
        {/* Avatar + account overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
                {getInitials(user.name)}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 shadow-md">
                <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>

            {/* Info */}
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {user.name}
              </h2>
              <p className="text-slate-500">{user.email}</p>
              <p className="mt-1 text-xs text-slate-400">
                Account ID: {user.id.slice(0, 8)}…
              </p>
            </div>

            {/* Logout on desktop */}
            <div className="ml-auto hidden sm:block">
              <button
                onClick={() => logout()}
                className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-6 dark:border-white/10">
            {[
              { label: "Net Balance", value: formatCurrency(netBalance), color: netBalance >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400" },
              { label: "Total Income", value: formatCurrency(totalIncome), color: "text-emerald-600 dark:text-emerald-400" },
              { label: "Total Expenses", value: formatCurrency(totalExpenses), color: "text-rose-600 dark:text-rose-400" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={`mt-1 text-base font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Update name */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
            Display Name
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            Update the name shown throughout the app.
          </p>
          <form onSubmit={handleUpdateName} className="flex gap-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={`${inputCls} flex-1`}
              required
              minLength={2}
            />
            <button
              type="submit"
              disabled={nameLoading || !name.trim() || name.trim() === user.name}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
            >
              {nameLoading ? "Saving…" : "Save"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">
            Change Password
          </h3>
          <p className="mb-4 text-sm text-slate-500">
            Keep your account secure with a strong password.
          </p>
          <form onSubmit={handleUpdatePassword} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm text-slate-500">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="Enter current password"
                  className={`${inputCls} pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPw ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm text-slate-500">
                  New Password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="At least 6 characters"
                  className={inputCls}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm text-slate-500">
                  Confirm Password
                </label>
                <input
                  type={showPw ? "text" : "password"}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className={`${inputCls} ${confirmPw && confirmPw !== newPw ? "border-rose-500/50 focus:ring-rose-500/20" : ""}`}
                  required
                />
              </div>
            </div>

            {confirmPw && confirmPw !== newPw && (
              <p className="text-xs text-rose-500">Passwords do not match.</p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={pwLoading || !currentPw || !newPw || !confirmPw}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50"
              >
                {pwLoading ? "Updating…" : "Change Password"}
              </button>
            </div>
          </form>
        </div>

        {/* Account info */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
            Account Information
          </h3>
          <dl className="space-y-3">
            {[
              { label: "Email", value: user.email },
              { label: "Account ID", value: user.id },
              { label: "Total Transactions", value: transactions.length.toString() },
              { label: "Data Storage", value: "Local browser storage" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-4">
                <dt className="w-36 shrink-0 text-sm text-slate-500">{item.label}</dt>
                <dd className="truncate text-sm font-medium text-slate-900 dark:text-white">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
