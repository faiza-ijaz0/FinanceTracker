"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { loadTransactions, saveTransactions } from "@/lib/storage";
import type { Transaction } from "@/lib/types";

interface TransactionsContextValue {
  transactions: Transaction[];
  addTransaction: (data: Omit<Transaction, "id">) => void;
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTransactions(loadTransactions());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) saveTransactions(transactions);
  }, [transactions, ready]);

  const addTransaction = useCallback((data: Omit<Transaction, "id">) => {
    setTransactions((prev) => [...prev, { ...data, id: crypto.randomUUID() }]);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, deleteTransaction }}
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
