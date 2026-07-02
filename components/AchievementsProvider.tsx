"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useBudgets } from "@/components/BudgetProvider";
import { useSavings } from "@/components/SavingsProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import { ACHIEVEMENT_DEFS, type AchievementDef } from "@/lib/achievements";
import { loadData, saveData } from "@/lib/storage";
import { ACHIEVEMENTS_KEY_PREFIX, type EarnedAchievement } from "@/lib/types";

interface AchievementsContextValue {
  earnedIds: Set<string>;
  earnedList: EarnedAchievement[];
  totalXP: number;
  isEarned: (id: string) => boolean;
}

const AchievementsContext = createContext<AchievementsContextValue | null>(null);

export function AchievementsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const { goals } = useSavings();

  const storageKey = user ? `${ACHIEVEMENTS_KEY_PREFIX}-${user.id}` : null;

  const [earnedList, setEarnedList] = useState<EarnedAchievement[]>([]);
  const [loadedForKey, setLoadedForKey] = useState<string | null>(null);

  // Tracks which achievement toasts have been announced this session
  const announcedRef = useRef<Set<string>>(new Set());
  // Prevents running the check twice per render cycle
  const checkingRef = useRef(false);

  // Load
  useEffect(() => {
    if (!storageKey) {
      setEarnedList([]);
      setLoadedForKey(null);
      announcedRef.current = new Set();
      return;
    }
    const loaded = loadData<EarnedAchievement>(storageKey);
    setEarnedList(loaded);
    setLoadedForKey(storageKey);
    // Pre-seed announced set so existing achievements don't fire toasts on load
    announcedRef.current = new Set(loaded.map((e) => e.id));
  }, [storageKey]);

  // Save
  useEffect(() => {
    if (loadedForKey && loadedForKey === storageKey) {
      saveData(loadedForKey, earnedList);
    }
  }, [earnedList, loadedForKey, storageKey]);

  // Check for new achievements whenever data changes
  useEffect(() => {
    if (!loadedForKey || checkingRef.current) return;
    checkingRef.current = true;

    const checkData = { transactions, budgets, goals };
    const newlyEarned: AchievementDef[] = [];

    setEarnedList((prev) => {
      const prevIds = new Set(prev.map((e) => e.id));
      const toAdd: EarnedAchievement[] = [];

      for (const def of ACHIEVEMENT_DEFS) {
        if (!prevIds.has(def.id) && def.check(checkData)) {
          toAdd.push({ id: def.id, earnedAt: new Date().toISOString() });
          if (!announcedRef.current.has(def.id)) {
            newlyEarned.push(def);
            announcedRef.current.add(def.id);
          }
        }
      }

      if (toAdd.length === 0) {
        checkingRef.current = false;
        return prev;
      }

      checkingRef.current = false;
      return [...prev, ...toAdd];
    });

    // Defer toasts outside the state updater
    if (newlyEarned.length > 0) {
      setTimeout(() => {
        for (const def of newlyEarned) {
          toast.success(`${def.emoji} Achievement Unlocked!`, {
            description: `${def.title} — ${def.description}`,
            duration: 5000,
          });
        }
      }, 100);
    }
  }, [transactions, budgets, goals, loadedForKey]);

  const earnedIds = useMemo(() => new Set(earnedList.map((e) => e.id)), [earnedList]);
  const totalXP = useMemo(() => earnedList.reduce((sum, e) => {
    const def = ACHIEVEMENT_DEFS.find((d) => d.id === e.id);
    return sum + (def?.xp ?? 0);
  }, 0), [earnedList]);

  const isEarned = useCallback((id: string) => earnedIds.has(id), [earnedIds]);

  return (
    <AchievementsContext.Provider value={{ earnedIds, earnedList, totalXP, isEarned }}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) throw new Error("useAchievements must be used within AchievementsProvider");
  return ctx;
}
