import { formatCurrency } from "@/lib/finance";
import type { Transaction } from "@/lib/types";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  title?: string;
  emptyMessage?: string;
  compact?: boolean;
}

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

const STATUS_BADGE: Record<string, string> = {
  pending:
    "inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  cancelled:
    "inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-400",
};

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
  title = "Recent Transactions",
  emptyMessage = "Add your first income or expense to get started.",
  compact = false,
}: TransactionListProps) {
  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5">
          <svg className="h-7 w-7 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="font-medium text-slate-700 dark:text-slate-300">
          No transactions yet
        </p>
        <p className="mt-1 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
      {!compact && (
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {sorted.length} total
            </p>
          </div>
        </div>
      )}

      <ul
        className={`divide-y divide-slate-100 dark:divide-white/5 ${
          compact ? "" : "max-h-[520px] overflow-y-auto"
        }`}
      >
        {sorted.map((t) => {
          const isIncome = t.type === "income";
          const isCancelled = t.status === "cancelled";
          const isPending = t.status === "pending";

          return (
            <li
              key={t.id}
              className={`flex items-start gap-3 px-5 py-4 transition hover:bg-slate-50 dark:hover:bg-white/[0.03] ${
                isCancelled ? "opacity-50" : ""
              }`}
            >
              {/* Type icon */}
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                  isIncome
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? "+" : "−"}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`font-medium text-slate-900 dark:text-white ${
                      isCancelled ? "line-through" : ""
                    }`}
                  >
                    {t.description}
                  </p>
                  {isPending && (
                    <span className={STATUS_BADGE.pending}>Pending</span>
                  )}
                  {isCancelled && (
                    <span className={STATUS_BADGE.cancelled}>Cancelled</span>
                  )}
                </div>

                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {t.category} ·{" "}
                  {new Date(t.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                {t.notes && (
                  <p className="mt-0.5 truncate text-xs italic text-slate-400 dark:text-slate-500">
                    {t.notes}
                  </p>
                )}

                {t.tags && t.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {t.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${tagColor(tag)}`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Amount */}
              <p
                className={`mt-0.5 shrink-0 font-semibold ${
                  isCancelled
                    ? "text-slate-400 line-through"
                    : isIncome
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                }`}
              >
                {isIncome ? "+" : "−"}
                {formatCurrency(t.amount)}
              </p>

              {/* Actions */}
              <div className="mt-0.5 flex shrink-0 gap-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(t)}
                  aria-label={`Edit ${t.description}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-violet-500/10 hover:text-violet-500 dark:text-slate-500 dark:hover:text-violet-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(t.id)}
                  aria-label={`Delete ${t.description}`}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
