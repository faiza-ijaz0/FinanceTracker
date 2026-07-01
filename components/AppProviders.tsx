"use client";

import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { CategoriesProvider } from "@/components/CategoriesProvider";
import { TransactionsProvider } from "@/components/TransactionsProvider";
import { RecurringProvider } from "@/components/RecurringProvider";
import { BudgetProvider } from "@/components/BudgetProvider";
import { SavingsProvider } from "@/components/SavingsProvider";
import { AchievementsProvider } from "@/components/AchievementsProvider";

export default function AppProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          style: {
            borderRadius: "12px",
            fontFamily: "inherit",
          },
        }}
      />
      <AuthProvider>
        <CategoriesProvider>
          <TransactionsProvider>
            <RecurringProvider>
              <BudgetProvider>
                <SavingsProvider>
                  <AchievementsProvider>{children}</AchievementsProvider>
                </SavingsProvider>
              </BudgetProvider>
            </RecurringProvider>
          </TransactionsProvider>
        </CategoriesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
