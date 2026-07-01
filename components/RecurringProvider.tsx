"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { useTransactions } from "@/components/TransactionsProvider";
import { loadData, saveData } from "@/lib/storage";
import { RECURRING_KEY_PREFIX, type RecurringTransaction } from "@/lib/types";

interface RecurringContextValue {
  recurring: RecurringTransaction[];
  addRecurring: (
    data: Omit<RecurringTransaction, "id" | "lastGenerated">
  ) => void;
  updateRecurring: (id: string, data: Partial<RecurringTransaction>) => void;
  deleteRecurring: (id: string) => void;
  toggleActive: (id: string) => void;
  generateNow: () => void;
}

const RecurringContext = createContext<RecurringContextValue | null>(null);

export function useRecurring(): RecurringContextValue {
  const ctx = useContext(RecurringContext);
  if (!ctx)
    throw new Error("useRecurring must be used inside RecurringProvider");
  return ctx;
}

function getMonthsToGenerate(
  lastGenerated: string | undefined,
  dayOfMonth: number,
  startDate: string,
  now: Date
): string[] {
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const startMonthKey = startDate.slice(0, 7);

  let iterY: number;
  let iterM: number;

  if (!lastGenerated) {
    [iterY, iterM] = startMonthKey.split("-").map(Number);
  } else {
    const [lgY, lgM] = lastGenerated.split("-").map(Number);
    iterM = lgM === 12 ? 1 : lgM + 1;
    iterY = lgM === 12 ? lgY + 1 : lgY;
  }

  const months: string[] = [];

  while (months.length <= 120) {
    const key = `${iterY}-${String(iterM).padStart(2, "0")}`;
    if (key < startMonthKey) {
      // skip
    } else if (key > currentMonthKey) {
      break;
    } else if (key === currentMonthKey) {
      if (currentDay >= dayOfMonth) months.push(key);
      break;
    } else {
      months.push(key);
    }
    iterM++;
    if (iterM > 12) {
      iterM = 1;
      iterY++;
    }
  }

  return months;
}

export function RecurringProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const { addTransaction } = useTransactions();
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([]);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);
  const autoRunRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRecurring([]);
      setLoadedForId(null);
      return;
    }
    const key = `${RECURRING_KEY_PREFIX}-${user.id}`;
    setRecurring(loadData<RecurringTransaction>(key));
    setLoadedForId(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!user || loadedForId !== user.id) return;
    saveData(`${RECURRING_KEY_PREFIX}-${user.id}`, recurring);
  }, [recurring, loadedForId, user?.id]);

  // Auto-generate on mount (once per user per month)
  useEffect(() => {
    if (!loadedForId || !user) return;
    const now = new Date();
    const runKey = `${user.id}-${now.getFullYear()}-${now.getMonth()}`;
    if (autoRunRef.current === runKey) return;
    autoRunRef.current = runKey;

    const updates: { id: string; lastGenerated: string }[] = [];

    for (const r of recurring) {
      if (!r.isActive) continue;
      const months = getMonthsToGenerate(
        r.lastGenerated,
        r.dayOfMonth,
        r.startDate,
        now
      );
      for (const monthKey of months) {
        const [y, m] = monthKey.split("-").map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const day = Math.min(r.dayOfMonth, daysInMonth);
        const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        addTransaction({
          type: r.type,
          amount: r.amount,
          description: r.description,
          category: r.category,
          date: dateStr,
          notes: r.notes ? `${r.notes} [Auto]` : "[Auto-generated]",
        });
      }
      if (months.length > 0) {
        updates.push({
          id: r.id,
          lastGenerated: months[months.length - 1],
        });
      }
    }

    if (updates.length > 0) {
      setRecurring((prev) =>
        prev.map((r) => {
          const u = updates.find((x) => x.id === r.id);
          return u ? { ...r, lastGenerated: u.lastGenerated } : r;
        })
      );
    }
  }, [loadedForId, user?.id]);

  const runGeneration = useCallback(() => {
    if (!user) return;
    const now = new Date();
    // Reset the run guard so generateNow always executes
    autoRunRef.current = null;

    const updates: { id: string; lastGenerated: string }[] = [];

    setRecurring((prev) => {
      for (const r of prev) {
        if (!r.isActive) continue;
        const months = getMonthsToGenerate(
          r.lastGenerated,
          r.dayOfMonth,
          r.startDate,
          now
        );
        for (const monthKey of months) {
          const [y, m] = monthKey.split("-").map(Number);
          const daysInMonth = new Date(y, m, 0).getDate();
          const day = Math.min(r.dayOfMonth, daysInMonth);
          const dateStr = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          addTransaction({
            type: r.type,
            amount: r.amount,
            description: r.description,
            category: r.category,
            date: dateStr,
            notes: r.notes ? `${r.notes} [Auto]` : "[Auto-generated]",
          });
        }
        if (months.length > 0) {
          updates.push({ id: r.id, lastGenerated: months[months.length - 1] });
        }
      }
      return prev.map((r) => {
        const u = updates.find((x) => x.id === r.id);
        return u ? { ...r, lastGenerated: u.lastGenerated } : r;
      });
    });
  }, [user, addTransaction]);

  const addRecurring = useCallback(
    (data: Omit<RecurringTransaction, "id" | "lastGenerated">) => {
      const newItem: RecurringTransaction = {
        ...data,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      };
      setRecurring((prev) => [...prev, newItem]);
    },
    []
  );

  const updateRecurring = useCallback(
    (id: string, data: Partial<RecurringTransaction>) => {
      setRecurring((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...data } : r))
      );
    },
    []
  );

  const deleteRecurring = useCallback((id: string) => {
    setRecurring((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleActive = useCallback((id: string) => {
    setRecurring((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  }, []);

  return (
    <RecurringContext.Provider
      value={{
        recurring,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleActive,
        generateNow: runGeneration,
      }}
    >
      {children}
    </RecurringContext.Provider>
  );
}
