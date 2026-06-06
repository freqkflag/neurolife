import { Injectable, NotFoundException } from '@nestjs/common';
import pdf from 'pdf-parse';
import { createWorker } from 'tesseract.js';
import { AuditService } from '../common/audit.service';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageService } from './local-storage.service';

const DATE_PATTERN =
  /\b(?:\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4})\b/gi;

export type ExtractionStatus =
  | 'extracted'
  | 'analyzed'
  | 'failed'
  | 'ocr_unavailable'
  | 'empty';

const MAX_STORED_TEXT = 50_000;

@Injectable()
export class DocumentExtractionService {
  constructor(
    private prisma: PrismaService,
    private localStorage: LocalStorageService,
    private audit: AuditService,
    private ai: AiService,
  ) {}

  async listExtractions(userId: string, documentId: string) {
    await this.requireDocument(userId, documentId);
    return this.prisma.documentExtraction.findMany({
      where: { documentId },
      orderBy: { extractedAt: 'desc' },
    });
  }

  async extractTextFromDocument(userId: string, documentId: string) {
    const doc = await this.requireDocument(userId, documentId);
    const kind = this.localStorage.kindForStorageKey(doc.storageKey);
    const buffer = await this.localStorage.readBuffer(doc.storageKey);

    let rawText: string | null = null;
    let status: ExtractionStatus = 'extracted';
    let summary = 'Text extracted successfully.';

    try {
      if (kind === 'text') {
        rawText = buffer.toString('utf8');
      } else if (kind === 'pdf') {
        rawText = await this.extractPdfText(buffer);
        if (!rawText?.trim()) {
          status = 'ocr_unavailable';
          summary = this.statusMessage('ocr_unavailable', 'pdf');
        }
      } else if (kind === 'image') {
        rawText = await this.extractImageText(buffer);
        if (!rawText?.trim()) {
          status = 'ocr_unavailable';
          summary = this.statusMessage('ocr_unavailable', 'image');
        }
      } else {
        status = 'failed';
        summary = this.statusMessage('failed');
      }
    } catch {
      status = kind === 'image' || kind === 'pdf' ? 'ocr_unavailable' : 'failed';
      summary = this.statusMessage(status, kind === 'pdf' ? 'pdf' : kind === 'image' ? 'image' : undefined);
    }

    if (status === 'extracted' && !rawText?.trim()) {
      status = 'empty';
      summary = 'No readable text found in this file.';
    }

    const storedText = rawText?.trim() ? rawText.slice(0, MAX_STORED_TEXT) : null;
    const missingInfo =
      status === 'extracted'
        ? []
        : [summary, 'Paste key text into Scary Mail if you need a summary now.'];

    const extraction = await this.prisma.documentExtraction.create({
      data: {
        documentId,
        rawText: storedText,
        status,
        summary,
        requiredActions: status === 'extracted' ? [] : ['File is stored safely'],
        missingInfo,
      },
    });

    await this.audit.log(userId, 'DOCUMENT_EXTRACT', 'document', documentId, { kind, status });

    return {
      ...extraction,
      kind,
      textLength: storedText?.length ?? 0,
    };
  }

  async analyzeDocument(userId: string, documentId: string) {
    const doc = await this.requireDocument(userId, documentId);
    const profile = await this.prisma.profile.findUnique({ where: { userId } });

    let extraction = await this.prisma.documentExtraction.findFirst({
      where: { documentId, status: 'extracted', rawText: { not: null } },
      orderBy: { extractedAt: 'desc' },
    });

    if (!extraction?.rawText) {
      const extracted = await this.extractTextFromDocument(userId, documentId);
      if (extracted.status !== 'extracted' || !extracted.rawText) {
        return this.buildPendingResponse(extracted, doc);
      }
      extraction = extracted;
    }

    const text = extraction.rawText!;
    const clipped = text.slice(0, 8000);
    const dates = [...new Set(clipped.match(DATE_PATTERN) ?? [])];

    const aiResult = await this.ai.process(
      userId,
      `Analyze this document for deadlines and required actions.\n\nTitle: ${doc.title}\nType: ${doc.docType}\n\n${clipped}`,
      {},
      { specialist: 'admin_paperwork', consentGiven: doc.aiConsentGiven },
    );

    const parsedDeadline = this.parseDeadline(dates, doc.deadline);
    const cards = aiResult.output.cards ?? [];
    const requiredActions = this.collectRequiredActions(aiResult.output, cards);
    const missingInfo = cards
      .filter((c) => c.type === 'missing' || /missing/i.test(c.title))
      .map((c) => c.body);

    const updated = await this.prisma.documentExtraction.update({
      where: { id: extraction.id },
      data: {
        status: 'analyzed',
        summary: aiResult.output.summary,
        requiredActions: requiredActions.slice(0, 5),
        missingInfo,
        cards: cards as object[],
        deadline: parsedDeadline,
      },
    });

    await this.audit.log(userId, 'AI_EXTRACT', 'document', documentId, {
      specialist: aiResult.specialist,
      privacyMode: profile?.privacyMode ?? 'HYBRID',
    });

    return this.buildAnalysisResponse(updated, aiResult, dates);
  }

