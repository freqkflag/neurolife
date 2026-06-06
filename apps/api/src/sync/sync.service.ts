import { Injectable } from '@nestjs/common';
import { SyncEngine } from '@neurolife/sync';
import type { SyncMutation } from '@neurolife/sync';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async pull(userId: string, since: string) {
    const sinceDate = new Date(since);

    const [tasks, capacity, sensory, routines, supportContacts, foodItems, documents, bills] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId, updatedAt: { gt: sinceDate } },
      }),
      this.prisma.capacityEntry.findMany({
        where: { userId, createdAt: { gt: sinceDate } },
      }),
      this.prisma.sensoryEntry.findMany({
        where: { userId, createdAt: { gt: sinceDate } },
      }),
      this.prisma.routine.findMany({
        where: { userId, updatedAt: { gt: sinceDate } },
      }),
      this.prisma.supportContact.findMany({
        where: { userId, updatedAt: { gt: sinceDate } },
      }),
      this.prisma.foodItem.findMany({
        where: { userId, updatedAt: { gt: sinceDate } },
      }),
      this.prisma.document.findMany({
        where: { userId, uploadedAt: { gt: sinceDate } },
      }),
      this.prisma.bill.findMany({
        where: { userId, updatedAt: { gt: sinceDate } },
      }),
    ]);

    const entities = [
      ...tasks.map((t) => ({
        type: 'task' as const,
        id: t.id,
        data: t as unknown as Record<string, unknown>,
        updatedAt: t.updatedAt.toISOString(),
      })),
      ...capacity.map((c) => ({
        type: 'capacity' as const,
        id: c.id,
        data: c as unknown as Record<string, unknown>,
        updatedAt: c.createdAt.toISOString(),
      })),
      ...sensory.map((s) => ({
        type: 'sensory' as const,
        id: s.id,
        data: s as unknown as Record<string, unknown>,
        updatedAt: s.createdAt.toISOString(),
      })),
      ...routines.map((r) => ({
        type: 'routine' as const,
        id: r.id,
        data: r as unknown as Record<string, unknown>,
        updatedAt: r.updatedAt.toISOString(),
      })),
      ...supportContacts.map((sc) => ({
        type: 'support_contact' as const,
        id: sc.id,
        data: sc as unknown as Record<string, unknown>,
        updatedAt: sc.updatedAt.toISOString(),
      })),
      ...foodItems.map((fi) => ({
        type: 'food_item' as const,
        id: fi.id,
        data: fi as unknown as Record<string, unknown>,
        updatedAt: fi.updatedAt.toISOString(),
      })),
      ...documents.map((d) => ({
        type: 'document' as const,
        id: d.id,
        data: d as unknown as Record<string, unknown>,
        updatedAt: d.uploadedAt.toISOString(),
      })),
      ...bills.map((b) => ({
        type: 'bill' as const,
        id: b.id,
        data: b as unknown as Record<string, unknown>,
        updatedAt: b.updatedAt.toISOString(),
      })),
    ];

    return {
      entities,
      deletedIds: [],
      serverTimestamp: new Date().toISOString(),
    };
  }

  async push(userId: string, mutations: SyncMutation[]) {
    const engine = new SyncEngine({
      getEntity: async (type, id) => {
        if (type === 'task') {
          return this.prisma.task.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'capacity') {
          return this.prisma.capacityEntry.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'sensory') {
          return this.prisma.sensoryEntry.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'routine') {
          return this.prisma.routine.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'support_contact') {
          return this.prisma.supportContact.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'food_item') {
          return this.prisma.foodItem.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'document') {
          return this.prisma.document.findFirst({ where: { id, userId } }) as any;
        }
        if (type === 'bill') {
          return this.prisma.bill.findFirst({ where: { id, userId } }) as any;
        }
        return null;
      },
      saveEntity: async (type, id, data) => {
        if (type === 'task') {
          await this.prisma.task.upsert({
            where: { id },
            create: {
              id,
              userId,
              title: data.title as string,
              description: data.description as string | undefined,
              priority: (data.priority as any) ?? 'MEDIUM',
              capacityDemand: (data.capacityDemand as number) ?? 50,
              sensoryDemand: (data.sensoryDemand as number) ?? 30,
              dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
              isPinned: (data.isPinned as boolean) ?? false,
              tinyStep: data.tinyStep as string | undefined,
            },
            update: {
              title: data.title as string,
              description: data.description as string | undefined,
              priority: (data.priority as any) ?? 'MEDIUM',
              capacityDemand: (data.capacityDemand as number) ?? 50,
              sensoryDemand: (data.sensoryDemand as number) ?? 30,
              dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
              isPinned: (data.isPinned as boolean) ?? false,
              tinyStep: data.tinyStep as string | undefined,
              updatedAt: new Date(),
            },
          });
        } else if (type === 'capacity') {
          await this.prisma.capacityEntry.upsert({
            where: { id },
            create: {
              id,
              userId,
              score: data.score as number,
              sleepHours: data.sleepHours as number | undefined,
              sleepQuality: data.sleepQuality as number | undefined,
              manualCheckIn: (data.manualCheckIn as boolean) ?? true,
            },
            update: {
              score: data.score as number,
              sleepHours: data.sleepHours as number | undefined,
              sleepQuality: data.sleepQuality as number | undefined,
              manualCheckIn: (data.manualCheckIn as boolean) ?? true,
            },
          });
        } else if (type === 'sensory') {
          await this.prisma.sensoryEntry.upsert({
            where: { id },
            create: {
              id,
              userId,
              load: data.load as number,
              ambientNoise: data.ambientNoise as number | undefined,
              lightLevel: data.lightLevel as number | undefined,
              screenTimeMinutes: data.screenTimeMinutes as number | undefined,
              motionLevel: data.motionLevel as number | undefined,
            },
            update: {
              load: data.load as number,
              ambientNoise: data.ambientNoise as number | undefined,
              lightLevel: data.lightLevel as number | undefined,
              screenTimeMinutes: data.screenTimeMinutes as number | undefined,
              motionLevel: data.motionLevel as number | undefined,
            },
          });
        } else if (type === 'routine') {
          await this.prisma.routine.upsert({
            where: { id },
            create: {
              id,
              userId,
              name: data.name as string,
              description: data.description as string | undefined,
              isActive: (data.isActive as boolean) ?? true,
            },
            update: {
              name: data.name as string,
              description: data.description as string | undefined,
              isActive: (data.isActive as boolean) ?? true,
              updatedAt: new Date(),
            },
          });
        } else if (type === 'support_contact') {
          await this.prisma.supportContact.upsert({
            where: { id },
            create: {
              id,
              userId,
              name: data.name as string,
              relationship: data.relationship as string | undefined,
              phone: data.phone as string | undefined,
              email: data.email as string | undefined,
              isEmergency: (data.isEmergency as boolean) ?? false,
            },
            update: {
              name: data.name as string,
              relationship: data.relationship as string | undefined,
              phone: data.phone as string | undefined,
              email: data.email as string | undefined,
              isEmergency: (data.isEmergency as boolean) ?? false,
              updatedAt: new Date(),
            },
          });
        } else if (type === 'food_item') {
          await this.prisma.foodItem.upsert({
            where: { id },
            create: {
              id,
              userId,
              name: data.name as string,
              quantity: data.quantity as number | undefined,
              unit: data.unit as string | undefined,
              inPantry: (data.inPantry as boolean) ?? true,
              expiresAt: data.expiresAt ? new Date(data.expiresAt as string) : undefined,
            },
            update: {
              name: data.name as string,
              quantity: data.quantity as number | undefined,
              unit: data.unit as string | undefined,
              inPantry: (data.inPantry as boolean) ?? true,
              expiresAt: data.expiresAt ? new Date(data.expiresAt as string) : undefined,
              updatedAt: new Date(),
            },
          });
        } else if (type === 'document') {
          await this.prisma.document.upsert({
            where: { id },
            create: {
              id,
              userId,
              title: data.title as string,
              fileName: data.fileName as string,
              mimeType: data.mimeType as string,
              storageKey: data.storageKey as string,
              isScaryMail: (data.isScaryMail as boolean) ?? false,
              aiConsentGiven: (data.aiConsentGiven as boolean) ?? false,
            },
            update: {
              title: data.title as string,
              fileName: data.fileName as string,
              mimeType: data.mimeType as string,
              storageKey: data.storageKey as string,
              isScaryMail: (data.isScaryMail as boolean) ?? false,
              aiConsentGiven: (data.aiConsentGiven as boolean) ?? false,
            },
          });
        } else if (type === 'bill') {
          await this.prisma.bill.upsert({
            where: { id },
            create: {
              id,
              userId,
              name: data.name as string,
              amount: data.amount as number,
              dueDate: new Date(data.dueDate as string),
              category: data.category as string,
              isPaid: (data.isPaid as boolean) ?? false,
              isProtected: (data.isProtected as boolean) ?? false,
              priority: (data.priority as number) ?? 5,
            },
            update: {
              name: data.name as string,
              amount: data.amount as number,
              dueDate: new Date(data.dueDate as string),
              category: data.category as string,
              isPaid: (data.isPaid as boolean) ?? false,
              isProtected: (data.isProtected as boolean) ?? false,
              priority: (data.priority as number) ?? 5,
              updatedAt: new Date(),
            },
          });
        }
      },
      deleteEntity: async (type, id) => {
        if (type === 'task') {
          await this.prisma.task.updateMany({
            where: { id, userId },
            data: { deletedAt: new Date() },
          });
        } else if (type === 'routine') {
          await this.prisma.routine.updateMany({
            where: { id, userId },
            data: { deletedAt: new Date() },
          });
        } else if (type === 'support_contact') {
          await this.prisma.supportContact.deleteMany({
            where: { id, userId },
          });
        } else if (type === 'food_item') {
          await this.prisma.foodItem.deleteMany({
            where: { id, userId },
          });
        } else if (type === 'document') {
          await this.prisma.document.updateMany({
            where: { id, userId },
            data: { deletedAt: new Date() },
          });
        } else if (type === 'bill') {
          await this.prisma.bill.updateMany({
            where: { id, userId },
            data: { deletedAt: new Date() },
          });
        } else if (type === 'capacity') {
          await this.prisma.capacityEntry.deleteMany({
            where: { id, userId },
          });
        } else if (type === 'sensory') {
          await this.prisma.sensoryEntry.deleteMany({
            where: { id, userId },
          });
        }
      },
      getChangesSince: async (timestamp) => this.pull(userId, timestamp),
    });

    return engine.push(mutations);
  }
}
