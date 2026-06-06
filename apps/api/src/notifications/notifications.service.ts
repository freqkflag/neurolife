import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue, Worker } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private queue: Queue | null = null;

  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    const redisUrl = config.get('REDIS_URL', 'redis://localhost:6379');
    try {
      this.queue = new Queue('notifications', { connection: { url: redisUrl } });
    } catch {
      this.queue = null;
    }
  }

  async scheduleBillReminder(userId: string, billId: string, dueDate: Date) {
    if (!this.queue) return { scheduled: false, reason: 'Redis unavailable' };

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (profile?.shutdownMode) return { scheduled: false, reason: 'Shutdown mode active' };

    await this.queue.add(
      'bill-due',
      {
        userId,
        billId,
        message: 'A bill is coming due. One tiny action: check the amount.',
        tinyNextAction: 'Open your bills and note the next due date.',
      },
      { delay: Math.max(0, dueDate.getTime() - Date.now() - 3 * 24 * 60 * 60 * 1000) },
    );

    return { scheduled: true };
  }

  async getRules(userId: string) {
    return this.prisma.notificationRule.findMany({ where: { userId } });
  }

  async updateRule(userId: string, type: string, enabled: boolean) {
    return this.prisma.notificationRule.upsert({
      where: { id: `${userId}-${type}` },
      create: { id: `${userId}-${type}`, userId, type, enabled },
      update: { enabled },
    });
  }

  async snooze(userId: string, type: string, minutes: number) {
    const rule = await this.prisma.notificationRule.findFirst({
      where: { userId, type },
    });
    if (!rule) return null;

    return this.prisma.notificationRule.update({
      where: { id: rule.id },
      data: { snoozeUntil: new Date(Date.now() + minutes * 60 * 1000) },
    });
  }
}
