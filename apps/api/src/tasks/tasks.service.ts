import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.task.findMany({
      where: { userId, deletedAt: null },
      orderBy: [{ isPinned: 'desc' }, { dueDate: 'asc' }],
    });
  }

  async create(userId: string, data: Record<string, unknown>) {
    return this.prisma.task.create({
      data: {
        userId,
        title: data.title as string,
        description: data.description as string | undefined,
        priority: (data.priority as never) ?? 'MEDIUM',
        capacityDemand: (data.capacityDemand as number) ?? 50,
        sensoryDemand: (data.sensoryDemand as number) ?? 30,
        dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
        isPinned: (data.isPinned as boolean) ?? false,
        tinyStep: data.tinyStep as string | undefined,
      },
    });
  }

  async complete(userId: string, taskId: string) {
    return this.prisma.task.updateMany({
      where: { id: taskId, userId },
      data: { completedAt: new Date() },
    });
  }

  async listRoutines(userId: string) {
    return this.prisma.routine.findMany({
      where: { userId, deletedAt: null, isActive: true },
      include: { steps: { orderBy: { order: 'asc' } } },
    });
  }

  async createRoutine(userId: string, data: Record<string, unknown>) {
    const steps = (data.steps as Array<{ title: string; order: number }>) ?? [];
    return this.prisma.routine.create({
      data: {
        userId,
        name: data.name as string,
        description: data.description as string | undefined,
        steps: {
          create: steps.map((s) => ({
            order: s.order,
            title: s.title,
          })),
        },
      },
      include: { steps: true },
    });
  }
}
