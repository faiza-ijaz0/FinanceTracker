import { formatCurrency } from "@/lib/finance";

interface SummaryCardsProps {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  todayExpenses: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

interface CardDef {
  label: string;
  value: number;
  icon: string;
  accent: string;
  border: string;
  text: string;
}

export default function SummaryCards({
  totalBalance,
  totalIncome,
  totalExpenses,
  totalSavings,
  todayExpenses,
  monthlyIncome,
  monthlyExpenses,
}: SummaryCardsProps) {
  const primaryCards: CardDef[] = [
    {
      label: "Total Balance",
      value: totalBalance,
      icon: "◎",
      accent: "from-violet-500/20 to-violet-600/5",
      border: "border-violet-500/30",
      text:
        totalBalance >= 0
          ? "text-violet-600 dark:text-violet-300"
          : "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Total Income",
      value: totalIncome,
      icon: "↑",
      accent: "from-emerald-500/20 to-emerald-600/5",
      border: "border-emerald-500/30",
      text: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Total Expenses",
      value: totalExpenses,
      icon: "↓",
      accent: "from-rose-500/20 to-rose-600/5",
      border: "border-rose-500/30",
      text: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Total Savings",
      value: totalSavings,
      icon: "◈",
      accent: "from-teal-500/20 to-teal-600/5",
      border: "border-teal-500/30",
      text: "text-teal-600 dark:text-teal-400",
    },
  ];

  const secondaryCards: CardDef[] = [
    {
      label: "Today's Expenses",
      value: todayExpenses,
      icon: "◷",
      accent: "from-amber-500/15 to-amber-600/5",
      border: "border-amber-500/25",
      text: "text-amber-600 dark:text-amber-400",
    },
    {
      label: "Monthly Income",
      value: monthlyIncome,
      icon: "▲",
      accent: "from-blue-500/15 to-blue-600/5",
      border: "border-blue-500/25",
      text: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Monthly Expenses",
      value: monthlyExpenses,
      icon: "▼",
      accent: "from-pink-500/15 to-pink-600/5",
      border: "border-pink-500/25",
      text: "text-pink-600 dark:text-pink-400",
    },
  ];

  function Card({ card, large }: { card: CardDef; large?: boolean }) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${card.accent} ${card.border} p-5 backdrop-blur-sm`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            <p
              className={`mt-2 font-bold tracking-tight ${card.text} ${
                large ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"
              }`}
            >
              {formatCurrency(card.value)}
            </p>
          </div>
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900/5 text-lg dark:bg-white/5 ${card.text}`}
          >
            {card.icon}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {primaryCards.map((card) => (
          <Card key={card.label} card={card} large />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {secondaryCards.map((card) => (
          <Card key={card.label} card={card} />
        ))}
      </div>
    </div>
  );
}
