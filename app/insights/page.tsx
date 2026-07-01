"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  AlertCircle,
  Tag,
  Zap,
  Lightbulb,
  Star,
  ArrowUpCircle,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { StaggerChildren, StaggerItem } from "@/components/AnimatedCard";
import { useInsights } from "@/hooks/useInsights";
import type { Insight, InsightType } from "@/lib/insights";
import { formatCurrency } from "@/lib/finance";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  AlertCircle,
  Tag,
  Zap,
  Lightbulb,
  Star,
  ArrowUpCircle,
};

const TYPE_STYLES: Record<InsightType, { card: string; icon: string; badge: string }> = {
  positive: {
    card: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    icon: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  },
  warning: {
    card: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/5",
    icon: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  },
  danger: {
    card: "border-rose-200 bg-rose-50 dark:border-rose-500/20 dark:bg-rose-500/5",
    icon: "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20",
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  },
  info: {
    card: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5",
    icon: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  },
  tip: {
    card: "border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5",
    icon: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-500/20",
    badge: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  },
};

const TYPE_LABEL: Record<InsightType, string> = {
  positive: "Positive",
  warning: "Warning",
  danger: "Alert",
  info: "Info",
  tip: "Tip",
};

function InsightCard({ insight }: { insight: Insight }) {
  const style = TYPE_STYLES[insight.type];
  const IconComponent = ICON_MAP[insight.icon] ?? Lightbulb;

  return (
    <div className={`rounded-2xl border p-5 ${style.card}`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${style.icon}`}>
          <IconComponent size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="font-semibold text-slate-900 dark:text-white">{insight.title}</p>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
              {TYPE_LABEL[insight.type]}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">{insight.description}</p>
        </div>
        {insight.metric && (
          <div className="shrink-0 text-right">
            <span className="text-base font-bold text-slate-900 dark:text-white">
              {insight.metric}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const { insights, chartData } = useInsights();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="AI Insights"
        title="Spending Insights"
        description="Smart analysis of your income and spending patterns over the last 6 months."
      />

      <StaggerChildren className="space-y-6">
        {/* Monthly comparison chart */}
        <StaggerItem>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
              Income vs Expenses (Last 6 Months)
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.92)",
                      border: "none",
                      borderRadius: 12,
                      color: "#f1f5f9",
                      fontSize: 12,
                    }}
                    formatter={(value: any, name: any) => {
                      const amount = typeof value === "number" ? value : Number(value ?? 0);
                      return [formatCurrency(amount), name === "income" ? "Income" : "Expenses"];
                    }}
                  />
                  <Legend
                    formatter={(v) => (v === "income" ? "Income" : "Expenses")}
                    wrapperStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="income" fill="#22c55e" radius={[5, 5, 0, 0]} />
                  <Bar dataKey="expenses" fill="#f43f5e" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </StaggerItem>

        {/* Insights list */}
        <StaggerItem>
          <div>
            <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
              {insights.length > 0
                ? `${insights.length} Insight${insights.length !== 1 ? "s" : ""} This Period`
                : "Insights"}
            </h2>
            {insights.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 dark:border-white/10">
                <div className="mb-3 text-4xl">🔍</div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  No insights yet
                </p>
                <p className="mt-1 text-center text-sm text-slate-500">
                  Add more transactions and budgets to unlock personalised insights.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
          </div>
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
