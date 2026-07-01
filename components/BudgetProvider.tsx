"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadData, saveData } from "@/lib/storage";
import { BUDGETS_KEY_PREFIX, type Budget } from "@/lib/types";

interface BudgetContextValue {
  budgets: Budget[];
  setBudget: (category: string, month: string, amount: number) => void;
  deleteBudget: (id: string) => void;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export function useBudgets(): BudgetContextValue {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error("useBudgets must be used inside BudgetProvider");
  return ctx;
}

export function BudgetProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBudgets([]);
      setLoadedForId(null);
      return;
    }
    const key = `${BUDGETS_KEY_PREFIX}-${user.id}`;
    setBudgets(loadData<Budget>(key));
    setLoadedForId(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!user || loadedForId !== user.id) return;
    saveData(`${BUDGETS_KEY_PREFIX}-${user.id}`, budgets);
  }, [budgets, loadedForId, user?.id]);

  const setBudget = useCallback(
    (category: string, month: string, amount: number) => {
      setBudgets((prev) => {
        const existing = prev.find(
          (b) => b.category === category && b.month === month
        );
        if (existing) {
          return prev.map((b) =>
            b.id === existing.id ? { ...b, amount } : b
          );
        }
        const newBudget: Budget = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          category,
          month,
          amount,
        };
        return [...prev, newBudget];
      });
    },
    []
  );

  const deleteBudget = useCallback((id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return (
    <BudgetContext.Provider value={{ budgets, setBudget, deleteBudget }}>
      {children}
    </BudgetContext.Provider>
  );
}
