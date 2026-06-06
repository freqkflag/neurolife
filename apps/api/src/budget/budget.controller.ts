import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetService } from './budget.service';
import { PaydayPlanService } from './payday-plan.service';
import { SafeToSpendService } from './safe-to-spend.service';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(
    private budget: BudgetService,
    private safeToSpend: SafeToSpendService,
    private paydayPlan: PaydayPlanService,
  ) {}

  @Get()
  getState(@CurrentUser() user: { sub: string }) {
    return this.budget.getState(user.sub);
  }

  @Get('safe-to-spend')
  calculateSafeToSpend(@CurrentUser() user: { sub: string }) {
    return this.safeToSpend.calculate(user.sub);
  }

  @Get('payday-plan')
  getPaydayPlan(@CurrentUser() user: { sub: string }) {
    return this.paydayPlan.getPlan(user.sub);
  }

  @Post('payday-plan')
  savePaydayPlan(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.paydayPlan.savePlan(user.sub, {
      currentBalance: body.currentBalance as number | undefined,
      paydayDate: body.paydayDate as string | null | undefined,
      expectedPaydayAmount: body.expectedPaydayAmount as number | undefined,
      rentDueDate: body.rentDueDate as string | null | undefined,
      rentAmount: body.rentAmount as number | undefined,
      spendingBuffer: body.spendingBuffer as number | undefined,
    });
  }

  @Post('bills')
  createBill(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.budget.createBill(user.sub, body);
  }

  @Post('balance')
  updateBalance(
    @CurrentUser() user: { sub: string },
    @Body('balance') balance: number,
  ) {
    return this.budget.updateBalance(user.sub, balance);
  }
}
