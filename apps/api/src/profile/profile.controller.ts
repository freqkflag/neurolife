import { Body, Controller, Delete, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private profile: ProfileService) {}

  @Get()
  get(@CurrentUser() user: { sub: string }) {
    return this.profile.get(user.sub);
  }

  @Patch()
  update(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.profile.update(user.sub, body);
  }

  @Post('export')
  exportData(@CurrentUser() user: { sub: string }) {
    return this.profile.exportData(user.sub);
  }

  @Delete()
  deleteAccount(@CurrentUser() user: { sub: string }) {
    return this.profile.deleteAccount(user.sub);
  }
}
