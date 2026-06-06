import { Injectable } from '@nestjs/common';
import { encryptField, getMasterKey } from '@neurolife/encryption';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async listTasks(userId: string) {
    return this.prisma.adminTask.findMany({
      where: { userId, deletedAt: null },
      orderBy: { deadline: 'asc' },
    });
  }

  async createTask(userId: string, data: Record<string, unknown>) {
    return this.prisma.adminTask.create({
      data: {
        userId,
        title: data.title as string,
        description: data.description as string | undefined,
        deadline: data.deadline ? new Date(data.deadline as string) : undefined,
        category: data.category as string | undefined,
        documentId: data.documentId as string | undefined,
      },
    });
  }

  async listDisabilityNotes(userId: string) {
    const notes = await this.prisma.disabilityNote.findMany({
      where: { userId, deletedAt: null },
      orderBy: { date: 'desc' },
    });
    return notes.map((n) => ({
      ...n,
      content: '[encrypted]',
    }));
  }

  async createDisabilityNote(userId: string, data: Record<string, unknown>) {
    const encrypted = encryptField(data.content as string, getMasterKey());
    return this.prisma.disabilityNote.create({
      data: {
        userId,
        title: data.title as string,
        content: encrypted,
        providerName: data.providerName as string | undefined,
        date: new Date(data.date as string),
      },
    });
  }
}
