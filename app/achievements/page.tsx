"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { StaggerChildren, StaggerItem } from "@/components/AnimatedCard";
import { useAchievements } from "@/components/AchievementsProvider";
import {
  ACHIEVEMENT_DEFS,
  RARITY_BADGE,
  RARITY_COLORS,
  RARITY_LABELS,
} from "@/lib/achievements";
import type { AchievementCategory, AchievementRarity } from "@/lib/types";

const CATEGORY_LABELS: Record<AchievementCategory | "all", string> = {
  all: "All",
  milestone: "Milestone",
  savings: "Savings",
  budget: "Budget",
  streak: "Streak",
  special: "Special",
};

const RARITY_ORDER: AchievementRarity[] = ["common", "rare", "epic", "legendary"];

export default function AchievementsPage() {
  const { earnedIds, totalXP, earnedList } = useAchievements();
  const [categoryFilter, setCategoryFilter] = useState<AchievementCategory | "all">("all");
  const [rarityFilter, setRarityFilter] = useState<AchievementRarity | "all">("all");
  const [showEarned, setShowEarned] = useState<"all" | "earned" | "locked">("all");

  const filtered = ACHIEVEMENT_DEFS.filter((def) => {
    if (categoryFilter !== "all" && def.category !== categoryFilter) return false;
    if (rarityFilter !== "all" && def.rarity !== rarityFilter) return false;
    if (showEarned === "earned" && !earnedIds.has(def.id)) return false;
    if (showEarned === "locked" && earnedIds.has(def.id)) return false;
    return true;
  });

  const earnedCount = earnedIds.size;
  const totalCount = ACHIEVEMENT_DEFS.length;
  const progressPct = Math.round((earnedCount / totalCount) * 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader
        badge="Achievements"
        title="Your Achievements"
        description="Track milestones and earn XP as you build better financial habits."
      />

      <StaggerChildren className="space-y-6">
        {/* Progress overview */}
        <StaggerItem>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Overall Progress</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">
                  {earnedCount}{" "}
                  <span className="text-lg font-normal text-slate-400">/ {totalCount}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Total XP</p>
                <p className="mt-0.5 text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {totalXP.toLocaleString()} XP
                </p>
              </div>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="mt-1.5 text-right text-xs text-slate-400">{progressPct}% complete</p>

            {/* Rarity breakdown */}
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RARITY_ORDER.map((rarity) => {
                const total = ACHIEVEMENT_DEFS.filter((d) => d.rarity === rarity).length;
                const earned = ACHIEVEMENT_DEFS.filter(
                  (d) => d.rarity === rarity && earnedIds.has(d.id)
                ).length;
                return (
                  <div key={rarity} className={`rounded-xl border-2 p-3 text-center ${RARITY_COLORS[rarity]}`}>
                    <p className="text-xs font-semibold capitalize text-slate-500 dark:text-slate-400">
                      {RARITY_LABELS[rarity]}
                    </p>
                    <p className="mt-0.5 text-base font-bold text-slate-900 dark:text-white">
                      {earned}/{total}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </StaggerItem>

        {/* Filters */}
        <StaggerItem>
          <div className="flex flex-wrap gap-2">
            {/* Category */}
            {(Object.keys(CATEGORY_LABELS) as (AchievementCategory | "all")[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  categoryFilter === cat
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
            <span className="w-px bg-slate-200 dark:bg-white/10" />
            {/* Status */}
            {(["all", "earned", "locked"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setShowEarned(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                  showEarned === s
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </StaggerItem>

        {/* Achievement grid */}
        <StaggerItem>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 dark:border-white/10">
              <div className="mb-3 text-4xl">🏅</div>
              <p className="font-semibold text-slate-900 dark:text-white">No achievements match</p>
              <p className="mt-1 text-sm text-slate-500">Try a different filter.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((def) => {
                const earned = earnedIds.has(def.id);
                const earnedAt = earnedList.find((e) => e.id === def.id)?.earnedAt;
                return (
                  <div
                    key={def.id}
                    className={`rounded-2xl border-2 p-4 transition ${
                      earned
                        ? `${RARITY_COLORS[def.rarity]} bg-white shadow-sm dark:bg-white/5`
                        : "border-slate-200 bg-slate-50 opacity-60 dark:border-white/5 dark:bg-white/[0.02]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${
                          earned ? "bg-white shadow dark:bg-white/10" : "bg-slate-200 dark:bg-white/5"
                        }`}
                      >
                        {earned ? def.emoji : "🔒"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {def.title}
                          </p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${RARITY_BADGE[def.rarity]}`}>
                            {RARITY_LABELS[def.rarity]}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {def.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium text-violet-600 dark:text-violet-400">
                            +{def.xp} XP
                          </span>
                          {earned && earnedAt && (
                            <span className="text-[10px] text-slate-400">
                              {new Date(earnedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </StaggerItem>
      </StaggerChildren>
    </div>
  );
}
