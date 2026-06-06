import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { AuditService } from '../common/audit.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.service';

@Module({
  imports: [AiModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, LocalStorageService, AuditService],
})
export class DocumentsModule {}
