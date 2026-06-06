import { Module } from '@nestjs/common';
import { CapacityController } from './capacity.controller';
import { CapacityService } from './capacity.service';

@Module({
  controllers: [CapacityController],
  providers: [CapacityService],
})
export class CapacityModule {}
