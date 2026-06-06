import { z } from 'zod';

export const PrivacyModeSchema = z.enum([
  'FULLY_LOCAL',
  'SELF_HOSTED',
  'HYBRID',
  'CLOUD_ASSISTED',
]);
export type PrivacyMode = z.infer<typeof PrivacyModeSchema>;

export const PlatformContextSchema = z.enum(['mobile', 'web']);
export type PlatformContext = z.infer<typeof PlatformContextSchema>;

export const BudgetRiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type BudgetRiskLevel = z.infer<typeof BudgetRiskLevelSchema>;

export const UncertaintyLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export type UncertaintyLevel = z.infer<typeof UncertaintyLevelSchema>;

export const TinyActionOutputSchema = z.object({
  summary: z.string().max(200),
  uncertainty: UncertaintyLevelSchema.optional(),
  tinyNextAction: z.string().max(80),
  cards: z
    .array(
      z.object({
        title: z.string(),
        body: z.string().max(300),
        type: z.string().optional(),
      }),
    )
    .optional(),
});
export type TinyActionOutput = z.infer<typeof TinyActionOutputSchema>;

export const CapacityStateSchema = z.object({
  score: z.number().min(0).max(100),
  sleepHours: z.number().optional(),
  sleepQuality: z.number().min(0).max(100).optional(),
  manualCheckIn: z.boolean().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type CapacityState = z.infer<typeof CapacityStateSchema>;

export const SensoryStateSchema = z.object({
  load: z.number().min(0).max(100),
  ambientNoise: z.number().optional(),
  lightLevel: z.number().optional(),
  screenTimeMinutes: z.number().optional(),
  motionLevel: z.number().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type SensoryState = z.infer<typeof SensoryStateSchema>;
