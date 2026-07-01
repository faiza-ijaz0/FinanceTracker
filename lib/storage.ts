import type { Transaction } from "./types";

export function loadTransactions(storageKey: string): Transaction[] {
  return loadData<Transaction>(storageKey);
}

export function saveTransactions(
  storageKey: string,
  transactions: Transaction[]
): void {
  saveData(storageKey, transactions);
}

export function loadData<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveData<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}
