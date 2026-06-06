import { z } from 'zod';

export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  priority: TaskPrioritySchema.default('MEDIUM'),
  capacityDemand: z.number().min(0).max(100).default(50),
  sensoryDemand: z.number().min(0).max(100).default(30),
  dueDate: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  isPinned: z.boolean().default(false),
  tinyStep: z.string().optional(),
  routineId: z.string().uuid().optional(),
});
export type Task = z.infer<typeof TaskSchema>;

export const RoutineStepSchema = z.object({
  id: z.string().uuid(),
  routineId: z.string().uuid(),
  order: z.number().int(),
  title: z.string(),
  durationMinutes: z.number().optional(),
  completedAt: z.string().datetime().optional(),
});
export type RoutineStep = z.infer<typeof RoutineStepSchema>;

export const RoutineSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  steps: z.array(RoutineStepSchema).default([]),
  isActive: z.boolean().default(true),
});
export type Routine = z.infer<typeof RoutineSchema>;
