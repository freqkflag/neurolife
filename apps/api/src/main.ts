import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) return ['http://localhost:3000'];
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

function isDevLanOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3})(:\d+)?$/.test(origin);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const allowedOrigins = parseCorsOrigins();
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean | string) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin ?? allowedOrigins[0]);
        return;
      }
      if (process.env.NODE_ENV !== 'production' && isDevLanOrigin(origin)) {
        callback(null, origin);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  });
  const port = Number(process.env.API_PORT ?? 3001);
  const host = process.env.API_HOST ?? '0.0.0.0';
  await app.listen(port, host);
  console.log(`NeuroLife API running on http://${host}:${port}`);
}

bootstrap();
