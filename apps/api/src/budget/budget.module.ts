import { Module } from '@nestjs/common';
import { AuditService } from '../common/audit.service';
import { BudgetController } from './budget.controller';
import { BudgetService } from './budget.service';
import { SafeToSpendService } from './safe-to-spend.service';

@Module({
  controllers: [BudgetController],
  providers: [BudgetService, SafeToSpendService, AuditService],
  exports: [SafeToSpendService],
})
export class BudgetModule {}
