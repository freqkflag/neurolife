import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { AppointmentsService } from './appointments.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointments: AppointmentsService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.appointments.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.appointments.create(user.sub, body);
  }

  @Get(':id/prep')
  prep(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.appointments.generatePrep(user.sub, id);
  }
}
