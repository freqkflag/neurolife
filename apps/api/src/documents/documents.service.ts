import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from './local-storage.service';

const DATE_PATTERN =
  /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
    private localStorage: LocalStorageService,
    private ai: AiService,
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

  async analyze(userId: string, documentId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const kind = this.localStorage.kindForStorageKey(doc.storageKey);

    if (kind === 'pdf' || kind === 'image') {
      // TODO: Wire OCR/PDF text extraction pipeline (tesseract, pdf-parse, etc.)
      const extraction = await this.prisma.documentExtraction.create({
        data: {
          documentId,
          summary: 'File saved. Text extraction for this file type is next.',
          requiredActions: ['File is stored safely', 'Paste key text into Scary Mail if you need a summary now'],
          deadline: doc.deadline,
        },
      });
      await this.audit.log(userId, 'AI_EXTRACT_PENDING', 'document', documentId, { kind });
      return {
        ...extraction,
        status: 'pending_extraction',
        tinyNextAction: 'File saved. Text extraction for this file type is next.',
        requiredAction: 'Open Scary Mail and paste the first paragraph, or wait for OCR support.',
      };
    }

    const text = await this.localStorage.readText(doc.storageKey);
    if (!text?.trim()) {
      throw new BadRequestException('Could not read text from this document.');
    }

    const clipped = text.slice(0, 8000);
    const dates = [...new Set(clipped.match(DATE_PATTERN) ?? [])];

    const aiResult = await this.ai.process(
      userId,
      `Analyze this document for deadlines and required actions.\n\nTitle: ${doc.title}\nType: ${doc.docType}\n\n${clipped}`,
      {},
      { specialist: 'admin_paperwork', consentGiven: doc.aiConsentGiven },
    );

    const deadlineFromText = dates[0] ? new Date(dates[0]) : doc.deadline;
    const parsedDeadline =
      deadlineFromText && !Number.isNaN(deadlineFromText.getTime()) ? deadlineFromText : doc.deadline;

    const requiredActions =
      aiResult.output.cards
        ?.filter((c) => /action|required/i.test(c.title))
        .map((c) => c.body) ?? ['Review the summary and note any dates mentioned'];

    const extraction = await this.prisma.documentExtraction.create({
      data: {
        documentId,
        summary: aiResult.output.summary,
        requiredActions: requiredActions.slice(0, 5),
        deadline: parsedDeadline,
      },
    });

    await this.audit.log(userId, 'AI_EXTRACT', 'document', documentId, {
      specialist: aiResult.specialist,
      privacyMode: profile?.privacyMode ?? 'HYBRID',
    });

    const deadlineCard = aiResult.output.cards?.find(
      (c) => c.type === 'deadline' || /deadline/i.test(c.title),
    );

    return {
      ...extraction,
      status: 'analyzed',
      tinyNextAction: aiResult.output.tinyNextAction,
      requiredAction: requiredActions[0] ?? aiResult.output.tinyNextAction,
      deadlineText: deadlineCard?.body ?? (dates[0] ? `Possible date: ${dates[0]}` : null),
      specialist: aiResult.specialist,
    };
  }

  async extractScaryMail(userId: string, documentId: string, content: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, userId },
    });
    if (!doc) throw new NotFoundException('Document not found');

    return this.analyzeFromText(userId, documentId, content, doc.deadline);
  }

  async analyzeFromText(userId: string, documentId: string | null, content: string, fallbackDeadline?: Date | null) {
    const clipped = content.slice(0, 8000);
    const dates = [...new Set(clipped.match(DATE_PATTERN) ?? [])];

    const aiResult = await this.ai.process(
      userId,
      `Summarize this scary mail safely. Extract deadlines and one tiny next action.\n\n${clipped}`,
      {},
      { specialist: 'admin_paperwork', consentGiven: true },
    );

    const deadlineFromText = dates[0] ? new Date(dates[0]) : fallbackDeadline ?? null;
    const parsedDeadline =
      deadlineFromText && !Number.isNaN(deadlineFromText.getTime()) ? deadlineFromText : fallbackDeadline ?? null;

    const requiredActions =
      aiResult.output.cards
        ?.filter((c) => /action|required/i.test(c.title))
        .map((c) => c.body) ?? ['Review the summary'];

    let extraction = null;
    if (documentId) {
      extraction = await this.prisma.documentExtraction.create({
        data: {
          documentId,
          summary: aiResult.output.summary,
          requiredActions: requiredActions.slice(0, 5),
          deadline: parsedDeadline,
        },
      });
      await this.audit.log(userId, 'AI_EXTRACT', 'document', documentId);
    }

    const deadlineCard = aiResult.output.cards?.find(
      (c) => c.type === 'deadline' || /deadline/i.test(c.title),
    );

    return {
      ...(extraction ?? {}),
      summary: aiResult.output.summary,
      tinyNextAction: aiResult.output.tinyNextAction,
      requiredAction: requiredActions[0] ?? aiResult.output.tinyNextAction,
      deadlineText: deadlineCard?.body ?? (dates[0] ? `Possible date: ${dates[0]}` : 'No clear deadline found'),
      cards: aiResult.output.cards,
      specialist: aiResult.specialist,
    };
  }
}
