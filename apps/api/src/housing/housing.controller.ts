import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { HousingService } from './housing.service';

@Controller('housing')
@UseGuards(JwtAuthGuard)
export class HousingController {
  constructor(private housing: HousingService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.housing.list(user.sub);
  }

  @Get('rent-countdown')
  rentCountdown(@CurrentUser() user: { sub: string }) {
    return this.housing.getRentCountdown(user.sub);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.housing.create(user.sub, body);
  }
}
