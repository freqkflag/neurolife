import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AuditService } from '../common/audit.service';

@Module({
  controllers: [AiController],
  providers: [AiService, AuditService],
})
export class AiModule {}
