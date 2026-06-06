import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolveEnvFilePaths } from './config/env-paths';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { AuthModule } from './auth/auth.module';
import { BudgetModule } from './budget/budget.module';
import { CapacityModule } from './capacity/capacity.module';
import { DocumentsModule } from './documents/documents.module';
import { FoodModule } from './food/food.module';
import { HousingModule } from './housing/housing.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { SyncModule } from './sync/sync.module';
import { TasksModule } from './tasks/tasks.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePaths(),
    }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    CapacityModule,
    TasksModule,
    BudgetModule,
    DocumentsModule,
    AdminModule,
    AppointmentsModule,
    FoodModule,
    HousingModule,
    AiModule,
    SyncModule,
    NotificationsModule,
    HealthModule,
  ],
})
export class AppModule {}
