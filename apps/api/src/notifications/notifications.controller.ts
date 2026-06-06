import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notifications: NotificationsService) {}

  @Get('rules')
  getRules(@CurrentUser() user: { sub: string }) {
    return this.notifications.getRules(user.sub);
  }

  @Patch('rules')
  updateRule(
    @CurrentUser() user: { sub: string },
    @Body() body: { type: string; enabled: boolean },
  ) {
    return this.notifications.updateRule(user.sub, body.type, body.enabled);
  }

  @Post('snooze')
  snooze(
    @CurrentUser() user: { sub: string },
    @Body() body: { type: string; minutes: number },
  ) {
    return this.notifications.snooze(user.sub, body.type, body.minutes ?? 5);
  }
}
