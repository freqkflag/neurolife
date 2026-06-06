import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';

@Injectable()
export class BudgetService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getState(userId: string) {
    const [profile, bills, subscriptions, debts, incomeSources, transactions] =
      await Promise.all([
        this.prisma.profile.findUnique({ where: { userId } }),
        this.prisma.bill.findMany({ where: { userId, deletedAt: null } }),
        this.prisma.subscription.findMany({ where: { userId, deletedAt: null } }),
        this.prisma.debt.findMany({ where: { userId, deletedAt: null } }),
        this.prisma.incomeSource.findMany({ where: { userId, deletedAt: null } }),
        this.prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 50,
        }),
      ]);

    return {
      currentBalance: profile?.currentBalance ?? 0,
      safeToSpend: profile?.safeToSpend ?? 0,
      paydayDate: profile?.paydayDate,
      rentDueDate: profile?.rentDueDate,
      budgetRiskLevel: profile?.budgetRiskLevel ?? 'LOW',
      moneyStressLevel: profile?.moneyStressLevel ?? 0,
      bills,
      subscriptions,
      debts,
      incomeSources,
      transactions,
    };
  }

  async createBill(userId: string, data: Record<string, unknown>) {
    const bill = await this.prisma.bill.create({
      data: {
        userId,
        name: data.name as string,
        amount: data.amount as number,
        dueDate: new Date(data.dueDate as string),
        category: (data.category as string) ?? 'general',
        isProtected: (data.isProtected as boolean) ?? false,
        priority: (data.priority as number) ?? 5,
      },
    });
    await this.audit.log(userId, 'CREATE', 'bill', bill.id);
    return bill;
  }

  async updateBalance(userId: string, balance: number) {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.profile.update({
      where: { userId },
      data: { currentBalance: balance },
    });
    await this.audit.log(userId, 'UPDATE', 'balance', userId, { balance });
    return { currentBalance: balance };
  }
}
