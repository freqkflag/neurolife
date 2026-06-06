import { z } from 'zod';

export const FoodItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  inPantry: z.boolean().default(true),
  expiresAt: z.string().datetime().optional(),
});
export type FoodItem = z.infer<typeof FoodItemSchema>;

export const MealPlanSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  spoonLevel: z.number().min(0).max(5).default(1),
  isZeroCook: z.boolean().default(false),
  ingredients: z.array(z.string()).default([]),
});
export type MealPlan = z.infer<typeof MealPlanSchema>;

export const GroceryItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  quantity: z.number().optional(),
  isPurchased: z.boolean().default(false),
});
export type GroceryItem = z.infer<typeof GroceryItemSchema>;

export const HousingItemSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['RENT', 'UTILITY', 'APPLICATION', 'MAINTENANCE', 'MOVE']),
  title: z.string(),
  amount: z.number().optional(),
  dueDate: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'PAID', 'OVERDUE', 'SUBMITTED', 'RESOLVED']).default('PENDING'),
  notes: z.string().optional(),
});
export type HousingItem = z.infer<typeof HousingItemSchema>;

export const AIInteractionSchema = z.object({
  id: z.string().uuid(),
  agentType: z.string(),
  input: z.string(),
  output: z.string(),
  privacyMode: z.string(),
  consentGiven: z.boolean().default(false),
  createdAt: z.string().datetime(),
});
export type AIInteraction = z.infer<typeof AIInteractionSchema>;
