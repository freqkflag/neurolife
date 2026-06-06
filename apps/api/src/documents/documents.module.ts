import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { StorageService } from './storage.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, AuditService],
})
export class DocumentsModule {}
