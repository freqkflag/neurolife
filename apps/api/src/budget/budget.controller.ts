import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BudgetService } from './budget.service';
import { SafeToSpendService } from './safe-to-spend.service';

@Controller('budget')
@UseGuards(JwtAuthGuard)
export class BudgetController {
  constructor(
    private budget: BudgetService,
    private safeToSpend: SafeToSpendService,
  ) {}

  @Get()
  getState(@CurrentUser() user: { sub: string }) {
    return this.budget.getState(user.sub);
  }

  @Get('safe-to-spend')
  calculateSafeToSpend(@CurrentUser() user: { sub: string }) {
    return this.safeToSpend.calculate(user.sub);
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
