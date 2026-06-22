import { formatCurrency } from "@/lib/finance";

interface SummaryCardsProps {
  income: number;
  expenses: number;
  balance: number;
}

export default function SummaryCards({
  income,
  expenses,
  balance,
}: SummaryCardsProps) {
  const cards = [
    {
      label: "Total Income",
      value: formatCurrency(income),
      icon: "↑",
      accent: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Expenses",
      value: formatCurrency(expenses),
      icon: "↓",
      accent: "from-rose-500/20 to-rose-600/5",
      border: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Net Balance",
      value: formatCurrency(balance),
      icon: "◎",
      accent: "from-violet-500/20 to-violet-600/5",
      border: "border-violet-500/30",
      text:
        balance >= 0
          ? "text-violet-600 dark:text-violet-300"
          : "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.accent} ${card.border} p-5 backdrop-blur-sm`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </p>
              <p
                className={`mt-2 text-2xl font-bold tracking-tight ${card.text}`}
              >
                {card.value}
              </p>
            </div>
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-lg dark:bg-white/5 ${card.text}`}
            >
              {card.icon}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
