import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}

  async get(userId: string) {
    return this.prisma.profile.findUnique({ where: { userId } });
  }

  async update(userId: string, data: Record<string, unknown>) {
    return this.prisma.profile.update({
      where: { userId },
      data: {
        displayName: data.displayName as string | undefined,
        privacyMode: data.privacyMode as never,
        theme: data.theme as never,
        quietHoursStart: data.quietHoursStart as string | undefined,
        quietHoursEnd: data.quietHoursEnd as string | undefined,
        shutdownMode: data.shutdownMode as boolean | undefined,
        diabetesAwareMeals: data.diabetesAwareMeals as boolean | undefined,
        medicationReminders: data.medicationReminders as boolean | undefined,
      },
    });
  }

  async exportData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        tasks: true,
        bills: true,
        documents: true,
        supportContacts: true,
      },
    });
    return user;
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
    return { deleted: true };
  }
}
