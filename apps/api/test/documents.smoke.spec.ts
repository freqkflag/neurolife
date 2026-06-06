import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

function expect2xx(status: number) {
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(300);
}

describe('Documents API (smoke)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken = '';
  let otherUserToken = '';
  let documentId = '';
  const testEmail = `docs-smoke-${Date.now()}@neurolife.local`;
  const otherEmail = `docs-other-${Date.now()}@neurolife.local`;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    prisma = app.get(PrismaService);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: testEmail, password: 'test-pass-123', displayName: 'Docs Smoke' })
      .expect(201)
      .then((res) => {
        accessToken = res.body.accessToken;
      });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: otherEmail, password: 'test-pass-123', displayName: 'Other User' })
      .expect(201)
      .then((res) => {
        otherUserToken = res.body.accessToken;
      });
  });

  afterAll(async () => {
    const user = await prisma.user.findUnique({ where: { email: testEmail } });
    if (user) {
      await prisma.documentExtraction.deleteMany({ where: { document: { userId: user.id } } });
      await prisma.document.deleteMany({ where: { userId: user.id } });
      await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
      await prisma.profile.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
    const other = await prisma.user.findUnique({ where: { email: otherEmail } });
    if (other) {
      await prisma.refreshToken.deleteMany({ where: { userId: other.id } });
      await prisma.profile.deleteMany({ where: { userId: other.id } });
      await prisma.user.delete({ where: { id: other.id } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('rejects unauthenticated document list', async () => {
    await request(app.getHttpServer()).get('/documents').expect(401);
  });

  it('uploads a TXT document', async () => {
    const fixture = readFileSync(join(__dirname, 'fixtures', 'sample-letter.txt'));
    const res = await request(app.getHttpServer())
      .post('/documents/upload')
      .set('Authorization', `Bearer ${accessToken}`)
      .field('title', 'Benefits Notice')
      .field('docType', 'benefits')
      .attach('file', fixture, 'sample-letter.txt');

    expect2xx(res.status);
    expect(res.body.id).toBeDefined();
    expect(res.body.fileName).toBe('sample-letter.txt');
    documentId = res.body.id;
  });

  it('extracts text from uploaded document', async () => {
    const res = await request(app.getHttpServer())
      .post(`/documents/${documentId}/extract`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect2xx(res.status);
    expect(res.body.status).toBe('extracted');
    expect(res.body.rawText).toContain('NOTICE OF ACTION REQUIRED');
    expect(res.body.textLength).toBeGreaterThan(20);
  });

  it('analyzes document and returns structured cards', async () => {
    const res = await request(app.getHttpServer())
      .post(`/documents/${documentId}/analyze`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect2xx(res.status);
    expect(res.body.status).toBe('analyzed');
    expect(res.body.summary).toBeTruthy();
    expect(res.body.tinyNextAction).toBeTruthy();
    expect(Array.isArray(res.body.cards)).toBe(true);
    expect(res.body.cards.length).toBeGreaterThan(0);
  });

  it('lists extractions for a document', async () => {
    const res = await request(app.getHttpServer())
      .get(`/documents/${documentId}/extractions`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect2xx(res.status);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].summary).toBeTruthy();
  });

  it('analyzes pasted text via analyze-text endpoint', async () => {
    const res = await request(app.getHttpServer())
      .post('/documents/analyze-text')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ content: 'You must respond by 12/01/2026. Submit form 44-B.' });

    expect2xx(res.status);
    expect(res.body.summary).toBeTruthy();
    expect(res.body.tinyNextAction).toBeTruthy();
    expect(res.body.status).toBe('analyzed');
  });

  it('blocks unauthorized access to another user document', async () => {
    await request(app.getHttpServer())
      .post(`/documents/${documentId}/analyze`)
      .set('Authorization', `Bearer ${otherUserToken}`)
      .expect(404);
  });
});
