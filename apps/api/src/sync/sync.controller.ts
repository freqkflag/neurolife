import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import type { SyncMutation } from '@neurolife/sync';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { SyncService } from './sync.service';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private sync: SyncService) {}

  @Get('delta')
  pull(@CurrentUser() user: { sub: string }, @Query('since') since: string) {
    return this.sync.pull(user.sub, since ?? '1970-01-01');
  }

  @Post('push')
  push(@CurrentUser() user: { sub: string }, @Body() body: { mutations: SyncMutation[] }) {
    return this.sync.push(user.sub, body.mutations);
  }
}
