import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async list(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId, deletedAt: null },
      orderBy: { dateTime: 'asc' },
    });
  }

  async create(userId: string, data: Record<string, unknown>) {
    return this.prisma.appointment.create({
      data: {
        userId,
        title: data.title as string,
        provider: data.provider as string | undefined,
        dateTime: new Date(data.dateTime as string),
        location: data.location as string | undefined,
        prepNotes: data.prepNotes as string | undefined,
        questionsToAsk: (data.questionsToAsk as string[]) ?? [],
        travelBufferMinutes: (data.travelBufferMinutes as number) ?? 30,
      },
    });
  }

  async generatePrep(userId: string, appointmentId: string) {
    const appt = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, userId },
    });
    if (!appt) return null;

    return {
      title: appt.title,
      questionsToAsk: [
        'What should I watch for between now and next visit?',
        'Are there accommodations that could help?',
        'What is the next step if symptoms change?',
      ],
      tinyNextAction: 'Write down your top 3 symptoms to mention.',
      bringList: ['Insurance card', 'Medication list', 'Notes about recent changes'],
    };
  }
}
