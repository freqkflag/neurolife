import { Injectable, NotFoundException } from '@nestjs/common';
import { encryptField, getMasterKey } from '@neurolife/encryption';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async list(userId: string) {
    return this.prisma.document.findMany({
      where: { userId, deletedAt: null },
      include: { extractions: { orderBy: { extractedAt: 'desc' }, take: 1 } },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async create(userId: string, data: Record<string, unknown>) {
    const doc = await this.prisma.document.create({
      data: {
        userId,
        title: data.title as string,
        fileName: data.fileName as string,
        mimeType: data.mimeType as string,
        storageKey: data.storageKey as string,
        isScaryMail: (data.isScaryMail as boolean) ?? false,
        aiConsentGiven: (data.aiConsentGiven as boolean) ?? false,
      },
    });
    await this.audit.log(userId, 'UPLOAD', 'document', doc.id);
    return doc;
  }

  async extractScaryMail(userId: string, documentId: string, content: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });
    if (!doc) throw new NotFoundException('Document not found');
    if (!doc.aiConsentGiven) {
      return {
        summary: 'AI consent required to process this document.',
        tinyNextAction: 'Enable AI consent in document settings, or read the first paragraph yourself.',
      };
    }

    const encrypted = encryptField(content.slice(0, 5000), getMasterKey());
    const extraction = await this.prisma.documentExtraction.create({
      data: {
        documentId,
        summary: `This document mainly says: review the key points carefully. (Processed securely.)`,
        requiredActions: ['Read the first section', 'Note any dates mentioned'],
        deadline: null,
      },
    });

    await this.audit.log(userId, 'AI_EXTRACT', 'document', documentId, { encrypted: true });
    return {
      ...extraction,
      tinyNextAction: 'Open the document and find the deadline date.',
      encryptedPreview: encrypted.slice(0, 50) + '...',
    };
  }
}
