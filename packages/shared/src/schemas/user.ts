import { z } from 'zod';
import { PrivacyModeSchema } from './common';

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().optional(),
  privacyMode: PrivacyModeSchema.default('HYBRID'),
  theme: z.enum(['mutedDark', 'softCream']).default('mutedDark'),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  shutdownMode: z.boolean().default(false),
  diabetesAwareMeals: z.boolean().default(false),
  medicationReminders: z.boolean().default(false),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const SupportContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  relationship: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isEmergency: z.boolean().default(false),
});
export type SupportContact = z.infer<typeof SupportContactSchema>;
