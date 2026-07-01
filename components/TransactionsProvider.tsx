"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/components/AuthProvider";
import { loadTransactions, saveTransactions } from "@/lib/storage";
import { TRANSACTIONS_KEY_PREFIX, type Transaction } from "@/lib/types";

interface TransactionsContextValue {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, data: Omit<Transaction, "id">) => void;
  deleteTransaction: (id: string) => void;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null
);

export function TransactionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const storageKey = user ? `${TRANSACTIONS_KEY_PREFIX}-${user.id}` : null;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadedForKey, setLoadedForKey] = useState<string | null>(null);

  useEffect(() => {
    if (!storageKey) {
      setTransactions([]);
      setLoadedForKey(null);
      return;
    }
    setTransactions(loadTransactions(storageKey));
    setLoadedForKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (loadedForKey && loadedForKey === storageKey) {
      saveTransactions(loadedForKey, transactions);
    }
  }, [transactions, loadedForKey, storageKey]);

  const addTransaction = useCallback((data: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  }, []);

  const updateTransaction = useCallback(
    (id: string, data: Omit<Transaction, "id">) => {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...data, id } : t))
      );
    },
    []
  );

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, updateTransaction, deleteTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactions() {
  const ctx = useContext(TransactionsContext);
  if (!ctx) {
    throw new Error("useTransactions must be used within TransactionsProvider");
  }
  return ctx;
}
