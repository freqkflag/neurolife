import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { CapacityService } from './capacity.service';

@Controller('capacity')
@UseGuards(JwtAuthGuard)
export class CapacityController {
  constructor(private capacity: CapacityService) {}

  @Get()
  getLatest(@CurrentUser() user: { sub: string }) {
    return this.capacity.getLatest(user.sub);
  }

  @Post()
  recordCapacity(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.capacity.recordCapacity(user.sub, body);
  }

  @Post('sensory')
  recordSensory(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.capacity.recordSensory(user.sub, body);
  }
}
