"use client";

import { ThemeProvider } from "@/components/ThemeProvider";
import { TransactionsProvider } from "@/components/TransactionsProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <TransactionsProvider>{children}</TransactionsProvider>
    </ThemeProvider>
  );
}
