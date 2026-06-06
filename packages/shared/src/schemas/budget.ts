import { z } from 'zod';
import { BudgetRiskLevelSchema } from './common';

export const IncomeSourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  amount: z.number(),
  frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY', 'IRREGULAR']),
  nextPayDate: z.string().datetime().optional(),
});
export type IncomeSource = z.infer<typeof IncomeSourceSchema>;

export const BillSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  amount: z.number(),
  dueDate: z.string().datetime(),
  category: z.string(),
  isPaid: z.boolean().default(false),
  isProtected: z.boolean().default(false),
  priority: z.number().int().default(5),
});
export type Bill = z.infer<typeof BillSchema>;

export const SubscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  amount: z.number(),
  billingCycle: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY']),
  nextBillingDate: z.string().datetime().optional(),
  isActive: z.boolean().default(true),
});
export type Subscription = z.infer<typeof SubscriptionSchema>;

export const DebtSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  balance: z.number(),
  minimumPayment: z.number(),
  interestRate: z.number().optional(),
  dueDate: z.string().datetime().optional(),
});
export type Debt = z.infer<typeof DebtSchema>;

export const PawnLoanSchema = z.object({
  id: z.string().uuid(),
  itemDescription: z.string(),
  loanAmount: z.number(),
  paybackAmount: z.number(),
  dueDate: z.string().datetime(),
  isRedeemed: z.boolean().default(false),
});
export type PawnLoan = z.infer<typeof PawnLoanSchema>;

export const SpendingCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  budgetLimit: z.number().optional(),
  spent: z.number().default(0),
});
export type SpendingCategory = z.infer<typeof SpendingCategorySchema>;

export const SavingsGoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  targetAmount: z.number(),
  currentAmount: z.number().default(0),
});
export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number(),
  description: z.string(),
  category: z.string().optional(),
  date: z.string().datetime(),
  isIncome: z.boolean().default(false),
});
export type Transaction = z.infer<typeof TransactionSchema>;

export const BudgetStateSchema = z.object({
  incomeSources: z.array(IncomeSourceSchema).default([]),
  currentBalance: z.number().default(0),
  safeToSpend: z.number().default(0),
  bills: z.array(BillSchema).default([]),
  subscriptions: z.array(SubscriptionSchema).default([]),
  debts: z.array(DebtSchema).default([]),
  pawnLoans: z.array(PawnLoanSchema).default([]),
  paydayDate: z.string().datetime().nullable().default(null),
  rentDueDate: z.string().datetime().nullable().default(null),
  emergencyShortfall: z.number().default(0),
  spendingCategories: z.array(SpendingCategorySchema).default([]),
  budgetRiskLevel: BudgetRiskLevelSchema.default('LOW'),
  moneyStressLevel: z.number().min(0).max(100).default(0),
  savingsGoals: z.array(SavingsGoalSchema).default([]),
});
export type BudgetState = z.infer<typeof BudgetStateSchema>;
