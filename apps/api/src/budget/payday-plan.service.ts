import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@neurolife/database';
import { PROTECTED_BILL_CATEGORIES } from '@neurolife/shared';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../common/audit.service';

export interface PaydayPlanInput {
  currentBalance?: number;
  paydayDate?: string | null;
  expectedPaydayAmount?: number;
  rentDueDate?: string | null;
  rentAmount?: number;
  spendingBuffer?: number;
}

export interface PaydayPlanResult {
  currentBalance: number;
  paydayDate: string | null;
  expectedPaydayAmount: number;
  rentDueDate: string | null;
  rentAmount: number;
  spendingBuffer: number;
  daysUntilPayday: number | null;
  daysUntilRent: number | null;
  protectedMoney: number;
  safeToSpend: number;
  shortageOrSurplus: number;
  budgetRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tinyNextAction: string;
  upcomingBills: Array<{
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    category: string;
  }>;
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

@Injectable()
export class PaydayPlanService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  async getPlan(userId: string): Promise<PaydayPlanResult> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    const bills = await this.prisma.bill.findMany({
      where: { userId, isPaid: false, deletedAt: null },
      orderBy: { dueDate: 'asc' },
    });

    return this.buildPlan(
      {
        currentBalance: profile.currentBalance,
        paydayDate: profile.paydayDate?.toISOString() ?? null,
        expectedPaydayAmount: profile.expectedPaydayAmount,
        rentDueDate: profile.rentDueDate?.toISOString() ?? null,
        rentAmount: profile.rentAmount,
        spendingBuffer: profile.spendingBuffer,
      },
      bills,
    );
  }

  async savePlan(userId: string, input: PaydayPlanInput): Promise<PaydayPlanResult> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Profile not found');

    await this.prisma.profile.update({
      where: { userId },
      data: {
        currentBalance: input.currentBalance ?? profile.currentBalance,
        paydayDate: input.paydayDate ? new Date(input.paydayDate) : input.paydayDate === null ? null : undefined,
        expectedPaydayAmount: input.expectedPaydayAmount ?? profile.expectedPaydayAmount,
        rentDueDate: input.rentDueDate ? new Date(input.rentDueDate) : input.rentDueDate === null ? null : undefined,
        rentAmount: input.rentAmount ?? profile.rentAmount,
        spendingBuffer: input.spendingBuffer ?? profile.spendingBuffer,
      },
    });

    await this.audit.log(userId, 'UPDATE', 'payday_plan', userId, input as Prisma.InputJsonValue);
    return this.getPlan(userId);
  }

  private buildPlan(
    profile: {
      currentBalance: number;
      paydayDate: string | null;
      expectedPaydayAmount: number;
      rentDueDate: string | null;
      rentAmount: number;
      spendingBuffer: number;
    },
    bills: Array<{ id: string; name: string; amount: number; dueDate: Date; category: string; isProtected: boolean }>,
  ): PaydayPlanResult {
    const now = new Date();
    const payday = profile.paydayDate ? new Date(profile.paydayDate) : null;
    const rentDue = profile.rentDueDate ? new Date(profile.rentDueDate) : null;

    const daysUntilPayday = payday ? daysBetween(now, payday) : null;
    const daysUntilRent = rentDue ? daysBetween(now, rentDue) : null;

    const horizon = payday ?? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const upcomingBills = bills.filter((b) => b.dueDate <= horizon);

    const protectedBillTotal = upcomingBills
      .filter(
        (b) =>
          b.isProtected ||
          PROTECTED_BILL_CATEGORIES.some((cat) => b.category.toLowerCase().includes(cat)),
      )
      .reduce((sum, b) => sum + b.amount, 0);

    const rentInHorizon =
      rentDue && rentDue <= horizon && profile.rentAmount > 0 ? profile.rentAmount : 0;

    const protectedMoney = rentInHorizon + profile.spendingBuffer + protectedBillTotal;
    const safeToSpend = Math.max(0, profile.currentBalance - protectedMoney);

    const obligationsUntilPayday =
      rentInHorizon +
      profile.spendingBuffer +
      upcomingBills.reduce((sum, b) => sum + b.amount, 0);

    const projectedFunds = profile.currentBalance + profile.expectedPaydayAmount;
    const shortageOrSurplus = projectedFunds - obligationsUntilPayday;

    let budgetRiskLevel: PaydayPlanResult['budgetRiskLevel'] = 'LOW';
    if (safeToSpend <= 0 || shortageOrSurplus < 0) budgetRiskLevel = 'CRITICAL';
    else if (safeToSpend < 50 || shortageOrSurplus < 50) budgetRiskLevel = 'HIGH';
    else if (safeToSpend < 200) budgetRiskLevel = 'MEDIUM';

    const nextBill = upcomingBills[0];
    let tinyNextAction = 'Set your payday date and expected amount.';
    if (shortageOrSurplus < 0) {
      tinyNextAction = `You're short about $${Math.abs(shortageOrSurplus).toFixed(0)} before payday — review protected bills.`;
    } else if (nextBill) {
      tinyNextAction = `Note that ${nextBill.name} ($${nextBill.amount}) is due ${daysBetween(now, nextBill.dueDate)} day(s) out.`;
    } else if (!payday) {
      tinyNextAction = 'Add your next payday date to see the full plan.';
    } else {
      tinyNextAction = `You have about $${safeToSpend.toFixed(0)} safe to spend after essentials.`;
    }

    return {
      currentBalance: profile.currentBalance,
      paydayDate: profile.paydayDate,
      expectedPaydayAmount: profile.expectedPaydayAmount,
      rentDueDate: profile.rentDueDate,
      rentAmount: profile.rentAmount,
      spendingBuffer: profile.spendingBuffer,
      daysUntilPayday,
      daysUntilRent,
      protectedMoney,
      safeToSpend,
      shortageOrSurplus,
      budgetRiskLevel,
      tinyNextAction,
      upcomingBills: upcomingBills.map((b) => ({
        id: b.id,
        name: b.name,
        amount: b.amount,
        dueDate: b.dueDate.toISOString(),
        category: b.category,
      })),
    };
  }
}
