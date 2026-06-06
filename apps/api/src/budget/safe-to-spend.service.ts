import { Injectable } from '@nestjs/common';
import { PROTECTED_BILL_CATEGORIES } from '@neurolife/shared';
import { PrismaService } from '../prisma/prisma.service';

export interface SafeToSpendResult {
  currentBalance: number;
  protectedAmount: number;
  safeToSpend: number;
  budgetRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tinyNextAction: string;
  summary: string;
}

@Injectable()
export class SafeToSpendService {
  constructor(private prisma: PrismaService) {}

  async calculate(userId: string): Promise<SafeToSpendResult> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    const bills = await this.prisma.bill.findMany({
      where: { userId, isPaid: false, deletedAt: null },
      orderBy: { dueDate: 'asc' },
    });

    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const upcomingBills = bills.filter((b) => b.dueDate <= thirtyDays);
    const protectedBills = upcomingBills.filter(
      (b) =>
        b.isProtected ||
        PROTECTED_BILL_CATEGORIES.some((cat) =>
          b.category.toLowerCase().includes(cat),
        ),
    );

    const protectedAmount = protectedBills.reduce((sum, b) => sum + b.amount, 0);
    const currentBalance = profile?.currentBalance ?? 0;
    const safeToSpend = Math.max(0, currentBalance - protectedAmount);

    let budgetRiskLevel: SafeToSpendResult['budgetRiskLevel'] = 'LOW';
    if (safeToSpend <= 0) budgetRiskLevel = 'CRITICAL';
    else if (safeToSpend < 50) budgetRiskLevel = 'HIGH';
    else if (safeToSpend < 200) budgetRiskLevel = 'MEDIUM';

    const nextBill = upcomingBills[0];
    const tinyNextAction = nextBill
      ? `Note that ${nextBill.name} ($${nextBill.amount}) is due soon.`
      : 'You have no urgent bills — check if anything needs updating.';

    const summary = `You have $${safeToSpend.toFixed(2)} safe to spend after protecting essentials.`;

    if (profile) {
      await this.prisma.profile.update({
        where: { userId },
        data: { safeToSpend, budgetRiskLevel },
      });
    }

    return {
      currentBalance,
      protectedAmount,
      safeToSpend,
      budgetRiskLevel,
      tinyNextAction,
      summary,
    };
  }
}
