import { z } from 'zod';

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  fileName: z.string(),
  mimeType: z.string(),
  storageKey: z.string(),
  uploadedAt: z.string().datetime(),
  isScaryMail: z.boolean().default(false),
  aiConsentGiven: z.boolean().default(false),
});
export type Document = z.infer<typeof DocumentSchema>;

export const DocumentExtractionSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
  summary: z.string(),
  deadline: z.string().datetime().optional(),
  requiredActions: z.array(z.string()).default([]),
  extractedAt: z.string().datetime(),
});
export type DocumentExtraction = z.infer<typeof DocumentExtractionSchema>;

export const AdminTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'SNOOZED']).default('PENDING'),
  category: z.string().optional(),
  documentId: z.string().uuid().optional(),
});
export type AdminTask = z.infer<typeof AdminTaskSchema>;

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  provider: z.string().optional(),
  dateTime: z.string().datetime(),
  location: z.string().optional(),
  prepNotes: z.string().optional(),
  questionsToAsk: z.array(z.string()).default([]),
  travelBufferMinutes: z.number().default(30),
});
export type Appointment = z.infer<typeof AppointmentSchema>;

export const DisabilityNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  content: z.string(),
  providerName: z.string().optional(),
  date: z.string().datetime(),
});
export type DisabilityNote = z.infer<typeof DisabilityNoteSchema>;

export const SymptomTimelineEntrySchema = z.object({
  id: z.string().uuid(),
  date: z.string().datetime(),
  symptoms: z.array(z.string()),
  severity: z.number().min(0).max(10),
  notes: z.string().optional(),
});
export type SymptomTimelineEntry = z.infer<typeof SymptomTimelineEntrySchema>;
