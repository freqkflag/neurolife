import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FoodService {
  constructor(private prisma: PrismaService) {}

  async getPantry(userId: string) {
    return this.prisma.foodItem.findMany({ where: { userId, inPantry: true } });
  }

  async getGroceryList(userId: string) {
    return this.prisma.groceryItem.findMany({
      where: { userId, isPurchased: false },
    });
  }

  async getMealPlans(userId: string) {
    return this.prisma.mealPlan.findMany({ where: { userId } });
  }

  async addGroceryItem(userId: string, name: string) {
    return this.prisma.groceryItem.create({ data: { userId, name } });
  }

  async suggestLowSpoonMeal() {
    return {
      suggestion: 'Microwave mac and cheese or toast with peanut butter',
      spoonLevel: 1,
      tinyNextAction: 'Put one easy food within reach.',
    };
  }
}
