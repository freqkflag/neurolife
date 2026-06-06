import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000' });
  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(`NeuroLife API running on http://localhost:${port}`);
}

bootstrap();
