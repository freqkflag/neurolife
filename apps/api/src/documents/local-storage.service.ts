import { BadRequestException, Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';

const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'text/plain',
  'text/markdown',
]);

const ALLOWED_EXT = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.txt', '.md']);

export type StoredFileKind = 'text' | 'pdf' | 'image' | 'unknown';

@Injectable()
export class LocalStorageService {
  private root = resolve(process.cwd(), 'storage', 'documents');

  async save(userId: string, file: Express.Multer.File): Promise<{ storageKey: string; kind: StoredFileKind }> {
    if (!file?.buffer?.length) throw new BadRequestException('No file provided');
    if (file.size > MAX_BYTES) throw new BadRequestException('File exceeds 10MB limit');

    const ext = this.extension(file.originalname);
    if (!ALLOWED_EXT.has(ext)) {
      throw new BadRequestException('Unsupported file type. Use PDF, PNG, JPG, TXT, or MD.');
    }
    if (file.mimetype && !ALLOWED_MIME.has(file.mimetype) && file.mimetype !== 'application/octet-stream') {
      throw new BadRequestException(`Unsupported MIME type: ${file.mimetype}`);
    }

    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120);
    const storageKey = join(userId, `${randomUUID()}-${safeName}`);
    const fullPath = join(this.root, storageKey);

    await mkdir(join(this.root, userId), { recursive: true });
    await writeFile(fullPath, file.buffer);

    return { storageKey, kind: this.kindFor(ext, file.mimetype) };
  }

  async readBuffer(storageKey: string): Promise<Buffer> {
    const fullPath = join(this.root, storageKey);
    return readFile(fullPath);
  }

  async readText(storageKey: string): Promise<string | null> {
    const kind = this.kindForStorageKey(storageKey);
    if (kind !== 'text') return null;
    const buf = await this.readBuffer(storageKey);
    return buf.toString('utf8');
  }

  kindForStorageKey(storageKey: string): StoredFileKind {
    return this.kindFor(this.extension(storageKey));
  }

  private kindFor(ext: string, mime?: string): StoredFileKind {
    if (ext === '.txt' || ext === '.md' || mime === 'text/plain' || mime === 'text/markdown') return 'text';
    if (ext === '.pdf' || mime === 'application/pdf') return 'pdf';
    if (['.png', '.jpg', '.jpeg'].includes(ext) || mime?.startsWith('image/')) return 'image';
    return 'unknown';
  }

  private extension(name: string): string {
    const idx = name.lastIndexOf('.');
    return idx >= 0 ? name.slice(idx).toLowerCase() : '';
  }
}
