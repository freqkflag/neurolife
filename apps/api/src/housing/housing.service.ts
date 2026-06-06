import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HousingService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.housingItem.findMany({
      where: { userId, deletedAt: null },
      orderBy: { dueDate: 'asc' },
    });
  }

  async create(userId: string, data: Record<string, unknown>) {
    return this.prisma.housingItem.create({
      data: {
        userId,
        type: data.type as never,
        title: data.title as string,
        amount: data.amount as number | undefined,
        dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
        status: (data.status as never) ?? 'PENDING',
        notes: data.notes as string | undefined,
      },
    });
  }

  async getRentCountdown(userId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const rentDue = profile?.rentDueDate;
    if (!rentDue) {
      return { daysUntil: null, tinyNextAction: 'Set your rent due date in settings.' };
    }
    const daysUntil = Math.ceil(
      (rentDue.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return {
      rentDueDate: rentDue,
      daysUntil,
      tinyNextAction:
        daysUntil <= 7
          ? 'Confirm rent amount is set aside.'
          : 'No urgent rent action today.',
    };
  }
}
