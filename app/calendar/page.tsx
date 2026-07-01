"use client";

import { useMemo, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { useTransactions } from "@/components/TransactionsProvider";


import { formatCurrency, getTransactionsByDate } from "@/lib/finance";
import type { Transaction } from "@/lib/types";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function prevMonthKey(y: number, m: number): [number, number] {
  return m === 0 ? [y - 1, 11] : [y, m - 1];
}
function nextMonthKey(y: number, m: number): [number, number] {
  return m === 11 ? [y + 1, 0] : [y, m + 1];
}

function calendarGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function CalendarPage() {
  const { transactions } = useTransactions();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const byDate = useMemo(
    () => getTransactionsByDate(transactions),
    [transactions]
  );

  const cells = useMemo(() => calendarGrid(year, month), [year, month]);

  const monthLabel = new Date(year, month).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedKey =
    selectedDay !== null ? dateKey(year, month, selectedDay) : null;
  const selectedTransactions: Transaction[] =
    selectedKey ? (byDate[selectedKey] ?? []) : [];

  const selectedIncome = selectedTransactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const selectedExpenses = selectedTransactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);

  function goToPrev() {
    const [py, pm] = prevMonthKey(year, month);
    setYear(py);
    setMonth(pm);
    setSelectedDay(null);
  }
  function goToNext() {
    const [ny, nm] = nextMonthKey(year, month);
    setYear(ny);
    setMonth(nm);
    setSelectedDay(null);
  }

  const todayKey = now.toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Calendar"
        title="Transaction Calendar"
        description="See your transactions laid out on a monthly calendar. Click a day to view details."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2">
          {/* Month navigation */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={goToPrev}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
            >
              ← Prev
            </button>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {monthLabel}
            </h2>
            <button
              onClick={goToNext}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
            >
              Next →
            </button>
          </div>

          {/* Day labels */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAYS.map((d) => (
              <div
                key={d}
                className="py-1.5 text-center text-xs font-medium text-slate-400"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (!day) {
                return <div key={`empty-${i}`} className="aspect-square" />;
              }
              const key = dateKey(year, month, day);
              const dayTxns = byDate[key] ?? [];
              const hasIncome = dayTxns.some((t) => t.type === "income");
              const hasExpense = dayTxns.some((t) => t.type === "expense");
              const isToday = key === todayKey;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDay(selectedDay === day ? null : day)
                  }
                  className={`relative flex aspect-square flex-col items-center justify-start rounded-xl p-1.5 text-sm font-medium transition ${
                    isSelected
                      ? "bg-violet-600 text-white shadow-md shadow-violet-500/25"
                      : isToday
                        ? "bg-violet-50 text-violet-700 ring-1 ring-violet-300 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30"
                        : dayTxns.length > 0
                          ? "bg-slate-50 text-slate-800 hover:bg-violet-50 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-violet-500/10"
                          : "text-slate-400 hover:bg-slate-50 dark:text-slate-600 dark:hover:bg-white/5"
                  }`}
                >
                  <span className="leading-none">{day}</span>
                  {(hasIncome || hasExpense) && (
                    <div className="mt-1 flex gap-0.5">
                      {hasIncome && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`}
                        />
                      )}
                      {hasExpense && (
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${isSelected ? "bg-white/70" : "bg-rose-500"}`}
                        />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Income
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Expense
            </div>
          </div>
        </div>

        {/* Side panel */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
          {selectedDay === null ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <p className="text-3xl">📅</p>
              <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
                Select a day
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Click any day on the calendar to see its transactions.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {new Date(year, month, selectedDay).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </h3>
                {selectedTransactions.length > 0 && (
                  <div className="mt-2 flex gap-3 text-xs">
                    {selectedIncome > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(selectedIncome)}
                      </span>
                    )}
                    {selectedExpenses > 0 && (
                      <span className="text-rose-600 dark:text-rose-400">
                        -{formatCurrency(selectedExpenses)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {selectedTransactions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-2xl">🕊</p>
                  <p className="mt-2 text-sm text-slate-500">
                    No transactions on this day
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {selectedTransactions.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10"
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          t.type === "income"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                          {t.description}
                        </p>
                        <p className="text-xs text-slate-500">{t.category}</p>
                        {t.notes && (
                          <p className="mt-0.5 truncate text-xs italic text-slate-400">
                            {t.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`shrink-0 text-sm font-semibold ${
                          t.type === "income"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {formatCurrency(t.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
