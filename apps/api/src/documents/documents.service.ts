import { Injectable } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentExtractionService } from './document-extraction.service';
import { LocalStorageService } from './local-storage.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private localStorage: LocalStorageService,
    private extraction: DocumentExtractionService,
  ) {}

  async list(userId: string) {
    return this.prisma.document.findMany({
      where: { userId, deletedAt: null },
      include: { extractions: { orderBy: { extractedAt: 'desc' }, take: 3 } },
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
        docType: (data.docType as string) ?? 'other',
        deadline: data.deadline ? new Date(data.deadline as string) : null,
        notes: (data.notes as string) ?? null,
        isScaryMail: (data.isScaryMail as boolean) ?? false,
        aiConsentGiven: (data.aiConsentGiven as boolean) ?? true,
      },
    });
    await this.audit.log(userId, 'UPLOAD', 'document', doc.id);
    return doc;
  }

  async upload(
    userId: string,
    file: Express.Multer.File,
    meta: { title?: string; docType?: string; deadline?: string; notes?: string; isScaryMail?: boolean },
  ) {
    const { storageKey } = await this.localStorage.save(userId, file);
    const title = meta.title?.trim() || file.originalname.replace(/\.[^.]+$/, '') || 'Untitled document';

    return this.create(userId, {
      title,
      fileName: file.originalname,
      mimeType: file.mimetype || 'application/octet-stream',
      storageKey,
      docType: meta.docType ?? 'other',
      deadline: meta.deadline || null,
      notes: meta.notes || null,
      isScaryMail: meta.isScaryMail ?? meta.docType === 'scary-mail',
      aiConsentGiven: true,
    });
  }

  extractText(userId: string, documentId: string) {
    return this.extraction.extractTextFromDocument(userId, documentId);
  }

  analyze(userId: string, documentId: string) {
    return this.extraction.analyzeDocument(userId, documentId);
  }

  listExtractions(userId: string, documentId: string) {
    return this.extraction.listExtractions(userId, documentId);
  }

  analyzeText(userId: string, content: string, documentId?: string) {
    return this.extraction.analyzeText(userId, content, { documentId });
  }
}
