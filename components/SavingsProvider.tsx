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
import { SAVINGS_GOALS_KEY_PREFIX, type SavingsGoal } from "@/lib/types";

interface SavingsContextValue {
  goals: SavingsGoal[];
  addGoal: (
    data: Omit<SavingsGoal, "id" | "savedAmount" | "createdAt">
  ) => void;
  updateGoal: (id: string, data: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addFunds: (id: string, amount: number) => void;
}

const SavingsContext = createContext<SavingsContextValue | null>(null);

export function useSavings(): SavingsContextValue {
  const ctx = useContext(SavingsContext);
  if (!ctx) throw new Error("useSavings must be used inside SavingsProvider");
  return ctx;
}

export function SavingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      setLoadedForId(null);
      return;
    }
    const key = `${SAVINGS_GOALS_KEY_PREFIX}-${user.id}`;
    setGoals(loadData<SavingsGoal>(key));
    setLoadedForId(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (!user || loadedForId !== user.id) return;
    saveData(`${SAVINGS_GOALS_KEY_PREFIX}-${user.id}`, goals);
  }, [goals, loadedForId, user?.id]);

  const addGoal = useCallback(
    (data: Omit<SavingsGoal, "id" | "savedAmount" | "createdAt">) => {
      const newGoal: SavingsGoal = {
        ...data,
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        savedAmount: 0,
        createdAt: new Date().toISOString(),
      };
      setGoals((prev) => [...prev, newGoal]);
    },
    []
  );

  const updateGoal = useCallback(
    (id: string, data: Partial<SavingsGoal>) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...data } : g))
      );
    },
    []
  );

  const deleteGoal = useCallback((id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const addFunds = useCallback((id: string, amount: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, savedAmount: g.savedAmount + amount } : g
      )
    );
  }, []);

  return (
    <SavingsContext.Provider
      value={{ goals, addGoal, updateGoal, deleteGoal, addFunds }}
    >
      {children}
    </SavingsContext.Provider>
  );
}
