import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CapacityService {
  constructor(private prisma: PrismaService) {}

  async getLatest(userId: string) {
    const [capacity, sensory] = await Promise.all([
      this.prisma.capacityEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.sensoryEntry.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return {
      capacity: capacity ?? { score: 50 },
      sensory: sensory ?? { load: 30 },
    };
  }

  async recordCapacity(userId: string, data: Record<string, unknown>) {
    return this.prisma.capacityEntry.create({
      data: {
        userId,
        score: data.score as number,
        sleepHours: data.sleepHours as number | undefined,
        sleepQuality: data.sleepQuality as number | undefined,
        manualCheckIn: (data.manualCheckIn as boolean) ?? true,
      },
    });
  }

  async recordSensory(userId: string, data: Record<string, unknown>) {
    return this.prisma.sensoryEntry.create({
      data: {
        userId,
        load: data.load as number,
        ambientNoise: data.ambientNoise as number | undefined,
        lightLevel: data.lightLevel as number | undefined,
        screenTimeMinutes: data.screenTimeMinutes as number | undefined,
        motionLevel: data.motionLevel as number | undefined,
      },
    });
  }
}
