import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { FoodService } from './food.service';

@Controller('food')
@UseGuards(JwtAuthGuard)
export class FoodController {
  constructor(private food: FoodService) {}

  @Get('pantry')
  pantry(@CurrentUser() user: { sub: string }) {
    return this.food.getPantry(user.sub);
  }

  @Get('groceries')
  groceries(@CurrentUser() user: { sub: string }) {
    return this.food.getGroceryList(user.sub);
  }

  @Get('meals')
  meals(@CurrentUser() user: { sub: string }) {
    return this.food.getMealPlans(user.sub);
  }

  @Get('low-spoon')
  lowSpoon() {
    return this.food.suggestLowSpoonMeal();
  }

  @Post('groceries')
  addGrocery(@CurrentUser() user: { sub: string }, @Body('name') name: string) {
    return this.food.addGroceryItem(user.sub, name);
  }
}
