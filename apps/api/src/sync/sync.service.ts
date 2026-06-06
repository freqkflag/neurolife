import { Injectable } from '@nestjs/common';
import { SyncEngine } from '@neurolife/sync';
import type { SyncMutation } from '@neurolife/sync';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async pull(userId: string, since: string) {
    const sinceDate = new Date(since);

    const [tasks, capacity, sensory] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId, updatedAt: { gt: sinceDate } },
      }),
      this.prisma.capacityEntry.findMany({
        where: { userId, createdAt: { gt: sinceDate } },
      }),
      this.prisma.sensoryEntry.findMany({
        where: { userId, createdAt: { gt: sinceDate } },
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
          const t = await this.prisma.task.findFirst({ where: { id, userId } });
          return t as unknown as Record<string, unknown> | null;
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
            },
            update: {
              title: data.title as string,
              description: data.description as string | undefined,
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
        }
      },
      getChangesSince: async (timestamp) => this.pull(userId, timestamp),
    });

    return engine.push(mutations);
  }
}
