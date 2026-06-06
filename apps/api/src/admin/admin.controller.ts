import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private admin: AdminService) {}

  @Get('tasks')
  listTasks(@CurrentUser() user: { sub: string }) {
    return this.admin.listTasks(user.sub);
  }

  @Post('tasks')
  createTask(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.admin.createTask(user.sub, body);
  }

  @Get('disability')
  listNotes(@CurrentUser() user: { sub: string }) {
    return this.admin.listDisabilityNotes(user.sub);
  }

  @Post('disability')
  createNote(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.admin.createDisabilityNote(user.sub, body);
  }
}
