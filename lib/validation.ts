import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number({ invalid_type_error: "Amount must be a number" })
    .positive("Amount must be greater than 0")
    .max(999_999_999, "Amount is too large"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be under 200 characters"),
  category: z.string().min(1, "Category is required"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  status: z.enum(["completed", "pending", "cancelled"]).default("completed"),
  notes: z.string().max(500, "Notes must be under 500 characters").optional(),
  tags: z
    .array(z.string().max(30, "Each tag must be under 30 characters"))
    .max(10, "Maximum 10 tags allowed")
    .optional(),
});

export const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z
    .number()
    .positive("Budget amount must be positive")
    .max(999_999_999, "Amount is too large"),
});

export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.number().positive("Target amount must be positive"),
  targetDate: z.string().optional(),
  description: z.string().max(300).optional(),
});

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type TransactionFormData = z.infer<typeof transactionSchema>;
export type BudgetFormData = z.infer<typeof budgetSchema>;
export type SavingsGoalFormData = z.infer<typeof savingsGoalSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type PasswordFormData = z.infer<typeof passwordSchema>;
