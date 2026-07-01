"use client";

import { useMemo } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import PageHeader from "@/components/PageHeader";
import { StaggerChildren, StaggerItem } from "@/components/AnimatedCard";
import ProgressRing from "@/components/ProgressRing";
import { useFinancialMetrics } from "@/hooks/useFinancialMetrics";
import { gradeColor } from "@/lib/healthScore";

const BREAKDOWN_LABELS: Record<string, string> = {
  savingsRate: "Savings Rate",
  budgetAdherence: "Budget Adherence",
  expenseRatio: "Expense Ratio",
  consistency: "Consistency",
};

const BREAKDOWN_DESCS: Record<string, string> = {
  savingsRate: "How much of your income you keep",
  budgetAdherence: "Staying within set budgets",
  expenseRatio: "Expenses as a share of income",
  consistency: "Regular income tracking",
};

const BREAKDOWN_COLORS: Record<string, string> = {
  savingsRate: "#22c55e",
  budgetAdherence: "#6366f1",
  expenseRatio: "#f59e0b",
  consistency: "#06b6d4",
};

export default function HealthPage() {
  const { healthScore } = useFinancialMetrics();

  const breakdownData = useMemo(
    () =>
      Object.entries(healthScore.breakdown).map(([key, val]) => ({
        key,
        label: BREAKDOWN_LABELS[key],
        value: val,
        max: 25,
        color: BREAKDOWN_COLORS[key],
        pct: Math.round((val / 25) * 100),
      })),
    [healthScore.breakdown]
  );

  const gradeHex = gradeColor(healthScore.grade);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Analytics"
        title="Financial Health Score"
        description="A holistic view of your financial wellbeing based on savings, budgets, and consistency."
      />

      <StaggerChildren className="space-y-6">
        {/* Hero score card */}
        <StaggerItem>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              {/* Ring */}
              <div className="shrink-0">
                <ProgressRing
                  value={healthScore.total}
                  size={160}
                  strokeWidth={14}
                  color={gradeHex}
                  label={String(healthScore.total)}
                  sublabel="/ 100"
                />
              </div>

              {/* Grade + meta */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex items-center justify-center gap-3 sm:justify-start">
                  <span
                    className="text-5xl font-black"
                    style={{ color: gradeHex }}
                  >
                    {healthScore.grade}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {healthScore.total >= 90
                        ? "Excellent"
                        : healthScore.total >= 80
                        ? "Great"
                        : healthScore.total >= 65
                        ? "Good"
                        : healthScore.total >= 50
                        ? "Fair"
                        : healthScore.total >= 35
                        ? "Needs Work"
                        : "Critical"}
                    </p>
                    <p className="text-sm text-slate-500">Financial Health</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-slate-500">Savings Rate</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                      {healthScore.savingsRatePct}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5">
                    <p className="text-xs text-slate-500">Expense Ratio</p>
                    <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">
                      {healthScore.expenseRatioPct}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </StaggerItem>

        {/* Score breakdown */}
        <StaggerItem>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="mb-5 text-base font-semibold text-slate-900 dark:text-white">
              Score Breakdown
            </h2>
            <div className="space-y-4">
              {breakdownData.map((item) => (
                <div key={item.key}>
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </p>
                      <p className="text-xs text-slate-500">{BREAKDOWN_DESCS[item.key]}</p>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                      <span className="text-xs text-slate-400">/25</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.pct}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recharts bar for visual comparison */}
            <div className="mt-6 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis domain={[0, 25]} hide />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(15,23,42,0.9)",
                      border: "none",
                      borderRadius: 10,
                      color: "#f1f5f9",
                      fontSize: 12,
                    }}
                    formatter={(value) => [`${value ?? 0}/25`, "Score"]}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {breakdownData.map((item) => (
                      <Cell key={item.key} fill={item.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </StaggerItem>

        {/* Strengths & Recommendations */}
        <div className="grid gap-4 sm:grid-cols-2">
          {healthScore.strengths.length > 0 && (
            <StaggerItem>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-500/20 dark:bg-emerald-500/5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-emerald-800 dark:text-emerald-300">
                  <span>✅</span> Strengths
                </h3>
                <ul className="space-y-2">
                  {healthScore.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                      <span className="mt-0.5 shrink-0 text-emerald-500">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          )}

          {healthScore.recommendations.length > 0 && (
            <StaggerItem>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-500/20 dark:bg-amber-500/5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
                  <span>💡</span> Recommendations
                </h3>
                <ul className="space-y-2">
                  {healthScore.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
                      <span className="mt-0.5 shrink-0 text-amber-500">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </StaggerItem>
          )}
        </div>
      </StaggerChildren>
    </div>
  );
}
