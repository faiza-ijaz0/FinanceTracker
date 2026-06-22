import { formatCurrency } from "@/lib/finance";

interface StatCardProps {
  label: string;
  value: number;
  icon: string;
  variant: "income" | "expense" | "balance";
}

const variants = {
  income: {
    accent: "from-emerald-500/20 to-emerald-600/5",
    border: "border-emerald-500/30",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  expense: {
    accent: "from-rose-500/20 to-rose-600/5",
    border: "border-rose-500/30",
    text: "text-rose-600 dark:text-rose-400",
  },
  balance: {
    accent: "from-violet-500/20 to-violet-600/5",
    border: "border-violet-500/30",
    text: "text-violet-600 dark:text-violet-300",
  },
};

export default function StatCard({
  label,
  value,
  icon,
  variant,
}: StatCardProps) {
  const style = variants[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${style.accent} ${style.border} p-5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className={`mt-2 text-3xl font-bold tracking-tight ${style.text}`}>
            {formatCurrency(value)}
          </p>
        </div>
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/5 text-xl dark:bg-white/5 ${style.text}`}
        >
          {icon}
        </span>
      </div>
    </div>
  );
}
