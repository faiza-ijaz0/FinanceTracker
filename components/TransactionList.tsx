import { formatCurrency } from "@/lib/finance";
import type { Transaction } from "@/lib/types";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  title?: string;
  emptyMessage?: string;
}

export default function TransactionList({
  transactions,
  onDelete,
  title = "Recent Transactions",
  emptyMessage = "Add your first income or expense to get started.",
}: TransactionListProps) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <p className="text-4xl">📊</p>
        <p className="mt-3 font-medium text-slate-700 dark:text-slate-300">
          No transactions yet
        </p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {sorted.length} total
        </p>
      </div>

      <ul className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto dark:divide-white/5">
        {sorted.map((t) => {
          const isIncome = t.type === "income";

          return (
            <li
              key={t.id}
              className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.03]"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  isIncome
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? "+" : "−"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900 dark:text-white">
                  {t.description}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t.category} ·{" "}
                  {new Date(t.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <p
                className={`shrink-0 font-semibold ${
                  isIncome
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? "+" : "−"}
                {formatCurrency(t.amount)}
              </p>

              <button
                type="button"
                onClick={() => onDelete(t.id)}
                aria-label={`Delete ${t.description}`}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 9.24A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-9.24.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
