"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import {
  getDefaultCategories,
  loadCustomCategories,
  saveCustomCategories,
} from "@/lib/categories";
import type { Category, TransactionType } from "@/lib/types";

interface CategoriesContextValue {
  allCategories: Category[];
  incomeCategories: Category[];
  expenseCategories: Category[];
  addCategory: (
    name: string,
    type: TransactionType
  ) => { success: boolean; error?: string };
  updateCategory: (id: string, name: string) => void;
  deleteCategory: (id: string) => void;
}

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [customCategories, setCustomCategories] = useState<Category[]>([]);
  const [loadedForId, setLoadedForId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCustomCategories([]);
      setLoadedForId(null);
      return;
    }
    setCustomCategories(loadCustomCategories(user.id));
    setLoadedForId(user.id);
  }, [user?.id]);

  useEffect(() => {
    if (loadedForId && loadedForId === user?.id) {
      saveCustomCategories(loadedForId, customCategories);
    }
  }, [customCategories, loadedForId, user?.id]);

  const allCategories = useMemo(
    () => [...getDefaultCategories(), ...customCategories],
    [customCategories]
  );
  const incomeCategories = useMemo(
    () => allCategories.filter((c) => c.type === "income"),
    [allCategories]
  );
  const expenseCategories = useMemo(
    () => allCategories.filter((c) => c.type === "expense"),
    [allCategories]
  );

  const addCategory = useCallback(
    (name: string, type: TransactionType) => {
      const trimmed = name.trim();
      if (!trimmed) return { success: false, error: "Category name is required." };
      const duplicate = allCategories.find(
        (c) => c.type === type && c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (duplicate) return { success: false, error: "Category already exists." };
      setCustomCategories((prev) => [
        ...prev,
        { id: crypto.randomUUID(), name: trimmed, type, isCustom: true },
      ]);
      return { success: true };
    },
    [allCategories]
  );

  const updateCategory = useCallback((id: string, name: string) => {
    setCustomCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: name.trim() } : c))
    );
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  return (
    <CategoriesContext.Provider
      value={{
        allCategories,
        incomeCategories,
        expenseCategories,
        addCategory,
        updateCategory,
        deleteCategory,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
