import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/user.decorator';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  list(@CurrentUser() user: { sub: string }) {
    return this.tasks.list(user.sub);
  }

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.tasks.create(user.sub, body);
  }

  @Patch(':id/complete')
  complete(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.tasks.complete(user.sub, id);
  }

  @Get('routines')
  listRoutines(@CurrentUser() user: { sub: string }) {
    return this.tasks.listRoutines(user.sub);
  }

  @Post('routines')
  createRoutine(@CurrentUser() user: { sub: string }, @Body() body: Record<string, unknown>) {
    return this.tasks.createRoutine(user.sub, body);
  }
}