  async analyzeText(
    userId: string,
    content: string,
    options?: { documentId?: string; fallbackDeadline?: Date | null },
  ) {
    const clipped = content.slice(0, 8000);
    const dates = [...new Set(clipped.match(DATE_PATTERN) ?? [])];

    const aiResult = await this.ai.process(
      userId,
      `Summarize this scary mail safely. Extract deadlines and one tiny next action.\n\n${clipped}`,
      {},
      { specialist: 'admin_paperwork', consentGiven: true },
    );

    const cards = aiResult.output.cards ?? [];
    const requiredActions = this.collectRequiredActions(aiResult.output, cards);
    const missingInfo = cards
      .filter((c) => c.type === 'missing' || /missing/i.test(c.title))
      .map((c) => c.body);
    const parsedDeadline = this.parseDeadline(dates, options?.fallbackDeadline ?? null);

    let extraction = null;
    if (options?.documentId) {
      extraction = await this.prisma.documentExtraction.create({
        data: {
          documentId: options.documentId,
          rawText: clipped,
          status: 'analyzed',
          summary: aiResult.output.summary,
          requiredActions: requiredActions.slice(0, 5),
          missingInfo,
          cards: cards as object[],
          deadline: parsedDeadline,
        },
      });
      await this.audit.log(userId, 'AI_EXTRACT', 'document', options.documentId);
    }

    return {
      ...(extraction ?? {}),
      summary: aiResult.output.summary,
      tinyNextAction: aiResult.output.tinyNextAction,
      requiredAction: requiredActions[0] ?? aiResult.output.tinyNextAction,
      deadlineText:
        cards.find((c) => c.type === 'deadline' || /deadline/i.test(c.title))?.body ??
        (dates[0] ? `Possible date: ${dates[0]}` : 'No clear deadline found'),
      cards,
      missingInfo,
      specialist: aiResult.specialist,
      status: 'analyzed',
    };
  }

  private async requireDocument(userId: string, documentId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, userId, deletedAt: null },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    const result = await pdf(buffer);
    return result.text ?? '';
  }

  private async extractImageText(buffer: Buffer): Promise<string | null> {
    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      worker = await createWorker('eng');
      const { data } = await worker.recognize(buffer);
      return data.text ?? '';
    } catch {
      return null;
    } finally {
      if (worker) await worker.terminate();
    }
  }

  private parseDeadline(dates: string[], fallback?: Date | null): Date | null {
    const fromText = dates[0] ? new Date(dates[0]) : null;
    const candidate = fromText && !Number.isNaN(fromText.getTime()) ? fromText : fallback ?? null;
    return candidate && !Number.isNaN(candidate.getTime()) ? candidate : null;
  }

  private collectRequiredActions(
    output: { tinyNextAction: string; cards?: Array<{ title: string; body: string; type?: string }> },
    cards: Array<{ title: string; body: string; type?: string }>,
  ): string[] {
    const fromCards = cards
      .filter((c) => c.type === 'action' || /action|required/i.test(c.title))
      .map((c) => c.body);
    if (fromCards.length > 0) return fromCards;
    return ['Review the summary and note any dates mentioned'];
  }

  private buildAnalysisResponse(
    extraction: {
      id: string;
      summary: string;
      deadline: Date | null;
      requiredActions: string[];
      missingInfo: string[];
      status: string;
      cards: unknown;
      extractedAt: Date;
    },
    aiResult: { specialist: string; output: { tinyNextAction: string; cards?: Array<{ title: string; body: string; type?: string }> } },
    dates: string[],
  ) {
    const cards = (extraction.cards as Array<{ title: string; body: string; type?: string }> | null) ?? aiResult.output.cards ?? [];
    const deadlineCard = cards.find((c) => c.type === 'deadline' || /deadline/i.test(c.title));

    return {
      ...extraction,
      status: 'analyzed',
      tinyNextAction: aiResult.output.tinyNextAction,
      requiredAction: extraction.requiredActions[0] ?? aiResult.output.tinyNextAction,
      deadlineText: deadlineCard?.body ?? (dates[0] ? `Possible date: ${dates[0]}` : null),
      cards,
      specialist: aiResult.specialist,
    };
  }

  private buildPendingResponse(
    extraction: { status: string; summary: string; requiredActions: string[]; missingInfo: string[] },
    doc: { deadline: Date | null },
  ) {
    return {
      ...extraction,
      status: extraction.status,
      tinyNextAction:
        extraction.status === 'ocr_unavailable'
          ? 'Paste the first paragraph into Scary Mail for now.'
          : 'File saved. Try a TXT or MD upload, or paste text in Scary Mail.',
      requiredAction: extraction.requiredActions[0] ?? extraction.summary,
      deadlineText: doc.deadline ? doc.deadline.toISOString() : null,
      cards: [
        { title: 'Summary', body: extraction.summary, type: 'summary' },
        {
          title: 'Missing info',
          body: extraction.missingInfo.join(' ') || extraction.summary,
          type: 'missing',
        },
      ],
    };
  }

  private statusMessage(status: ExtractionStatus, kind?: 'pdf' | 'image'): string {
    if (status === 'ocr_unavailable' && kind === 'pdf') {
      return 'PDF saved, but no text layer was found. Scanned PDFs need OCR — paste text in Scary Mail for now.';
    }
    if (status === 'ocr_unavailable' && kind === 'image') {
      return 'Image saved, but OCR could not read text. Try a clearer photo or paste text in Scary Mail.';
    }
    if (status === 'empty') return 'No readable text found in this file.';
    if (status === 'failed') return 'Could not extract text from this file type.';
    return 'Text extracted successfully.';
  }
}
